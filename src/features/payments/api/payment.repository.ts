import { createClient } from '@/lib/supabase/server'
import { PaymentInput } from './payment.validator'

export async function createPaymentDb(userId: string, input: PaymentInput) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getInvoiceTotal(invoiceId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('total')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.total ?? null
}

export async function sumInvoicePayments(invoiceId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)
    .eq('user_id', userId)
  if (error) throw error
  return (data || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)
}

export async function markInvoicePaid(invoiceId: string, userId: string, paidAt: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: paidAt })
    .eq('id', invoiceId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function deletePayment(id: string, userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function getPayments(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('id,amount,method,reference,paid_at,notes,invoice:invoices(invoice_number,client:clients(name))')
    .eq('user_id', userId)
    .order('paid_at', { ascending: false })
  if (error) throw error
  return data
}