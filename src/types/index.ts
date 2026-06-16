// Types partagés entre frontend et backend
// Correspondent au schéma de la base de données Supabase

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue";
export type Currency = "XOF" | "EUR" | "USD";

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  companyName: string | null;
  logoUrl: string | null;
  currency: Currency;
  phone: string | null;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: Currency;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  publicToken: string;
  createdAt: string;
  items?: InvoiceItem[];
  client?: Client;
}