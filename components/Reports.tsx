
import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileText, DownloadCloud } from 'lucide-react';
import { useAuth } from '../App';
import { dataService } from '../services/dataService';
import { Sale } from '../types';

const Reports: React.FC = () => {
  // Fix: Access authentication context to get current company info
  const { company } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState('Today');

  useEffect(() => {
    // Fix: Pass company.id to getSales (line 12 fix)
    if (company) {
      setSales(dataService.getSales(company.id));
    }
  }, [company]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalItems = sales.reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  const exportCSV = () => {
    const headers = ['Invoice #', 'Customer', 'Amount', 'Paid', 'Balance', 'Date'];
    const rows = sales.map(s => [
      s.invoice_number,
      s.customer_name,
      s.total_amount,
      s.paid_amount,
      s.balance,
      new Date(s.created_at).toLocaleDateString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500">Review sales performance and download history</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {['Today', 'Weekly', 'Monthly', 'Yearly'].map(range => (
              <button 
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  dateRange === range ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all"
          >
            <DownloadCloud size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Period Revenue</p>
          <h3 className="text-3xl font-black text-slate-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Items Sold</p>
          <h3 className="text-3xl font-black text-slate-900">{totalItems} <span className="text-sm font-medium text-slate-400">units</span></h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Order Value</p>
          <h3 className="text-3xl font-black text-slate-900">${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Detailed Transaction Log</h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-slate-600"><Filter size={18} /></button>
            <button className="p-2 text-slate-400 hover:text-slate-600"><Calendar size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-indigo-600">{sale.invoice_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{sale.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{sale.items?.length || 0}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">${sale.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    {sale.balance > 0 ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">UNPAID</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">PAID</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
