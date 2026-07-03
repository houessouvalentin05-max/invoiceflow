'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export const PDFDownloadButton = ({ invoice }: { invoice: Invoice }) => {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isClient) {
    return (
      <button className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#64748B]" disabled>
        Chargement...
      </button>
    );
  }

  return (
    <PDFDownloadLink 
      document={<InvoicePDF invoice={invoice} />} 
      fileName={`facture-${invoice.id}.pdf`}
      className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.22)] transition hover:bg-[#1D4ED8]"
    >
      {({ loading }) => (loading ? 'Préparation...' : 'Télécharger PDF')}
    </PDFDownloadLink>
  );
};
