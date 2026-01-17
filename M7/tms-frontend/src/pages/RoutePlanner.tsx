import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { RoutePlannerPage } from '@/features/route-planner';
import { LoadingPage, ErrorMessage } from '@/components';
import { useShipmentsList, useDriversList, useVehiclesList } from '@/hooks/queries';
import { Shipment } from '@/model/shipments';
import { RouteContext } from '@/features/route-planner';

export const RoutePlanner: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Get context from URL params
  const context = (searchParams.get('context') as RouteContext) || 'active-shipments';
  const entityId = searchParams.get('entityId');

  const {
    data: shipments = [],
    isLoading: shipmentsLoading,
    error: shipmentsError,
    refetch: refetchShipments
  } = useShipmentsList();

  const {
    data: drivers = [],
    isLoading: driversLoading,
    error: driversError,
    refetch: refetchDrivers
  } = useDriversList();

  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles
  } = useVehiclesList();

  const isLoading = shipmentsLoading || driversLoading || vehiclesLoading;
  const error = shipmentsError || driversError || vehiclesError;

  const handleRetry = () => {
    refetchShipments();
    refetchDrivers();
    refetchVehicles();
  };

  const handleShipmentUpdate = async (updatedShipment: Shipment) => {
    try {
      // In a real app, this would call updateShipment API and invalidate queries
      console.log('Shipment updated:', updatedShipment);
    } catch (err) {
      console.error('Failed to update shipment:', err);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorMessage
          error={error instanceof Error ? error.message : 'Failed to load route planner data'}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Find the specific entity if entityId is provided
  const contextEntity = entityId
    ? context === 'driver-routes'
      ? drivers.find((d) => d.id === entityId)
      : context === 'vehicle-routes'
        ? vehicles.find((v) => v.id === entityId)
        : undefined
    : undefined;

  return (
    <RoutePlannerPage
      initialContext={context}
      initialContextEntity={contextEntity}
      shipments={shipments}
      drivers={drivers}
      vehicles={vehicles}
      onShipmentUpdate={handleShipmentUpdate}
    />
  );
};
