import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("store.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'quincaillerie' or 'electromenager'
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    seller_role TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Seed data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare("INSERT INTO products (name, category, price, stock, description) VALUES (?, ?, ?, ?, ?)");
  insert.run("Marteau", "quincaillerie", 15.50, 50, "Marteau de charpentier robuste");
  insert.run("Tournevis Jeu", "quincaillerie", 25.00, 30, "Ensemble de 6 tournevis");
  insert.run("Réfrigérateur Samsung", "electromenager", 850.00, 5, "Réfrigérateur 400L A++");
  insert.run("Micro-ondes LG", "electromenager", 120.00, 10, "Micro-ondes 20L 800W");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  
  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, category, price, stock, description } = req.body;
    const info = db.prepare("INSERT INTO products (name, category, price, stock, description) VALUES (?, ?, ?, ?, ?)")
      .run(name, category, price, stock, description);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, category, price, stock, description } = req.body;
    db.prepare("UPDATE products SET name = ?, category = ?, price = ?, stock = ?, description = ? WHERE id = ?")
      .run(name, category, price, stock, description, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Sales
  app.post("/api/sales", (req, res) => {
    const { productId, quantity, sellerRole } = req.body;
    
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as any;
    if (!product || product.stock < quantity) {
      return res.status(400).json({ error: "Stock insuffisant" });
    }

    const totalPrice = product.price * quantity;
    
    const transaction = db.transaction(() => {
      db.prepare("INSERT INTO sales (product_id, quantity, total_price, seller_role) VALUES (?, ?, ?, ?)")
        .run(productId, quantity, totalPrice, sellerRole);
      db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?")
        .run(quantity, productId);
    });

    transaction();
    res.json({ success: true, totalPrice });
  });

  app.get("/api/sales", (req, res) => {
    const sales = db.prepare(`
      SELECT s.*, p.name as product_name 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      ORDER BY s.sale_date DESC
    `).all();
    res.json(sales);
  });

  // Stats
  app.get("/api/stats", (req, res) => {
    const dailySales = db.prepare(`
      SELECT DATE(sale_date) as date, SUM(total_price) as total 
      FROM sales 
      GROUP BY DATE(sale_date) 
      ORDER BY date ASC 
      LIMIT 30
    `).all();

    const categoryStats = db.prepare(`
      SELECT p.category, SUM(s.total_price) as total 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      GROUP BY p.category
    `).all();

    const topProducts = db.prepare(`
      SELECT p.name, SUM(s.quantity) as total_sold 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      GROUP BY p.id 
      ORDER BY total_sold DESC 
      LIMIT 5
    `).all();

    res.json({ dailyWeight: dailySales, categoryWeight: categoryStats, topProducts });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
