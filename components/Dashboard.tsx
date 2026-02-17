
import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { 
  DollarSign, 
  Users, 
  Package, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { dataService } from '../services/dataService';
import { geminiService } from '../services/geminiService';
import { DashboardStats } from '../types';

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: string; 
  trendUp?: boolean;
  color: string;
}> = ({ title, value, icon: Icon, trend, trendUp, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-3 tracking-tighter">{value}</h3>
        {trend && (
          <div className={`flex items-center mt-3 text-[10px] font-black uppercase tracking-wider ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendUp ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
            {trend}
          </div>
        )}
      </div>
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { company } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('Crunching real-time enterprise data...');

  useEffect(() => {
    if (company) {
      const data = dataService.getDashboardStats(company.id);
      setStats(data);

      const fetchAi = async () => {
        const products = dataService.getProducts(company.id);
        const sales = dataService.getSales(company.id);
        const insight = await geminiService.getSalesInsights(sales, products);
        setAiInsight(insight);
      };
      fetchAi();
    }
  }, [company]);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
            <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-indigo-500/20 tracking-widest flex items-center space-x-1.5">
              <Zap size={10} fill="currentColor" />
              <span>SaaS Live</span>
            </div>
          </div>
          <p className="text-slate-500 font-medium">Real-time metrics for <span className="text-indigo-600 font-bold">{company?.name}</span></p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex flex-col items-end mr-4">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Workspace Usage</span>
             <div className="w-32 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-indigo-500 w-[65%]"></div>
             </div>
          </div>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10 hover:bg-black active:scale-95 transition-all">
            Export Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily Sales" 
          value={`$${stats.todaySales.toFixed(2)}`} 
          icon={DollarSign} 
          trend="+18% vs Yesterday"
          trendUp={true}
          color="bg-indigo-600"
        />
        <StatCard 
          title="Active Clients" 
          value={stats.totalCustomers} 
          icon={Users} 
          trend="+4 This Week"
          trendUp={true}
          color="bg-sky-600"
        />
        <StatCard 
          title="Monthly Growth" 
          value={`$${stats.monthlyRevenue.toFixed(2)}`} 
          icon={TrendingUp} 
          trend="Target: $10k"
          trendUp={true}
          color="bg-emerald-600"
        />
        <StatCard 
          title="Inventory Assets" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Revenue Trajectory</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">7-Day Analysis</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner">
               <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white rounded-lg shadow-sm">Sales</button>
               <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Profit</button>
            </div>
          </div>
          <div className="h-[350px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{stroke: '#4f46e5', strokeWidth: 1}}
                  contentStyle={{borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-indigo-500/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={120} />
            </div>
            <div className="flex items-center space-x-3 mb-6 relative z-10">
              <div className="p-2.5 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">AI Sales Copilot</h3>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Active Insight Engine</p>
              </div>
            </div>
            <div className="text-slate-300 text-sm font-medium leading-relaxed space-y-4 relative z-10">
              {aiInsight.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="flex items-start space-x-3">
                   <div className="w-1 h-1 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
                   <p>{line}</p>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 relative z-10">
              Generate Deep Forecast
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">System Health</h2>
              <div className="flex space-x-1">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-4">
              {stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div>
                      <p className="text-xs font-black text-slate-800 tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Low Stock Alert</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">{item.stock_quantity} left</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center">
                   <div className="p-4 bg-emerald-50 w-fit mx-auto rounded-full mb-3">
                      <TrendingUp size={24} className="text-emerald-500" />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Optimized</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
