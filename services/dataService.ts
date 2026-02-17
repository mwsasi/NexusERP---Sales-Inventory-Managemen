
import { Product, Customer, Sale, User, UserRole, SaleItem, DashboardStats } from '../types';

// Storage Keys
const KEYS = {
  PRODUCTS: 'erp_products',
  CUSTOMERS: 'erp_customers',
  SALES: 'erp_sales',
  USERS: 'erp_users',
  CURRENT_USER: 'erp_auth_user'
};

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alex Admin', email: 'admin@nexus.erp', role: UserRole.ADMIN, created_at: new Date().toISOString() }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Premium Coffee Beans', sku: 'PROD-001', cost_price: 12.00, selling_price: 25.00, stock_quantity: 45, low_stock_threshold: 10, created_at: new Date().toISOString() },
  { id: '2', name: 'Ceramic Mug Large', sku: 'PROD-002', cost_price: 3.50, selling_price: 12.00, stock_quantity: 4, low_stock_threshold: 5, created_at: new Date().toISOString() },
  { id: '3', name: 'Grinder Pro v2', sku: 'PROD-003', cost_price: 45.00, selling_price: 89.99, stock_quantity: 12, low_stock_threshold: 2, created_at: new Date().toISOString() }
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'John Doe', phone: '555-0101', address: '123 Main St, Tech City', credit_balance: 0, created_at: new Date().toISOString() },
  { id: '2', name: 'Jane Smith', phone: '555-0202', address: '456 Oak Rd, Green Valley', credit_balance: 150.50, created_at: new Date().toISOString() }
];

export const dataService = {
  init: () => {
    if (!localStorage.getItem(KEYS.PRODUCTS)) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    if (!localStorage.getItem(KEYS.CUSTOMERS)) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    if (!localStorage.getItem(KEYS.SALES)) localStorage.setItem(KEYS.SALES, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  
  registerUser: (name: string, email: string, role: UserRole): User => {
    const users = dataService.getUsers();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  saveProduct: (product: Product) => {
    const products = dataService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push({ ...product, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() });
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  deleteProduct: (id: string) => {
    const products = dataService.getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCustomers: (): Customer[] => JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]'),
  saveCustomer: (customer: Customer) => {
    const customers = dataService.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index >= 0) customers[index] = customer;
    else customers.push({ ...customer, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() });
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getSales: (): Sale[] => JSON.parse(localStorage.getItem(KEYS.SALES) || '[]'),
  createSale: (sale: Partial<Sale>, items: Partial<SaleItem>[]) => {
    const sales = dataService.getSales();
    const products = dataService.getProducts();
    const customers = dataService.getCustomers();
    
    const newSale: Sale = {
      ...sale,
      id: Math.random().toString(36).substr(2, 9),
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
      items: items.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) } as SaleItem))
    } as Sale;

    // Reduce stock
    items.forEach(item => {
      const prod = products.find(p => p.id === item.product_id);
      if (prod) prod.stock_quantity -= (item.quantity || 0);
    });

    // Update customer credit if balance remains
    if (newSale.balance > 0) {
      const cust = customers.find(c => c.id === newSale.customer_id);
      if (cust) cust.credit_balance += newSale.balance;
    }

    sales.push(newSale);
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
    return newSale;
  },

  getDashboardStats: (): DashboardStats => {
    const sales = dataService.getSales();
    const products = dataService.getProducts();
    const customers = dataService.getCustomers();
    
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().getMonth();
    
    const todaySales = sales
      .filter(s => s.created_at.startsWith(today))
      .reduce((sum, s) => sum + s.total_amount, 0);

    const monthlyRevenue = sales
      .filter(s => new Date(s.created_at).getMonth() === month)
      .reduce((sum, s) => sum + s.total_amount, 0);

    const lowStockItems = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
    
    const outstandingBalances = customers.reduce((sum, c) => sum + c.credit_balance, 0);

    // Simple revenue chart data for last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const amount = sales
        .filter(s => s.created_at.startsWith(dateStr))
        .reduce((sum, s) => sum + s.total_amount, 0);
      return { date: dateStr.split('-').slice(1).join('/'), amount };
    }).reverse();

    return {
      todaySales,
      monthlyRevenue,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockItems,
      topProducts: [], // Would need aggregation logic
      revenueChart: last7Days,
      outstandingBalances
    };
  }
};
