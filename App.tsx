
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
  User as UserIcon
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import SalesSystem from './components/SalesSystem';
import Reports from './components/Reports';
import { dataService } from './services/dataService';
import { User, UserRole } from './types';

// Context for Authentication
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Layout Component
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'POS / Sales', path: '/sales', icon: ShoppingCart },
    // Only Admin can see Reports
    ...(user?.role === UserRole.ADMIN ? [{ name: 'Reports', path: '/reports', icon: BarChart3 }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">N</div>
              <span className="text-xl font-bold tracking-tight text-white">NexusERP</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 mb-4 px-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold border-2 border-slate-600 text-white">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                <div className="flex items-center space-x-1 text-white">
                  {user?.role === UserRole.ADMIN ? <ShieldCheck size={12} className="text-indigo-400" /> : <UserIcon size={12} className="text-slate-500" />}
                  <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 space-x-2">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-64"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

// Unified Auth Page (Login & Register) - Updated to a "Black" theme
const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('admin@nexus.erp');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const success = await login(email, password);
        if (!success) setError('Invalid email or password');
      } else {
        if (!name || !email) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        await register(name, email, role);
        setIsLogin(true); // Switch to login after registration
        setEmail(email);
        setPassword('');
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 font-inter">
      <div className="w-full max-w-lg">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-[0_0_30px_rgba(79,70,229,0.3)] rotate-3">N</div>
          <h1 className="text-3xl font-black text-white tracking-tight">NexusERP</h1>
          <p className="text-slate-500 font-medium">Enterprise Sales & Inventory Management</p>
        </div>

        {/* Auth Card - Now in sleek Black */}
        <div className="bg-[#121216] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-5 text-sm font-bold transition-all flex items-center justify-center space-x-2 ${isLogin ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500' : 'text-slate-500 bg-transparent hover:bg-slate-800/50'}`}
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-5 text-sm font-bold transition-all flex items-center justify-center space-x-2 ${!isLogin ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500' : 'text-slate-500 bg-transparent hover:bg-slate-800/50'}`}
            >
              <UserPlus size={18} />
              <span>Register</span>
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-6">{isLogin ? 'Sign in to your account' : 'Create new account'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-500/10 text-rose-400 text-sm rounded-xl border border-rose-500/20 flex items-center space-x-3 animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  {isLogin && <button type="button" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Forgot?</button>}
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setRole(UserRole.STAFF)}
                      className={`py-3.5 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center space-x-2 ${role === UserRole.STAFF ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-500 bg-transparent hover:bg-slate-800'}`}
                    >
                      <UserIcon size={16} />
                      <span>Staff</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole(UserRole.ADMIN)}
                      className={`py-3.5 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center space-x-2 ${role === UserRole.ADMIN ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-500 bg-transparent hover:bg-slate-800'}`}
                    >
                      <ShieldCheck size={16} />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In Now' : 'Create Account'}</span>
                    <ArrowUpRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
             <div className="h-[1px] w-12 bg-slate-800"></div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Demo Credentials</p>
             <div className="h-[1px] w-12 bg-slate-800"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-2 bg-indigo-500/5 text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-tighter border border-indigo-500/20">Admin: admin@nexus.erp / password</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <MainLayout>{children}</MainLayout>;
};

// App Component with Auth Provider
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dataService.init();
    const stored = localStorage.getItem('erp_auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('erp_auth_user');
      }
    }
    setIsInitializing(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Simulate API call check
    const users = dataService.getUsers();
    
    // For demo convenience, always allow admin@nexus.erp / password
    if (email === 'admin@nexus.erp' && pass === 'password') {
       const adminUser = users.find(u => u.email === email) || users[0];
       setUser(adminUser);
       localStorage.setItem('erp_auth_user', JSON.stringify(adminUser));
       return true;
    }

    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('erp_auth_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, role: UserRole): Promise<void> => {
    dataService.registerUser(name, email, role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_auth_user');
  };

  if (isInitializing) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0c]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold animate-pulse">Initializing NexusERP...</p>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SalesSystem /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
