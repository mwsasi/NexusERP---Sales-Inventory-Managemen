
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { ShoppingCart, User, Plus, Minus, Trash2, Search, Receipt, CheckCircle2, XCircle, Banknote } from 'lucide-react';
import { dataService } from '../services/dataService';
import { pdfService } from '../services/pdfService';
import { Product, Customer, Sale, SaleItem } from '../types';

const SalesSystem: React.FC = () => {
  const { company, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (company) {
      setProducts(dataService.getProducts(company.id));
      setCustomers(dataService.getCustomers(company.id));
    }
  }, [company]);

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      alert("Out of stock!");
      return;
    }

    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.stock_quantity) {
        alert("Maximum stock reached");
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price } 
          : item
      ));
    } else {
      const newItem: SaleItem = {
        id: Math.random().toString(36).substr(2, 9),
        sale_id: '',
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.selling_price,
        subtotal: product.selling_price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === item.product_id);
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.stock_quantity) {
          alert("Maximum stock reached");
          return item;
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = 0; 
  const total = subtotal + tax - discount;

  const completeSale = () => {
    if (cart.length === 0 || !company || !user) return;
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    const saleData: Partial<Sale> = {
      customer_id: selectedCustomerId,
      customer_name: customer?.name || 'Walking Customer',
      total_amount: total,
      paid_amount: total, 
      balance: 0,
      tax_amount: tax,
      discount_amount: discount
    };

    const newSale = dataService.createSale(company.id, saleData, cart, user.id, user.name);
    pdfService.generateInvoice(newSale);
    
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCart([]);
      setDiscount(0);
      setProducts(dataService.getProducts(company.id));
    }, 2000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] animate-in fade-in duration-500">
      <div className="lg:col-span-7 flex flex-col space-y-4 min-h-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Filter products..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-400 shadow-inner"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 shadow-inner group">
            <User size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <select 
              className="bg-transparent border-none text-xs font-black text-slate-700 outline-none focus:ring-0 min-w-[140px] cursor-pointer uppercase tracking-widest"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              <option value="">WALKING CLIENT</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 pr-1 scroll-smooth">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all text-left flex flex-col group active:scale-[0.97] relative overflow-hidden"
            >
              <div className="flex-1 z-10">
                <p className="text-[10px] font-black text-indigo-500 mb-2 tracking-[0.2em] uppercase">{product.sku}</p>
                <h4 className="font-black text-slate-900 text-sm line-clamp-2 h-10 leading-tight tracking-tight uppercase">{product.name}</h4>
                <p className="text-2xl font-black text-slate-900 mt-3 tracking-tighter">${product.selling_price.toFixed(2)}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between z-10">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${product.stock_quantity <= 5 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                  STOCK: {product.stock_quantity}
                </span>
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <Plus size={16} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative min-h-0">
        <div className="p-8 bg-slate-900 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center space-x-4 z-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <ShoppingCart size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Order Hub</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5">{cart.length} ITEMS READY</p>
            </div>
          </div>
          <button 
            onClick={() => setCart([])} 
            className="group z-10 flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-rose-500 text-white/50 hover:text-white rounded-xl transition-all active:scale-90"
          >
            <XCircle size={20} />
          </button>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="grid grid-cols-12 gap-2 px-8 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-6">Product</div>
          <div className="col-span-3 text-center">Qty</div>
          <div className="col-span-3 text-right">Price</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/20">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
              <ShoppingCart size={48} className="opacity-10 mb-4" />
              <p className="font-black text-xs tracking-[0.4em] uppercase text-slate-400">Inventory Buffer Empty</p>
              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">Select items to begin checkout</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="grid grid-cols-12 items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-in slide-in-from-right-2">
                <div className="col-span-6 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate leading-tight uppercase tracking-tight">{item.product_name}</p>
                </div>
                
                <div className="col-span-3 flex flex-col items-center">
                  <div className="flex items-center space-x-2 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200/50 shadow-inner">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-indigo-600 transition-all"><Minus size={12} /></button>
                    <span className="text-[10px] font-black w-4 text-center text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-indigo-600 transition-all"><Plus size={12} /></button>
                  </div>
                </div>
                
                <div className="col-span-3 text-right flex items-center justify-end space-x-3">
                  <p className="text-xs font-black text-indigo-600 tracking-tight">${item.subtotal.toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-200 hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-15px_40px_rgba(0,0,0,0.04)] relative">
          <div className="flex items-center justify-between bg-slate-900 p-5 rounded-[2rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="pl-3 relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">Grand Total</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-sm text-indigo-300 font-bold">$</span>
                <span className="text-3xl font-black text-white tracking-tighter leading-none">{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={completeSale}
              disabled={cart.length === 0 || isSuccess}
              className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all active:scale-90 relative z-10 ${
                isSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 size={32} className="animate-bounce" />
              ) : (
                <Receipt size={32} />
              )}
            </button>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSystem;
