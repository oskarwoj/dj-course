import jsPDF from 'jspdf'
import { PDF_CONFIG } from '../shared/pdfConfig'

/**
 * Manages PDF pagination and Y position tracking
 */
export class PdfPageManager {
  private yPos: number
  private readonly pageHeight: number
  private readonly pageWidth: number

  constructor(private doc: jsPDF) {
    this.pageHeight = doc.internal.pageSize.height
    this.pageWidth = doc.internal.pageSize.getWidth()
    this.yPos = PDF_CONFIG.page.contentStartY
  }

  /**
   * Get current Y position
   */
  getCurrentY(): number {
    return this.yPos
  }

  /**
   * Set Y position
   */
  setY(position: number): void {
    this.yPos = position
  }

  /**
   * Get page height
   */
  getPageHeight(): number {
    return this.pageHeight
  }

  /**
   * Get page width
   */
  getPageWidth(): number {
    return this.pageWidth
  }

  /**
   * Check if we need a new page for the required space
   * @param requiredSpace Space needed in points
   * @returns true if new page was added
   */
  checkPageBreak(requiredSpace: number): boolean {
    const bottomMargin = PDF_CONFIG.page.margin.bottom + PDF_CONFIG.page.footerHeight
    if (this.yPos + requiredSpace > this.pageHeight - bottomMargin) {
      this.addPage()
      return true
    }
    return false
  }

  /**
   * Add a new page and reset Y position
   */
  addPage(): void {
    this.doc.addPage()
    this.yPos = PDF_CONFIG.page.margin.top
  }

  /**
   * Add space (increment Y position)
   */
  addSpace(space: number): void {
    this.yPos += space
  }

  /**
   * Move to next line with default spacing
   */
  nextLine(spacing: number = PDF_CONFIG.field.spacing): void {
    this.yPos += spacing
  }
}
