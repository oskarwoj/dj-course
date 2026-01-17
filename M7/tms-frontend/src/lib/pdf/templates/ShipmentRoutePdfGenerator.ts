import { BasePdfGenerator, PDFOptions } from '../base/BasePdfGenerator'
import { renderSection } from '../renderers/SectionRenderer'
import { renderField } from '../renderers/FieldRenderer'
import { renderTimeline } from '../renderers/TimelineRenderer'
import type { TimelineEvent } from '../renderers/TimelineRenderer'

export interface ShipmentInfo {
  id: string | number
  origin: string
  destination: string
  driver: string
  eta?: string
  status?: string
}

export type { TimelineEvent }

/**
 * PDF Generator for Shipment Routes
 */
export class ShipmentRoutePdfGenerator extends BasePdfGenerator {
  constructor(
    private shipment: ShipmentInfo,
    private events: TimelineEvent[],
    options: PDFOptions = {}
  ) {
    super(options)
  }

  protected getTitle(): string {
    return `Shipment Route - #${this.shipment.id}`
  }

  protected getFilename(): string {
    return `Shipment_${this.shipment.id}_Route.pdf`
  }

  protected renderContent(): void {
    // Route Overview Section
    renderSection(this.doc, 'Route Overview', this.pageManager, this.styleManager)

    renderField(this.doc, 'From:', this.shipment.origin, this.pageManager, this.styleManager)
    renderField(this.doc, 'To:', this.shipment.destination, this.pageManager, this.styleManager)
    renderField(this.doc, 'Driver:', this.shipment.driver, this.pageManager, this.styleManager)

    if (this.shipment.eta) {
      renderField(this.doc, 'ETA:', this.shipment.eta, this.pageManager, this.styleManager)
    }

    if (this.shipment.status) {
      renderField(this.doc, 'Status:', this.shipment.status, this.pageManager, this.styleManager)
    }

    // Timeline Section
    renderSection(this.doc, 'Timeline', this.pageManager, this.styleManager)
    renderTimeline(this.doc, this.events, this.pageManager, this.styleManager)
  }
}
