import { ReceiptPdfGenerator, PaymentReceiptData } from './templates/ReceiptPdfGenerator'

/**
 * Utility function to generate and download a receipt PDF
 * Maintains backward compatibility with existing API
 */
export async function generateReceiptPDF(payment: PaymentReceiptData): Promise<void> {
  const generator = new ReceiptPdfGenerator(payment)
  await generator.generate()
}
