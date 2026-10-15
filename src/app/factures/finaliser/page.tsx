'use client'

import { pdf } from '@react-pdf/renderer'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { InvoicePDF } from '@/features/invoices/components/InvoicePDF'
import {
  GUEST_CLIENT_ID_KEY,
  GUEST_INVOICE_DRAFT_KEY,
  GUEST_INVOICE_ID_KEY,
  loadGuestInvoiceDraft,
} from '@/features/invoices/guest-draft'
import { AUTH_NEXT_PATH_KEY, GUEST_INVOICE_FINALIZE_PATH } from '@/lib/auth-redirect'
import { createClient } from '@/lib/supabase/client'

interface StoredRecord {
  userId: string
  id: string
}

function readRecord(key: string): StoredRecord | null {
  try {
    const value = localStorage.getItem(key)
    if (!value) return null
    const parsed = JSON.parse(value) as StoredRecord
    return parsed.userId && parsed.id ? parsed : null
  } catch {
    return null
  }
}

async function responseError(response: Response) {
  const body = await response.json().catch(() => ({}))
  return body.error || `La requête a échoué (${response.status}).`
}

export default function FinalizeGuestInvoicePage() {
  const router = useRouter()
  const started = useRef(false)
  const [message, setMessage] = useState('Vérification de votre compte…')
  const [error, setError] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState('facture.pdf')

  useEffect(() => {
    if (started.current) return
    started.current = true

    async function finalize() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(GUEST_INVOICE_FINALIZE_PATH)}`)
        return
      }
      localStorage.removeItem(AUTH_NEXT_PATH_KEY)

      const draft = loadGuestInvoiceDraft()
      if (!draft) {
        setError('Votre brouillon est introuvable ou invalide. Recommencez la préparation de la facture.')
        return
      }

      try {
        setMessage('Enregistrement sécurisé de la facture…')
        let invoiceRecord = readRecord(GUEST_INVOICE_ID_KEY)

        if (!invoiceRecord || invoiceRecord.userId !== user.id) {
          let clientRecord = readRecord(GUEST_CLIENT_ID_KEY)
          if (!clientRecord || clientRecord.userId !== user.id) {
            const clientResponse = await fetch('/api/clients', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(draft.client),
            })
            if (!clientResponse.ok) throw new Error(await responseError(clientResponse))
            const client = await clientResponse.json()
            clientRecord = { userId: user.id, id: client.id }
            localStorage.setItem(GUEST_CLIENT_ID_KEY, JSON.stringify(clientRecord))
          }

          const invoiceResponse = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: clientRecord.id,
              currency: draft.currency,
              due_date: draft.due_date || undefined,
              status: 'draft',
              notes: draft.notes || undefined,
              items: draft.items,
            }),
          })
          if (!invoiceResponse.ok) throw new Error(await responseError(invoiceResponse))
          const invoice = await invoiceResponse.json()
          invoiceRecord = { userId: user.id, id: invoice.id }
          localStorage.setItem(GUEST_INVOICE_ID_KEY, JSON.stringify(invoiceRecord))
        }

        const savedResponse = await fetch(`/api/invoices/${invoiceRecord.id}`)
        if (!savedResponse.ok) throw new Error(await responseError(savedResponse))
        const savedInvoice = await savedResponse.json()
        const client = Array.isArray(savedInvoice.client) ? savedInvoice.client[0] : savedInvoice.client
        const invoicePdf = {
          id: savedInvoice.id,
          invoiceNumber: savedInvoice.invoice_number,
          clientName: client?.name ?? draft.client.name,
          date: new Date(savedInvoice.created_at).toLocaleDateString('fr-FR'),
          dueDate: savedInvoice.due_date ? new Date(savedInvoice.due_date).toLocaleDateString('fr-FR') : '—',
          currency: savedInvoice.currency,
          items: (savedInvoice.items ?? []).map((item: { description: string; quantity: number; unit_price: number; total: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total,
          })),
          subtotal: savedInvoice.subtotal,
          tax: savedInvoice.tax,
          total: savedInvoice.total,
        }

        setMessage('Préparation du PDF…')
        const blob = await pdf(<InvoicePDF invoice={invoicePdf} />).toBlob()
        const objectUrl = URL.createObjectURL(blob)
        const filename = `facture-${savedInvoice.invoice_number}.pdf`
        const download = document.createElement('a')
        download.href = objectUrl
        download.download = filename
        document.body.appendChild(download)
        download.click()
        download.remove()
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
        setPdfUrl(objectUrl)
        setPdfName(filename)

        localStorage.removeItem(GUEST_INVOICE_DRAFT_KEY)
        localStorage.removeItem(GUEST_INVOICE_ID_KEY)
        localStorage.removeItem(GUEST_CLIENT_ID_KEY)
        setInvoiceUrl(`/dashboard/invoices/${savedInvoice.id}`)
        setMessage('Votre facture est enregistrée et le téléchargement du PDF a démarré.')
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Impossible de finaliser la facture. Votre brouillon est conservé.')
      }
    }

    void finalize()
  }, [router])

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F4F7F6', padding: 24, color: '#17212B' }}>
      <section style={{ width: '100%', maxWidth: 480, background: '#FFFFFF', border: '1px solid #DCE5E1', borderRadius: 6, padding: 28 }}>
        <p style={{ color: '#087F5B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 10px' }}>InvoiceFlow</p>
        <h1 style={{ fontSize: 24, margin: '0 0 12px' }}>Finalisation de la facture</h1>
        <p role={error ? 'alert' : 'status'} style={{ color: error ? '#B42318' : '#52616B', lineHeight: 1.6, margin: 0 }}>{error ?? message}</p>
        {invoiceUrl && <a href={invoiceUrl} style={{ display: 'inline-block', marginTop: 20, color: '#087F5B', fontWeight: 700 }}>Ouvrir la facture enregistrée</a>}
        {pdfUrl && <p style={{ margin: '14px 0 0', fontSize: 13, color: '#52616B' }}>Si le téléchargement ne démarre pas, <a href={pdfUrl} download={pdfName} style={{ color: '#087F5B', fontWeight: 700 }}>télécharger le PDF</a>.</p>}
        {error && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 20 }}>
            <button type="button" onClick={() => window.location.reload()} style={{ minHeight: 40, padding: '0 14px', border: 0, borderRadius: 6, background: '#173B32', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
            <a href="/facture" style={{ color: '#52616B', fontSize: 13 }}>Préparer une autre facture</a>
          </div>
        )}
      </section>
    </main>
  )
}