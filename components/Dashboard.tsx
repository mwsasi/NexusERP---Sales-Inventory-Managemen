
import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Package, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { dataService } from '../services/dataService';
import { geminiService } from '../services/geminiService';
import { DashboardStats, Product } from '../types';

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: string; 
  trendUp?: boolean;
  color: string;
}> = ({ title, value, icon: Icon, trend, trendUp, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
        {trend && (
          <div className={`flex items-center mt-2 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
            {trend}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('Analyzing your sales data...');

  useEffect(() => {
    const data = dataService.getDashboardStats();
    setStats(data);

    // Fetch AI insights
    const fetchAi = async () => {
      const products = dataService.getProducts();
      const sales = dataService.getSales();
      const insight = await geminiService.getSalesInsights(sales, products);
      setAiInsight(insight);
    };
    fetchAi();
  }, []);

  if (!stats) return <div className="animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Real-time performance metrics and business health</p>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 font-medium shadow-sm">
            Last 24 Hours
          </span>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales" 
          value={`$${stats.todaySales.toFixed(2)}`} 
          icon={DollarSign} 
          trend="+12.5% vs yesterday"
          trendUp={true}
          color="bg-indigo-600"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          trend="+4 new this week"
          trendUp={true}
          color="bg-sky-600"
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`$${stats.monthlyRevenue.toFixed(2)}`} 
          icon={TrendingUp} 
          trend="-3.2% vs last month"
          trendUp={false}
          color="bg-emerald-600"
        />
        <StatCard 
          title="Product Inventory" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Revenue Analysis</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights & Notifications */}
        <div className="space-y-8">
          {/* AI Insights Card */}
          <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={100} />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles size={18} className="text-indigo-200" />
              </div>
              <h3 className="font-bold text-lg">AI Smart Insights</h3>
            </div>
            <div className="text-indigo-100 text-sm leading-relaxed space-y-3">
              {aiInsight.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors border border-white/20">
              Refresh Insights
            </button>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Low Stock Alerts</h2>
              <AlertCircle size={18} className="text-amber-500" />
            </div>
            <div className="space-y-4">
              {stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">Only {item.stock_quantity} left</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No low stock alerts</p>
              )}
            </div>
            {stats.lowStockItems.length > 4 && (
              <button className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700">View All Alerts</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
