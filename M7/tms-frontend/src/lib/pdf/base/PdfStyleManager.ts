import jsPDF from 'jspdf'
import { PDF_CONFIG } from '../shared/pdfConfig'

/**
 * Manages PDF styling and typography
 */
export class PdfStyleManager {
  constructor(private doc: jsPDF) {}

  /**
   * Set title font (18pt, bold)
   */
  setTitleFont(): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.title)
    this.doc.setFont(PDF_CONFIG.font.family, PDF_CONFIG.font.weight.bold)
  }

  /**
   * Set section header font (14pt, bold)
   */
  setSectionFont(): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.section)
    this.doc.setFont(PDF_CONFIG.font.family, PDF_CONFIG.font.weight.bold)
  }

  /**
   * Set body text font (10pt, normal)
   */
  setBodyFont(): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.body)
    this.doc.setFont(PDF_CONFIG.font.family, PDF_CONFIG.font.weight.normal)
  }

  /**
   * Set body text font (10pt, bold)
   */
  setBodyBoldFont(): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.body)
    this.doc.setFont(PDF_CONFIG.font.family, PDF_CONFIG.font.weight.bold)
  }

  /**
   * Set footer font (8pt, normal)
   */
  setFooterFont(): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.footer)
    this.doc.setFont(PDF_CONFIG.font.family, PDF_CONFIG.font.weight.normal)
  }

  /**
   * Set small text font (9pt, normal)
   */
  setSmallFont(): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.small)
    this.doc.setFont(PDF_CONFIG.font.family, PDF_CONFIG.font.weight.normal)
  }

  /**
   * Set watermark font (50pt, bold)
   */
  setWatermarkFont(): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.watermark)
    this.doc.setFont(PDF_CONFIG.font.family, PDF_CONFIG.font.weight.bold)
  }

  /**
   * Set text color to primary (black)
   */
  setPrimaryTextColor(): void {
    this.doc.setTextColor(...PDF_CONFIG.colors.text.primary)
  }

  /**
   * Set text color to secondary (gray)
   */
  setSecondaryTextColor(): void {
    this.doc.setTextColor(...PDF_CONFIG.colors.text.secondary)
  }

  /**
   * Set text color to watermark (light gray)
   */
  setWatermarkTextColor(): void {
    this.doc.setTextColor(...PDF_CONFIG.colors.text.watermark)
  }

  /**
   * Set section background color
   */
  setSectionBackgroundColor(): void {
    this.doc.setFillColor(...PDF_CONFIG.colors.background.section)
  }

  /**
   * Set border color
   */
  setBorderColor(): void {
    this.doc.setDrawColor(...PDF_CONFIG.colors.border.default)
  }

  /**
   * Set line width to default
   */
  setDefaultLineWidth(): void {
    this.doc.setLineWidth(PDF_CONFIG.lineWidth.default)
  }
}
