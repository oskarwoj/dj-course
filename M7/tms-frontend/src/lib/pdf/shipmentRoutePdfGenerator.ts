import { ShipmentRoutePdfGenerator, ShipmentInfo, TimelineEvent } from './templates/ShipmentRoutePdfGenerator'

// Re-export types for backward compatibility
export type { ShipmentInfo }
export type { TimelineEvent as TrackingEvent }

/**
 * Utility function to generate and download a shipment route PDF
 * Maintains backward compatibility with existing API
 */
export async function generateShipmentRoutePDF(
  shipment: ShipmentInfo,
  events: TrackingEvent[]
): Promise<void> {
  const generator = new ShipmentRoutePdfGenerator(shipment, events)
  await generator.generate()
}
