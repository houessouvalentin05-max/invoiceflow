import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '../types';

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  brand: { fontSize: 20, color: '#111827', fontWeight: 'bold' },
  title: { fontSize: 24, color: '#2563EB' },
  section: { marginVertical: 10 },
  tableHeader: { flexDirection: 'row', borderBottom: '2px solid #2563EB', paddingBottom: 5, marginTop: 20 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #E5E7EB', paddingVertical: 8 },
  text: { fontSize: 12 },
  totalSection: { marginTop: 30, alignItems: 'flex-end' }
});

export const InvoicePDF = ({ invoice }: { invoice: Invoice }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.brand}>INVOICEFLOW</Text>
        <Text style={styles.title}>FACTURE</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.text}>Client: {invoice.clientName}</Text>
        <Text style={styles.text}>Date: {invoice.date}</Text>
        <Text style={styles.text}>Échéance: {invoice.dueDate}</Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.text, { flex: 2 }]}>Description</Text>
        <Text style={[styles.text, { flex: 1 }]}>Qté</Text>
        <Text style={[styles.text, { flex: 1 }]}>Prix</Text>
      </View>

      {invoice.items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.text, { flex: 2 }]}>{item.description}</Text>
          <Text style={[styles.text, { flex: 1 }]}>{item.quantity}</Text>
          <Text style={[styles.text, { flex: 1 }]}>{item.unitPrice} €</Text>
        </View>
      ))}

      <View style={styles.totalSection}>
        <Text>Total HT: {invoice.subtotal} €</Text>
        <Text>TVA: {invoice.tax} €</Text>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>TOTAL TTC: {invoice.total} €</Text>
      </View>
    </Page>
  </Document>
);