import { createClient } from '@/lib/supabase/server'
import { InvoiceInput } from './invoice.validator'

export async function getInvoices(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(name, email)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getInvoiceById(id: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(name, email), items:invoice_items(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

export async function createInvoiceDb(
  userId: string,
  invoice: Omit<InvoiceInput, 'items'> & {
    subtotal: number
    tax: number
    total: number
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .insert({ ...invoice, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createInvoiceItems(
  invoiceId: string,
  items: { description: string; quantity: number; unit_price: number; total: number }[]
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoice_items')
    .insert(items.map(item => ({ ...item, invoice_id: invoiceId })))
  if (error) throw error
}

export async function updateInvoiceStatus(id: string, userId: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteInvoice(id: string, userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}