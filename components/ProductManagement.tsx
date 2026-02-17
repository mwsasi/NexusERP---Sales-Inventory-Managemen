
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../App';
import { dataService } from '../services/dataService';
import { Product } from '../types';

const ProductManagement: React.FC = () => {
  // Fix: Access authentication context to get current company and user info
  const { company, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 5
  });
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = () => {
    // Fix: Pass company.id to getProducts (line 20 fix)
    if (company) {
      setProducts(dataService.getProducts(company.id));
    }
  };

  useEffect(() => {
    loadProducts();
  }, [company]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !user) return;

    const productToSave = {
      ...currentProduct,
      sku: currentProduct.sku || `SKU-${Math.floor(Math.random() * 900000 + 100000)}`
    } as Product;
    
    // Fix: Pass companyId, product, userId, and userName to saveProduct (line 34 fix)
    dataService.saveProduct(company.id, productToSave, user.id, user.name);
    setModalOpen(false);
    loadProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">Track and manage your products across all warehouses</p>
        </div>
        <button 
          onClick={() => {
            setCurrentProduct({ name: '', cost_price: 0, selling_price: 0, stock_quantity: 0, low_stock_threshold: 5 });
            setModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 text-sm font-medium">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Product Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pricing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Inventory</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">${p.selling_price.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">Cost: ${p.cost_price.toFixed(2)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className={`font-bold ${p.stock_quantity <= p.low_stock_threshold ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.stock_quantity} Units
                      </p>
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1.5">
                        <div 
                          className={`h-full rounded-full ${p.stock_quantity <= p.low_stock_threshold ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((p.stock_quantity/20)*100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.stock_quantity <= p.low_stock_threshold ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setCurrentProduct(p);
                          setModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this product?') && company && user) {
                            // Fix: Pass companyId, id, userId, and userName to deleteProduct (line 154 fix)
                            dataService.deleteProduct(company.id, p.id, user.id, user.name);
                            loadProducts();
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">Showing {filteredProducts.length} of {products.length} products</p>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50"><ChevronLeft size={16} /></button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentProduct.name}
                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cost Price ($)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentProduct.cost_price}
                    onChange={e => setCurrentProduct({...currentProduct, cost_price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selling Price ($)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentProduct.selling_price}
                    onChange={e => setCurrentProduct({...currentProduct, selling_price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentProduct.stock_quantity}
                    onChange={e => setCurrentProduct({...currentProduct, stock_quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Low Stock Alert</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentProduct.low_stock_threshold}
                    onChange={e => setCurrentProduct({...currentProduct, low_stock_threshold: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default ProductManagement;
