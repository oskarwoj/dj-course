import { BasePdfGenerator, PDFOptions } from '../base/BasePdfGenerator'
import { renderSection } from '../renderers/SectionRenderer'
import { renderField } from '../renderers/FieldRenderer'

export interface PaymentReceiptData {
  id: string | number
  amount: string | number
  status: string
  method: string
  invoice?: string
  date: string
}

/**
 * PDF Generator for Payment Receipts
 */
export class ReceiptPdfGenerator extends BasePdfGenerator {
  constructor(private payment: PaymentReceiptData, options: PDFOptions = {}) {
    super(options)
  }

  protected getTitle(): string {
    return 'Payment Receipt'
  }

  protected getFilename(): string {
    return `Receipt_${this.payment.id}.pdf`
  }

  protected renderContent(): void {
    // Payment Details Section
    renderSection(this.doc, 'Payment Details', this.pageManager, this.styleManager)

    renderField(this.doc, 'Payment ID:', this.payment.id, this.pageManager, this.styleManager)
    renderField(this.doc, 'Amount:', this.payment.amount, this.pageManager, this.styleManager)
    renderField(this.doc, 'Status:', this.payment.status, this.pageManager, this.styleManager)
    renderField(this.doc, 'Method:', this.payment.method, this.pageManager, this.styleManager)
    renderField(this.doc, 'Invoice:', this.payment.invoice ?? '-', this.pageManager, this.styleManager)
    renderField(this.doc, 'Date:', this.payment.date, this.pageManager, this.styleManager)
  }
}
