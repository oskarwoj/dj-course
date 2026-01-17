import jsPDF from 'jspdf'
import { PdfPageManager } from '../base/PdfPageManager'
import { PdfStyleManager } from '../base/PdfStyleManager'
import { PDF_CONFIG } from '../shared/pdfConfig'

/**
 * Renders multi-line notes text
 * @param notes Text content to render
 * @returns New Y position after notes
 */
export function renderNotes(
  doc: jsPDF,
  notes: string,
  pageManager: PdfPageManager,
  styleManager: PdfStyleManager
): number {
  const pageWidth = pageManager.getPageWidth()
  const maxWidth = pageWidth - PDF_CONFIG.page.margin.left - PDF_CONFIG.page.margin.right
  const lineHeight = 5

  styleManager.setBodyFont()
  const lines = doc.splitTextToSize(notes, maxWidth)

  lines.forEach((line: string) => {
    if (pageManager.checkPageBreak(lineHeight)) {
      // Already moved to new page by checkPageBreak
    }
    const yPos = pageManager.getCurrentY()
    doc.text(line, PDF_CONFIG.page.margin.left, yPos)
    pageManager.addSpace(lineHeight)
  })

  return pageManager.getCurrentY()
}
