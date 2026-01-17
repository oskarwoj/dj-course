import jsPDF from 'jspdf'
import { PdfPageManager } from '../base/PdfPageManager'
import { PdfStyleManager } from '../base/PdfStyleManager'
import { PDF_CONFIG } from '../shared/pdfConfig'

/**
 * Renders a key-value field pair
 * @param label Field label
 * @param value Field value (will be converted to string)
 * @returns New Y position after field
 */
export function renderField(
  doc: jsPDF,
  label: string,
  value: string | number | null | undefined,
  pageManager: PdfPageManager,
  styleManager: PdfStyleManager
): number {
  const valueStr = value?.toString() ?? '-'
  const pageWidth = pageManager.getPageWidth()
  const maxWidth = pageWidth - PDF_CONFIG.field.valueOffset - PDF_CONFIG.page.margin.right

  // Estimate required space (at least one line for label + value)
  const estimatedLines = Math.ceil(
      doc.getTextWidth(valueStr) / maxWidth
    ) || 1
  const requiredSpace = estimatedLines * PDF_CONFIG.field.lineHeight + PDF_CONFIG.field.minSpacing

  // Check if we need a new page
  pageManager.checkPageBreak(requiredSpace)
  const yPos = pageManager.getCurrentY()

  // Render label
  styleManager.setBodyBoldFont()
  doc.text(label, PDF_CONFIG.field.labelOffset, yPos)

  // Render value (with text wrapping)
  styleManager.setBodyFont()
  const lines = doc.splitTextToSize(valueStr, maxWidth)
  doc.text(lines, PDF_CONFIG.field.valueOffset, yPos)

  // Calculate actual space used
  const actualSpace = Math.max(lines.length * PDF_CONFIG.field.lineHeight, PDF_CONFIG.field.minSpacing)
  pageManager.setY(yPos + actualSpace)

  return pageManager.getCurrentY()
}
