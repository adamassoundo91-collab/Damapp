import React, { useState, useEffect } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useLocation
} from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Users, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Hammer,
  Tv
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Product {
  id: number;
  name: string;
  category: 'quincaillerie' | 'electromenager';
  price: number;
  stock: number;
  description: string;
}

interface Sale {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  sale_date: string;
  seller_role: string;
}

interface Stats {
  dailyWeight: { date: string; total: number }[];
  categoryWeight: { category: string; total: number }[];
  topProducts: { name: string; total_sold: number }[];
}

type Role = "admin" | "vendeur";

// --- Components ---

const Sidebar = ({ role, setRole }: { role: Role, setRole: (r: Role) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Tableau de Bord", roles: ["admin"] },
    { path: "/produits", icon: Package, label: "Inventaire", roles: ["admin", "vendeur"] },
    { path: "/ventes", icon: ShoppingCart, label: "Nouvelle Vente", roles: ["admin", "vendeur"] },
    { path: "/historique", icon: History, label: "Historique", roles: ["admin"] },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800">
      <div className="p-6 border-bottom border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Hammer className="text-emerald-500" />
          <span>QuincaPro</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Gestion de Stock & Ventes</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.filter(item => item.roles.includes(role)).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              location.pathname === item.path 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold capitalize">{role}</p>
              <p className="text-xs text-slate-400">Session active</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setRole(role === "admin" ? "vendeur" : "admin");
              navigate("/");
            }}
            className="w-full py-2 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Changer de rôle
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) return <div className="p-8 text-slate-500">Chargement des statistiques...</div>;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Tableau de Bord</h2>
        <p className="text-slate-500">Vue d'ensemble de votre activité commerciale.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Ventes Totales</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {stats.dailyWeight.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()} €
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Articles Vendus</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {stats.topProducts.reduce((acc, curr) => acc + curr.total_sold, 0)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Performance Catégories</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {stats.categoryWeight.length} Secteurs
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Évolution des Ventes</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyWeight}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Répartition par Catégorie</h4>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryWeight}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="category"
                >
                  {stats.categoryWeight.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ role }: { role: Role }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = () => {
    fetch("/api/products")
      .then(res => res.json())
      .then(setProducts);
  };

  useEffect(fetchProducts, []);

  const handleDelete = (id: number) => {
    if (confirm("Supprimer ce produit ?")) {
      fetch(`/api/products/${id}`, { method: "DELETE" }).then(fetchProducts);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Inventaire</h2>
          <p className="text-slate-500">Gérez vos articles de quincaillerie et électroménager.</p>
        </div>
        {role === "admin" && (
          <button 
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus size={20} />
            Ajouter un Produit
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Stock</th>
              {role === "admin" && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      product.category === 'quincaillerie' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {product.category === 'quincaillerie' ? <Hammer size={18} /> : <Tv size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                    product.category === 'quincaillerie' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{product.price.toFixed(2)} €</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="font-medium">{product.stock}</span>
                  </div>
                </td>
                {role === "admin" && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProduct(product); setShowModal(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {editingProduct ? "Modifier le Produit" : "Ajouter un Produit"}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              const method = editingProduct ? "PUT" : "POST";
              const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
              
              fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
              }).then(() => {
                setShowModal(false);
                fetchProducts();
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom</label>
                <input name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Catégorie</label>
                <select name="category" defaultValue={editingProduct?.category} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="quincaillerie">Quincaillerie</option>
                  <option value="electromenager">Électroménager</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Prix (€)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stock</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea name="description" defaultValue={editingProduct?.description} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SalesPOS = ({ role }: { role: Role }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(setProducts);
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const handleCheckout = async () => {
    for (const item of cart) {
      await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.product.id,
          quantity: item.quantity,
          sellerRole: role
        })
      });
    }
    setCart([]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    fetch("/api/products").then(res => res.json()).then(setProducts);
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="p-8 flex gap-8 h-[calc(100vh-2rem)] overflow-hidden">
      <div className="flex-1 flex flex-col">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Nouvelle Vente</h2>
          <p className="text-slate-500">Sélectionnez les articles à ajouter au panier.</p>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un article..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2 flex-1">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
            <button
              key={product.id}
              disabled={product.stock <= 0}
              onClick={() => addToCart(product)}
              className={cn(
                "p-4 bg-white rounded-2xl border border-slate-100 text-left transition-all hover:shadow-md active:scale-[0.98] group relative",
                product.stock <= 0 ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-emerald-200"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
                product.category === 'quincaillerie' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
              )}>
                {product.category === 'quincaillerie' ? <Hammer size={24} /> : <Tv size={24} />}
              </div>
              <h4 className="font-bold text-slate-900">{product.name}</h4>
              <p className="text-xs text-slate-500 mb-2 line-clamp-1">{product.description}</p>
              <div className="flex justify-between items-end">
                <span className="text-lg font-black text-emerald-600">{product.price.toFixed(2)} €</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  product.stock > 10 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  Stock: {product.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-96 bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-600" />
            Panier
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <ShoppingCart size={64} />
              <p className="font-medium">Votre panier est vide</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-4 group">
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{item.product.name}</p>
                  <p className="text-xs text-slate-500">{item.quantity} x {item.product.price.toFixed(2)} €</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{(item.product.price * item.quantity).toFixed(2)} €</span>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 space-y-4">
          <div className="flex justify-between items-center text-slate-500 text-sm">
            <span>Sous-total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center text-slate-900 font-black text-xl">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 size={18} />
              Vente enregistrée avec succès !
            </div>
          )}

          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            Confirmer la Vente
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryList = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetch("/api/sales").then(res => res.json()).then(setSales);
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Historique des Ventes</h2>
        <p className="text-slate-500">Consultez toutes les transactions effectuées.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">Quantité</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Vendeur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(sale.sale_date).toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">{sale.product_name}</td>
                <td className="px-6 py-4 font-medium">{sale.quantity}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">{sale.total_price.toFixed(2)} €</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                    sale.seller_role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
                  )}>
                    {sale.seller_role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [role, setRole] = useState<Role>("admin");

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar role={role} setRole={setRole} />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={role === "admin" ? <Dashboard /> : <ProductList role={role} />} />
            <Route path="/produits" element={<ProductList role={role} />} />
            <Route path="/ventes" element={<SalesPOS role={role} />} />
            <Route path="/historique" element={role === "admin" ? <HistoryList /> : <ProductList role={role} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
