
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  History,
  FileText,
  UserPlus,
  LogIn,
  ShieldCheck,
  Building,
  CreditCard,
  User as UserIcon
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import SalesSystem from './components/SalesSystem';
import Reports from './components/Reports';
import CompanySettings from './components/CompanySettings';
import { dataService } from './services/dataService';
import { User, UserRole, Company } from './types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole, companyName?: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, company, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'POS / Sales', path: '/sales', icon: ShoppingCart },
    ...(user?.role === UserRole.ADMIN ? [{ name: 'Reports', path: '/reports', icon: BarChart3 }] : []),
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">N</div>
              <span className="text-xl font-bold tracking-tight text-white">NexusERP</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-2 mb-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <Building size={14} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 truncate uppercase tracking-wider">{company?.name}</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800/50">
            <div className="flex items-center space-x-3 mb-4 px-4">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold border-2 border-slate-600 text-white">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-white">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 space-x-2">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="bg-transparent border-none focus:ring-0 text-xs w-64 text-slate-600 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-100"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</span>
              <span className="text-xs font-black text-indigo-600 uppercase">{company?.plan}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-[#fcfdfe]">
          {children}
        </main>
      </div>
    </div>
  );
};

const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('admin@nexus.erp');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const success = await login(email, password);
        if (!success) setError('Invalid credentials');
      } else {
        if (!name || !email || !companyName) {
          setError('Missing required information');
          setLoading(false);
          return;
        }
        await register(name, email, UserRole.ADMIN, companyName);
        setIsLogin(true);
        alert('Welcome! Your company workspace has been created.');
      }
    } catch (err) {
      setError('System unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl mb-4 shadow-[0_20px_40px_rgba(79,70,229,0.3)]">N</div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Nexus SaaS</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mt-2">Enterprise Multi-Company Platform</p>
        </div>

        <div className="bg-[#121216] rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-all ${isLogin ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-all ${!isLogin ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Onboard
            </button>
          </div>

          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-xl border border-rose-500/20">{error}</div>}

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Company Name</label>
                    <input 
                      type="text" required
                      className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-medium"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input 
                      type="text" required
                      className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-medium"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email</label>
                <input 
                  type="email" required
                  className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-medium"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" required
                  className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-medium"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
              >
                {loading ? 'Processing...' : (isLogin ? 'Access Hub' : 'Launch Enterprise')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <MainLayout>{children}</MainLayout>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dataService.init();
    const stored = localStorage.getItem('saas_auth_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        const c = dataService.getCompany(u.company_id);
        if (c) setCompany(c);
      } catch {
        localStorage.removeItem('saas_auth_user');
      }
    }
    setIsInitializing(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const users = dataService.getUsers();
    const found = users.find(u => u.email === email);
    if (found) {
      setUser(found);
      const c = dataService.getCompany(found.company_id);
      if (c) setCompany(c);
      localStorage.setItem('saas_auth_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, role: UserRole, companyName?: string): Promise<void> => {
    const comp = dataService.createCompany(companyName || "New Company");
    dataService.registerUser(name, email, role, comp.id);
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('saas_auth_user');
  };

  if (isInitializing) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0c]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Booting SaaS...</p>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, company, login, register, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SalesSystem /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
