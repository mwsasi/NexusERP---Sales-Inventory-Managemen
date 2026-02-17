
import React, { useState, useEffect } from 'react';
import { Plus, Search, User, MapPin, Phone, CreditCard, ExternalLink, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../App';
import { dataService } from '../services/dataService';
import { Customer } from '../types';

const CustomerManagement: React.FC = () => {
  // Fix: Access authentication context to get current company and user info
  const { company, user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: '',
    credit_balance: 0
  });

  const loadCustomers = () => {
    // Fix: Pass company.id to getCustomers (line 19 fix)
    if (company) {
      setCustomers(dataService.getCustomers(company.id));
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [company]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer.name || !company || !user) return;
    
    // Fix: Pass companyId, customer, userId, and userName to saveCustomer (line 30 fix)
    dataService.saveCustomer(company.id, currentCustomer as Customer, user.id, user.name);
    setModalOpen(false);
    loadCustomers();
    // Reset form
    setCurrentCustomer({ name: '', phone: '', address: '', credit_balance: 0 });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      if (!company) return;
      // Fix: Maintain tenant isolation by filtering ALL customers from the correct key 'saas_customers' (line 39 fix)
      const all: Customer[] = JSON.parse(localStorage.getItem('saas_customers') || '[]');
      const filtered = all.filter(c => !(c.id === id && c.company_id === company.id));
      localStorage.setItem('saas_customers', JSON.stringify(filtered));
      loadCustomers();
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage client relationships and credit balances</p>
        </div>
        <button 
          onClick={() => {
            setCurrentCustomer({ name: '', phone: '', address: '', credit_balance: 0 });
            setModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors active:scale-95"
        >
          <Plus size={20} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers by name or phone..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="flex flex-col items-center">
              <User size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No customers found.</p>
              <button 
                onClick={() => setModalOpen(true)}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Add your first customer
              </button>
            </div>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => {
                      setCurrentCustomer(customer);
                      setModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{customer.name}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center text-sm text-slate-500">
                  <Phone size={14} className="mr-2 text-slate-400" />
                  {customer.phone || 'No phone provided'}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <MapPin size={14} className="mr-2 text-slate-400" />
                  <span className="truncate">{customer.address || 'No address provided'}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">Credit Balance</p>
                  <p className={`text-lg font-bold ${customer.credit_balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ${customer.credit_balance.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                   <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    Ledger
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{currentCustomer.id ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={currentCustomer.name}
                  onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input 
                    type="tel"
                    placeholder="e.g. 555-0123"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={currentCustomer.phone}
                    onChange={e => setCurrentCustomer({...currentCustomer, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Credit ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={currentCustomer.credit_balance}
                    onChange={e => setCurrentCustomer({...currentCustomer, credit_balance: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                <textarea 
                  rows={3}
                  placeholder="Street, City, Zip"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  value={currentCustomer.address}
                  onChange={e => setCurrentCustomer({...currentCustomer, address: e.target.value})}
                />
              </div>
              
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors shadow-indigo-200 active:scale-95"
                >
                  {currentCustomer.id ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
