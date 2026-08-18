import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice } from '../types'

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica' },
  section: { marginVertical: 10 },
  text: { fontSize: 12 },
  totalSection: { marginTop: 30 },
})

function money(value: number, currency: string) {
  return `${value.toLocaleString('fr-FR')} ${currency}`
}

export const InvoicePDF = ({ invoice }: { invoice: Invoice }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.text}>Client: {invoice.clientName}</Text>
        <Text style={styles.text}>Date: {invoice.date}</Text>
      </View>
      <View style={styles.totalSection}>
        <Text>Total: {money(invoice.total, invoice.currency)}</Text>
      </View>
    </Page>
  </Document>
)