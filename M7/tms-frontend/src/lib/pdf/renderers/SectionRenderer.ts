import jsPDF from 'jspdf'
import { PdfPageManager } from '../base/PdfPageManager'
import { PdfStyleManager } from '../base/PdfStyleManager'
import { PDF_CONFIG } from '../shared/pdfConfig'

/**
 * Renders a section header with background
 * @returns New Y position after section header
 */
export function renderSection(
  doc: jsPDF,
  title: string,
  pageManager: PdfPageManager,
  styleManager: PdfStyleManager
): number {
  const pageWidth = pageManager.getPageWidth()
  const requiredSpace = PDF_CONFIG.section.spacing

  // Check if we need a new page
  pageManager.checkPageBreak(requiredSpace)
  const yPos = pageManager.getCurrentY()

  // Section background
  styleManager.setSectionBackgroundColor()
  doc.rect(
    PDF_CONFIG.page.margin.left,
    yPos,
    pageWidth - PDF_CONFIG.page.margin.left - PDF_CONFIG.page.margin.right,
    PDF_CONFIG.section.height,
    'F'
  )

  // Section title
  styleManager.setSectionFont()
  doc.text(
    title,
    PDF_CONFIG.page.margin.left + PDF_CONFIG.section.padding,
    yPos + PDF_CONFIG.section.height / 2 + 2.5
  )

  // Move Y position down
  pageManager.setY(yPos + PDF_CONFIG.section.spacing)
  return pageManager.getCurrentY()
}
