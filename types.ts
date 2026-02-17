
export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff',
  SUPER_ADMIN = 'SuperAdmin' // For SaaS platform operators
}

export enum SubscriptionPlan {
  FREE = 'Free',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise'
}

export interface Company {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  stripe_customer_id?: string;
  logo_url?: string;
  created_at: string;
}

export interface User {
  id: string;
  company_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  phone: string;
  address: string;
  credit_balance: number;
  created_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  sku: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  company_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  tax_amount: number;
  discount_amount: number;
  created_at: string;
  items?: SaleItem[];
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  details: string;
  created_at: string;
}

export interface DashboardStats {
  todaySales: number;
  monthlyRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockItems: Product[];
  topProducts: { name: string; salesCount: number }[];
  revenueChart: { date: string; amount: number }[];
  outstandingBalances: number;
}
