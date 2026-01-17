import jsPDF from 'jspdf'
import { PdfPageManager } from './PdfPageManager'
import { PdfStyleManager } from './PdfStyleManager'
import { loadLogo } from '../shared/logoLoader'
import { renderHeader, renderFooter } from '../shared/headerFooter'
import { PDF_CONFIG } from '../shared/pdfConfig'

export interface PDFOptions {
  includeWatermark?: boolean
  includeFooter?: boolean
}

/**
 * Abstract base class for PDF generators using Template Method Pattern
 * Subclasses implement renderContent() to define their specific content
 */
export abstract class BasePdfGenerator {
  protected doc: jsPDF
  protected pageManager: PdfPageManager
  protected styleManager: PdfStyleManager
  protected logoDataUrl: string | null = null
  protected options: PDFOptions

  constructor(options: PDFOptions = {}) {
    this.doc = new jsPDF()
    this.pageManager = new PdfPageManager(this.doc)
    this.styleManager = new PdfStyleManager(this.doc)
    this.options = options
  }

  /**
   * Template method - defines the algorithm for PDF generation
   * Subclasses don't override this, they implement the hook methods
   */
  async generate(): Promise<void> {
    await this.loadLogo()
    this.renderHeader()
    this.renderTitle()
    this.renderWatermark()
    this.renderContent()
    this.renderFooter()
    this.save()
  }

  /**
   * Template method - generates PDF as Blob instead of saving
   */
  async generateBlob(): Promise<Blob> {
    await this.loadLogo()
    this.renderHeader()
    this.renderTitle()
    this.renderWatermark()
    this.renderContent()
    this.renderFooter()
    return this.doc.output('blob')
  }

  /**
   * Hook method - subclasses must implement to define their content
   */
  protected abstract renderContent(): void

  /**
   * Hook method - subclasses must implement to return filename
   */
  protected abstract getFilename(): string

  /**
   * Hook method - subclasses must implement to return document title
   */
  protected abstract getTitle(): string

  /**
   * Load logo image
   */
  protected async loadLogo(): Promise<void> {
    this.logoDataUrl = await loadLogo()
  }

  /**
   * Render header with logo and company info
   */
  protected renderHeader(): void {
    renderHeader(this.doc, this.logoDataUrl, this.pageManager, this.styleManager)
  }

  /**
   * Render document title
   */
  protected renderTitle(): void {
    const title = this.getTitle()
    this.styleManager.setTitleFont()
    this.doc.text(title, PDF_CONFIG.page.margin.left, this.pageManager.getCurrentY())
    this.pageManager.addSpace(15)
  }

  /**
   * Render watermark if requested
   */
  protected renderWatermark(): void {
    if (this.options.includeWatermark) {
      const pageWidth = this.pageManager.getPageWidth()
      const pageHeight = this.pageManager.getPageHeight()

      this.styleManager.setWatermarkFont()
      this.styleManager.setWatermarkTextColor()
      this.doc.text('SAMPLE DOCUMENT', pageWidth / 2, pageHeight / 2, {
        angle: 45,
        align: 'center'
      })
      this.styleManager.setPrimaryTextColor()
    }
  }

  /**
   * Render footer with company info and page numbers
   */
  protected renderFooter(): void {
    if (this.options.includeFooter !== false) {
      renderFooter(this.doc, this.pageManager, this.styleManager, {
        includePageNumbers: true
      })
    }
  }

  /**
   * Save PDF with generated filename
   */
  protected save(): void {
    const filename = this.getFilename()
    this.doc.save(filename)
  }
}
