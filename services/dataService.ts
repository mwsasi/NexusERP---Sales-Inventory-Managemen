
import { Product, Customer, Sale, User, UserRole, SaleItem, DashboardStats, Company, SubscriptionPlan, AuditLog } from '../types';

const KEYS = {
  COMPANIES: 'saas_companies',
  PRODUCTS: 'saas_products',
  CUSTOMERS: 'saas_customers',
  SALES: 'saas_sales',
  USERS: 'saas_users',
  AUDIT_LOGS: 'saas_audit_logs',
  CURRENT_USER: 'saas_auth_user'
};

export const dataService = {
  init: () => {
    if (!localStorage.getItem(KEYS.COMPANIES)) localStorage.setItem(KEYS.COMPANIES, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.PRODUCTS)) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.CUSTOMERS)) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.SALES)) localStorage.setItem(KEYS.SALES, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.AUDIT_LOGS)) localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify([]));
    
    // Create seed company if none exists
    const companies = dataService.getCompanies();
    if (companies.length === 0) {
      const seedCompany = dataService.createCompany("Nexus Global Corp");
      dataService.registerUser("System Admin", "admin@nexus.erp", UserRole.ADMIN, seedCompany.id);
    }
  },

  // Company Operations
  getCompanies: (): Company[] => JSON.parse(localStorage.getItem(KEYS.COMPANIES) || '[]'),
  
  getCompany: (id: string): Company | undefined => {
    return dataService.getCompanies().find(c => c.id === id);
  },

  createCompany: (name: string): Company => {
    const companies = dataService.getCompanies();
    const newCompany: Company = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      plan: SubscriptionPlan.FREE,
      created_at: new Date().toISOString()
    };
    companies.push(newCompany);
    localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));
    return newCompany;
  },

  updateCompanyPlan: (companyId: string, plan: SubscriptionPlan) => {
    const companies = dataService.getCompanies();
    const idx = companies.findIndex(c => c.id === companyId);
    if (idx !== -1) {
      companies[idx].plan = plan;
      localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));
    }
  },

  // User Operations
  getUsers: (companyId?: string): User[] => {
    const allUsers: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    return companyId ? allUsers.filter(u => u.company_id === companyId) : allUsers;
  },
  
  registerUser: (name: string, email: string, role: UserRole, companyId: string): User => {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      company_id: companyId,
      name,
      email,
      role,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  // Tenant Isolated Operations
  getProducts: (companyId: string): Product[] => {
    const all: Product[] = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    return all.filter(p => p.company_id === companyId);
  },

  saveProduct: (companyId: string, product: Product, userId: string, userName: string) => {
    const all: Product[] = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const index = all.findIndex(p => p.id === product.id && p.company_id === companyId);
    
    if (index >= 0) {
      all[index] = { ...product, company_id: companyId };
      dataService.logActivity(companyId, userId, userName, 'UPDATE', 'PRODUCT', `Updated ${product.name}`);
    } else {
      const newProd = { 
        ...product, 
        id: Math.random().toString(36).substr(2, 9), 
        company_id: companyId,
        created_at: new Date().toISOString() 
      };
      all.push(newProd);
      dataService.logActivity(companyId, userId, userName, 'CREATE', 'PRODUCT', `Created ${product.name}`);
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(all));
  },

  deleteProduct: (companyId: string, id: string, userId: string, userName: string) => {
    let all: Product[] = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const prod = all.find(p => p.id === id && p.company_id === companyId);
    if (prod) {
      all = all.filter(p => !(p.id === id && p.company_id === companyId));
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(all));
      dataService.logActivity(companyId, userId, userName, 'DELETE', 'PRODUCT', `Deleted ${prod.name}`);
    }
  },

  getCustomers: (companyId: string): Customer[] => {
    const all: Customer[] = JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]');
    return all.filter(c => c.company_id === companyId);
  },

  saveCustomer: (companyId: string, customer: Customer, userId: string, userName: string) => {
    const all: Customer[] = JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]');
    const index = all.findIndex(c => c.id === customer.id && c.company_id === companyId);
    
    if (index >= 0) {
      all[index] = { ...customer, company_id: companyId };
      dataService.logActivity(companyId, userId, userName, 'UPDATE', 'CUSTOMER', `Updated ${customer.name}`);
    } else {
      const newCust = { 
        ...customer, 
        id: Math.random().toString(36).substr(2, 9), 
        company_id: companyId,
        created_at: new Date().toISOString() 
      };
      all.push(newCust);
      dataService.logActivity(companyId, userId, userName, 'CREATE', 'CUSTOMER', `Registered ${customer.name}`);
    }
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(all));
  },

  getSales: (companyId: string): Sale[] => {
    const all: Sale[] = JSON.parse(localStorage.getItem(KEYS.SALES) || '[]');
    return all.filter(s => s.company_id === companyId);
  },

  createSale: (companyId: string, sale: Partial<Sale>, items: Partial<SaleItem>[], userId: string, userName: string) => {
    const allSales: Sale[] = JSON.parse(localStorage.getItem(KEYS.SALES) || '[]');
    const allProducts: Product[] = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const allCustomers: Customer[] = JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]');
    
    const newSale: Sale = {
      ...sale,
      id: Math.random().toString(36).substr(2, 9),
      company_id: companyId,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
      items: items.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) } as SaleItem))
    } as Sale;

    // Deduct stock for company products
    items.forEach(item => {
      const prod = allProducts.find(p => p.id === item.product_id && p.company_id === companyId);
      if (prod) prod.stock_quantity -= (item.quantity || 0);
    });

    if (newSale.balance > 0) {
      const cust = allCustomers.find(c => c.id === newSale.customer_id && c.company_id === companyId);
      if (cust) cust.credit_balance += newSale.balance;
    }

    allSales.push(newSale);
    localStorage.setItem(KEYS.SALES, JSON.stringify(allSales));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(allProducts));
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(allCustomers));
    
    dataService.logActivity(companyId, userId, userName, 'CREATE', 'SALE', `New Sale: ${newSale.invoice_number} for $${newSale.total_amount}`);
    
    return newSale;
  },

  logActivity: (companyId: string, userId: string, userName: string, action: string, resource: string, details: string) => {
    const logs: AuditLog[] = JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]');
    logs.push({
      id: Math.random().toString(36).substr(2, 9),
      company_id: companyId,
      user_id: userId,
      user_name: userName,
      action,
      resource,
      details,
      created_at: new Date().toISOString()
    });
    // Keep last 1000 logs
    const trimmed = logs.slice(-1000);
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
  },

  getAuditLogs: (companyId: string): AuditLog[] => {
    const all: AuditLog[] = JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]');
    return all.filter(l => l.company_id === companyId).reverse();
  },

  getDashboardStats: (companyId: string): DashboardStats => {
    const sales = dataService.getSales(companyId);
    const products = dataService.getProducts(companyId);
    const customers = dataService.getCustomers(companyId);
    
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
      topProducts: [],
      revenueChart: last7Days,
      outstandingBalances
    };
  }
};
