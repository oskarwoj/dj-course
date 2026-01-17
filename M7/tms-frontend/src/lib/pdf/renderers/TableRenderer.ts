import jsPDF from 'jspdf'
import { PdfPageManager } from '../base/PdfPageManager'
import { PdfStyleManager } from '../base/PdfStyleManager'
import { PDF_CONFIG } from '../shared/pdfConfig'

export interface TableColumn {
  header: string
  width: number
  align?: 'left' | 'right' | 'center'
}

export interface TableRow {
  [key: string]: string | number
}

/**
 * Renders a table with headers and rows
 * @param headers Array of column definitions
 * @param rows Array of row data
 * @returns New Y position after table
 */
export function renderTable(
  doc: jsPDF,
  headers: TableColumn[],
  rows: TableRow[],
  pageManager: PdfPageManager,
  styleManager: PdfStyleManager
): number {
  const rowHeight = 8
  const headerHeight = 6
  const separatorHeight = 2

  // Check if we need a new page for header
  pageManager.checkPageBreak(headerHeight + separatorHeight + rowHeight)
  let yPos = pageManager.getCurrentY()

  // Render table headers
  styleManager.setBodyBoldFont()
  headers.forEach((col) => {
    const xPos = col.width
    const align = col.align || 'left'
    doc.text(col.header, xPos, yPos, { align: align as 'left' | 'right' | 'center' })
  })
  yPos += headerHeight

  // Table separator line
  styleManager.setBorderColor()
  doc.line(
    PDF_CONFIG.page.margin.left,
    yPos,
    pageManager.getPageWidth() - PDF_CONFIG.page.margin.right,
    yPos
  )
  yPos += separatorHeight

  // Render table rows
  styleManager.setBodyFont()
  rows.forEach((row) => {
    // Check if we need a new page for this row
    if (pageManager.checkPageBreak(rowHeight)) {
      yPos = pageManager.getCurrentY()
      // Re-render headers on new page
      styleManager.setBodyBoldFont()
      headers.forEach((col) => {
        doc.text(col.header, col.width, yPos, { align: (col.align || 'left') as 'left' | 'right' | 'center' })
      })
      yPos += headerHeight
      styleManager.setBorderColor()
      doc.line(
        PDF_CONFIG.page.margin.left,
        yPos,
        pageManager.getPageWidth() - PDF_CONFIG.page.margin.right,
        yPos
      )
      yPos += separatorHeight
      styleManager.setBodyFont()
    }

    // Render row data
    headers.forEach((col) => {
      const value = row[col.header]?.toString() ?? ''
      const align = col.align || 'left'
      doc.text(value, col.width, yPos, { align: align as 'left' | 'right' | 'center' })
    })
    yPos += rowHeight
  })

  pageManager.setY(yPos)
  return pageManager.getCurrentY()
}
