
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Plus, Minus, Trash2, Search, Receipt, CheckCircle2, XCircle, Banknote } from 'lucide-react';
import { dataService } from '../services/dataService';
import { pdfService } from '../services/pdfService';
import { Product, Customer, Sale, SaleItem } from '../types';

const SalesSystem: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setProducts(dataService.getProducts());
    setCustomers(dataService.getCustomers());
  }, []);

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
    if (cart.length === 0) return;
    
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

    const newSale = dataService.createSale(saleData, cart);
    pdfService.generateInvoice(newSale);
    
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCart([]);
      setDiscount(0);
      setProducts(dataService.getProducts());
    }, 2000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      {/* Left Column: Product Selection */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-inner">
            <User size={18} className="text-slate-400" />
            <select 
              className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none focus:ring-0 min-w-[140px] cursor-pointer"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Walking Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 pr-1 scroll-smooth">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-lg transition-all text-left flex flex-col group active:scale-[0.97] relative overflow-hidden"
            >
              <div className="flex-1 z-10">
                <p className="text-[10px] font-black text-indigo-600 mb-1 tracking-widest uppercase">{product.sku}</p>
                <h4 className="font-bold text-slate-800 text-sm line-clamp-2 h-10 leading-tight">{product.name}</h4>
                <p className="text-xl font-black text-slate-900 mt-2">${product.selling_price.toFixed(2)}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 z-10">
                <span className={`px-2 py-0.5 rounded-full ${product.stock_quantity <= 5 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
                  Stock: {product.stock_quantity}
                </span>
                <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Current Order (Cart & Checkout) */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden ring-1 ring-black/5">
        {/* Order Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center space-x-4 z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none uppercase">Current Order</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{cart.length} ITEMS</p>
            </div>
          </div>
          <button 
            onClick={() => setCart([])} 
            className="group z-10 flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 hover:bg-rose-500 text-white/50 hover:text-white px-3 py-2 rounded-xl transition-all active:scale-95"
          >
            <XCircle size={14} />
          </button>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Labels / Category Header for Cart */}
        <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-6">Product</div>
          <div className="col-span-3 text-center">Qty</div>
          <div className="col-span-3 text-right">Price</div>
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/20">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
              <ShoppingCart size={32} className="opacity-10 mb-2" />
              <p className="font-black text-[10px] tracking-[0.3em] uppercase text-slate-400">Empty Cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="grid grid-cols-12 items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-right-2">
                <div className="col-span-6 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">{item.product_name}</p>
                </div>
                
                <div className="col-span-3 flex flex-col items-center">
                  <div className="flex items-center space-x-1.5 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200/50">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-slate-900 transition-all"><Minus size={10} /></button>
                    <span className="text-[10px] font-black w-3 text-center text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-slate-900 transition-all"><Plus size={10} /></button>
                  </div>
                </div>
                
                <div className="col-span-3 text-right flex items-center justify-end space-x-2">
                  <p className="text-xs font-black text-indigo-600 tracking-tight">${item.subtotal.toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-200 hover:text-rose-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* COMPACT CHECKOUT FOOTER */}
        <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] relative">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
            <div className="pl-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-sm text-slate-400 font-bold">$</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={completeSale}
              disabled={cart.length === 0 || isSuccess}
              className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                isSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-black text-white disabled:opacity-30'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 size={24} className="animate-bounce" />
              ) : (
                <Receipt size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSystem;
