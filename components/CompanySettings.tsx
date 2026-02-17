
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  Building, 
  CreditCard, 
  History, 
  Shield, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { SubscriptionPlan, AuditLog, User, UserRole } from '../types';

const CompanySettings: React.FC = () => {
  const { company, user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'billing' | 'audit' | 'team'>('billing');
  const [team, setTeam] = useState<User[]>([]);

  useEffect(() => {
    if (company) {
      setLogs(dataService.getAuditLogs(company.id));
      setTeam(dataService.getUsers(company.id));
    }
  }, [company]);

  const plans = [
    { name: SubscriptionPlan.FREE, price: '$0', features: ['Up to 50 sales/mo', '10 Products', 'Standard POS'] },
    { name: SubscriptionPlan.PRO, price: '$49', features: ['Unlimited sales', 'Unlimited Products', 'AI Insights', 'Advanced Reports'] },
    { name: SubscriptionPlan.ENTERPRISE, price: 'Custom', features: ['Multi-location', 'Role Permissions', 'Dedicated Support', 'SLA'] }
  ];

  if (!company) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Workspace Settings</h1>
        <p className="text-slate-500 font-medium">Manage your subscription, team, and security</p>
      </div>

      <div className="flex space-x-2 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner">
        <button 
          onClick={() => setActiveTab('billing')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'billing' ? 'bg-white text-indigo-600 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Billing & Plans
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'bg-white text-indigo-600 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Team Members
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-white text-indigo-600 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Audit Logs
        </button>
      </div>

      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((p) => (
            <div key={p.name} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all group hover:shadow-2xl hover:-translate-y-2 ${company.plan === p.name ? 'border-indigo-600 ring-4 ring-indigo-500/5 shadow-xl' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{p.name} PLAN</p>
                {company.plan === p.name && (
                  <div className="bg-indigo-600 p-1.5 rounded-full text-white shadow-lg shadow-indigo-500/20">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
              
              <div className="mb-8">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{p.price}<span className="text-lg text-slate-400 font-bold">/mo</span></h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">For scaling enterprises</p>
              </div>

              <div className="space-y-4 mb-10">
                {p.features.map(f => (
                  <div key={f} className="flex items-center space-x-3 text-sm font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button 
                disabled={company.plan === p.name}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${company.plan === p.name ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10'}`}
              >
                {company.plan === p.name ? 'Active Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Active Members</h2>
              <p className="text-sm text-slate-500 font-medium">Currently on {company.name} workspace</p>
            </div>
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all">
              <UserPlus size={14} />
              <span>Invite Member</span>
            </button>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {team.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">{m.name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100">{m.role}</span>
                    <button className="text-slate-300 hover:text-slate-600"><Shield size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">Security & Audit Logs</h2>
            <p className="text-sm text-slate-500 font-medium">Immutable history of workspace operations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{log.user_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        log.action === 'DELETE' ? 'bg-rose-50 text-rose-600' :
                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{log.resource}</td>
                    <td className="px-8 py-4 text-xs font-medium text-slate-400">{log.details}</td>
                    <td className="px-8 py-4 text-right text-[10px] font-bold text-slate-300">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
