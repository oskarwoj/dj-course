import jsPDF from 'jspdf'
import { PdfPageManager } from '../base/PdfPageManager'
import { PdfStyleManager } from '../base/PdfStyleManager'
import { PDF_CONFIG } from './pdfConfig'

export interface FooterOptions {
  includePageNumbers?: boolean
}

/**
 * Renders PDF header with logo and company info
 */
export function renderHeader(
  doc: jsPDF,
  logoDataUrl: string | null,
  pageManager: PdfPageManager,
  styleManager: PdfStyleManager
): void {
  const pageWidth = pageManager.getPageWidth()

  // Add logo
  if (logoDataUrl) {
    doc.addImage(
      logoDataUrl,
      'PNG',
      PDF_CONFIG.logo.position.x,
      PDF_CONFIG.logo.position.y,
      PDF_CONFIG.logo.position.width,
      PDF_CONFIG.logo.position.height
    )
  }

  // Company info
  styleManager.setBodyFont()
  doc.text(
    PDF_CONFIG.company.systemName,
    pageWidth - PDF_CONFIG.page.margin.right - 60,
    PDF_CONFIG.logo.position.y + 5
  )
  doc.text(
    PDF_CONFIG.company.name,
    pageWidth - PDF_CONFIG.page.margin.right - 60,
    PDF_CONFIG.logo.position.y + 12
  )

  // Header line
  styleManager.setDefaultLineWidth()
  styleManager.setBorderColor()
  doc.line(
    PDF_CONFIG.page.margin.left,
    PDF_CONFIG.page.headerHeight,
    pageWidth - PDF_CONFIG.page.margin.right,
    PDF_CONFIG.page.headerHeight
  )
}

/**
 * Renders PDF footer with company info and page numbers
 */
export function renderFooter(
  doc: jsPDF,
  pageManager: PdfPageManager,
  styleManager: PdfStyleManager,
  options: FooterOptions = {}
): void {
  const pageHeight = pageManager.getPageHeight()
  const pageWidth = pageManager.getPageWidth()
  const footerY = pageHeight - PDF_CONFIG.page.footerHeight

  // Footer line
  styleManager.setBorderColor()
  doc.line(
    PDF_CONFIG.page.margin.left,
    footerY - 5,
    pageWidth - PDF_CONFIG.page.margin.right,
    footerY - 5
  )

  // Footer text
  styleManager.setFooterFont()
  styleManager.setSecondaryTextColor()

  PDF_CONFIG.footer.lines.forEach((line, idx) => {
    doc.text(line, PDF_CONFIG.page.margin.left, footerY + idx * 6)
  })

  // Page numbers
  if (options.includePageNumbers !== false) {
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2 - 10,
        pageHeight - PDF_CONFIG.footer.pageNumberOffset.y
      )
    }
  }

  // Reset text color
  styleManager.setPrimaryTextColor()
}
