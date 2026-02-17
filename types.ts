
export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  credit_balance: number;
  created_at: string;
}

export interface Product {
  id: string;
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
