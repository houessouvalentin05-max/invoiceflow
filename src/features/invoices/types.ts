export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  date: string;
  dueDate: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}
