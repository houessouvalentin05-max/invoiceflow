'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';
import { useEffect, useState } from 'react';

export const PDFDownloadButton = ({ invoice }: { invoice: Invoice }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <button className="px-4 py-2 bg-gray-300 rounded cursor-not-allowed">Chargement...</button>;

  return (
    <PDFDownloadLink 
      document={<InvoicePDF invoice={invoice} />} 
      fileName={`facture-${invoice.id}.pdf`}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      {({ loading }) => (loading ? 'Préparation...' : 'Télécharger PDF')}
    </PDFDownloadLink>
  );
};