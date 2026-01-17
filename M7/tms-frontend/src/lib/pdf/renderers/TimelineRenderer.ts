import jsPDF from 'jspdf'
import { PdfPageManager } from '../base/PdfPageManager'
import { PdfStyleManager } from '../base/PdfStyleManager'
import { PDF_CONFIG } from '../shared/pdfConfig'

export interface TimelineEvent {
  id: number | string
  status: string
  location: string
  timestamp: string
  description: string
}

/**
 * Renders a timeline of events with colored bullets
 * @param events Array of timeline events
 * @returns New Y position after timeline
 */
export function renderTimeline(
  doc: jsPDF,
  events: TimelineEvent[],
  pageManager: PdfPageManager,
  styleManager: PdfStyleManager
): number {
  const eventHeight = 18 // Approximate height per event
  let yPos = pageManager.getCurrentY()

  events.forEach((event, index) => {
    const isLast = index === events.length - 1

    // Check if we need a new page
    if (pageManager.checkPageBreak(eventHeight)) {
      yPos = pageManager.getCurrentY()
    }

    // Bullet circle color
    const fillColor = isLast
      ? PDF_CONFIG.colors.timeline.active
      : PDF_CONFIG.colors.timeline.completed
    doc.setFillColor(...fillColor)
    doc.circle(25, yPos, 2, 'F')

    // Status (bold)
    styleManager.setBodyBoldFont()
    doc.text(event.status, 30, yPos)

    // Timestamp (right-aligned)
    styleManager.setBodyFont()
    doc.text(event.timestamp, 140, yPos)

    // Location
    yPos += 4
    styleManager.setSmallFont()
    doc.text(event.location, 30, yPos)

    // Description
    yPos += 4
    styleManager.setSecondaryTextColor()
    doc.text(event.description, 30, yPos)
    styleManager.setPrimaryTextColor()

    yPos += 10
  })

  pageManager.setY(yPos)
  return pageManager.getCurrentY()
}
