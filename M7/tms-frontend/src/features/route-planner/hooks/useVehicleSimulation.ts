import { useEffect } from 'react';
import { Shipment } from '@/model/shipments';
import { RouteContext } from '../models/route-planner.model';

interface UseVehicleSimulationProps {
  selectedShipment: Shipment | null;
  context: RouteContext;
  onShipmentUpdate: (updater: (prev: Shipment | null) => Shipment | null) => void;
}

/**
 * Simulates vehicle movement for active shipments
 * Updates vehicle position every 5 seconds, moving towards the first point in the route
 */
export const useVehicleSimulation = ({
  selectedShipment,
  context,
  onShipmentUpdate
}: UseVehicleSimulationProps) => {
  useEffect(() => {
    if (!selectedShipment || context === 'route-planning') return;

    const interval = setInterval(() => {
      onShipmentUpdate((prev) => {
        if (!prev || prev.route.status !== 'active') return prev;

        // Simple simulation: move vehicle slightly towards the first point
        const targetPoint = prev.route.points[0];
        if (!targetPoint) return prev;

        const currentLat = prev.route.vehicle.coordinates.lat;
        const currentLng = prev.route.vehicle.coordinates.lng;
        const targetLat = targetPoint.coordinates.lat;
        const targetLng = targetPoint.coordinates.lng;

        const newLat = currentLat + (targetLat - currentLat) * 0.01;
        const newLng = currentLng + (targetLng - currentLng) * 0.01;

        return {
          ...prev,
          route: {
            ...prev.route,
            vehicle: {
              ...prev.route.vehicle,
              coordinates: { lat: newLat, lng: newLng }
            }
          }
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedShipment, context, onShipmentUpdate]);
};
