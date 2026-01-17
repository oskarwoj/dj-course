import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shipment, RoutePoint, Coordinates } from '@/model/shipments';
import {
  fetchShipments,
  fetchShipmentById,
  updateShipmentRoute,
  addRoutePoint,
  removeRoutePoint,
  updateRoutePoint,
  optimizeRoute
} from './route-planner.http';

// Query keys
export const routePlannerKeys = {
  all: ['route-planner'] as const,
  shipments: () => [...routePlannerKeys.all, 'shipments'] as const,
  shipment: (id: string) => [...routePlannerKeys.all, 'shipment', id] as const,
  optimization: (shipmentId: string) => [...routePlannerKeys.all, 'optimization', shipmentId] as const
};

/**
 * Hook to fetch all shipments with routes
 */
export const useRoutePlannerShipments = () => {
  return useQuery({
    queryKey: routePlannerKeys.shipments(),
    queryFn: fetchShipments,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch a single shipment by ID
 */
export const useRoutePlannerShipment = (id: string) => {
  return useQuery({
    queryKey: routePlannerKeys.shipment(id),
    queryFn: () => fetchShipmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Hook to update a shipment's route
 */
export const useUpdateShipmentRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shipmentId, route }: { shipmentId: string; route: Shipment['route'] }) =>
      updateShipmentRoute(shipmentId, route),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routePlannerKeys.shipments() });
      queryClient.setQueryData(routePlannerKeys.shipment(data.id), data);
    }
  });
};

/**
 * Hook to add a point to a route
 */
export const useAddRoutePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      coordinates,
      type
    }: {
      shipmentId: string;
      coordinates: Coordinates;
      type: RoutePoint['type'];
    }) => addRoutePoint(shipmentId, coordinates, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: routePlannerKeys.shipment(variables.shipmentId) });
    }
  });
};

/**
 * Hook to remove a point from a route
 */
export const useRemoveRoutePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shipmentId, pointId }: { shipmentId: string; pointId: string }) =>
      removeRoutePoint(shipmentId, pointId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: routePlannerKeys.shipment(variables.shipmentId) });
    }
  });
};

/**
 * Hook to update a route point
 */
export const useUpdateRoutePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      pointId,
      updates
    }: {
      shipmentId: string;
      pointId: string;
      updates: Partial<RoutePoint>;
    }) => updateRoutePoint(shipmentId, pointId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: routePlannerKeys.shipment(variables.shipmentId) });
    }
  });
};

/**
 * Hook to optimize a route
 */
export const useOptimizeRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shipmentId: string) => optimizeRoute(shipmentId),
    onSuccess: (_, shipmentId) => {
      queryClient.invalidateQueries({ queryKey: routePlannerKeys.shipment(shipmentId) });
    }
  });
};
