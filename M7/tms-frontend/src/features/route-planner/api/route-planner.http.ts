import { Shipment, RoutePoint, Coordinates } from '@/model/shipments';
import { simulateDelay, generateMockShipments } from './route-planner.mocks';

// For now, these are mock implementations. In production, these would call the actual API.

/**
 * Fetches all shipments with routes
 */
export const fetchShipments = async (): Promise<Shipment[]> => {
  // In production: return fetch(`${API_BASE_URL}/shipments`).then(res => res.json());
  return simulateDelay(generateMockShipments(5));
};

/**
 * Fetches a single shipment by ID
 */
export const fetchShipmentById = async (id: string): Promise<Shipment | null> => {
  // In production: return fetch(`${API_BASE_URL}/shipments/${id}`).then(res => res.json());
  const shipments = await fetchShipments();
  return simulateDelay(shipments.find((s) => s.id === id) || null);
};

/**
 * Updates a shipment's route
 */
export const updateShipmentRoute = async (shipmentId: string, route: Shipment['route']): Promise<Shipment> => {
  // In production: return fetch(`${API_BASE_URL}/shipments/${shipmentId}/route`, {
  //   method: 'PUT',
  //   body: JSON.stringify(route)
  // }).then(res => res.json());
  console.log('Updating shipment route:', shipmentId, route);
  const shipments = await fetchShipments();
  const shipment = shipments.find((s) => s.id === shipmentId);
  if (!shipment) throw new Error('Shipment not found');
  return simulateDelay({ ...shipment, route });
};

/**
 * Adds a point to a route
 */
export const addRoutePoint = async (
  shipmentId: string,
  coordinates: Coordinates,
  type: RoutePoint['type']
): Promise<RoutePoint> => {
  // In production: return fetch(`${API_BASE_URL}/shipments/${shipmentId}/route/points`, {
  //   method: 'POST',
  //   body: JSON.stringify({ coordinates, type })
  // }).then(res => res.json());
  const newPoint: RoutePoint = {
    id: `point-${Date.now()}`,
    coordinates,
    type,
    name: `New ${type}`,
    address: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
    estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000),
    duration: type === 'rest' ? 45 : type === 'fuel' ? 30 : 60
  };
  return simulateDelay(newPoint);
};

/**
 * Removes a point from a route
 */
export const removeRoutePoint = async (shipmentId: string, pointId: string): Promise<void> => {
  // In production: return fetch(`${API_BASE_URL}/shipments/${shipmentId}/route/points/${pointId}`, {
  //   method: 'DELETE'
  // });
  console.log('Removing route point:', shipmentId, pointId);
  return simulateDelay(undefined);
};

/**
 * Updates a point in a route
 */
export const updateRoutePoint = async (
  shipmentId: string,
  pointId: string,
  updates: Partial<RoutePoint>
): Promise<RoutePoint> => {
  // In production: return fetch(`${API_BASE_URL}/shipments/${shipmentId}/route/points/${pointId}`, {
  //   method: 'PATCH',
  //   body: JSON.stringify(updates)
  // }).then(res => res.json());
  console.log('Updating route point:', shipmentId, pointId, updates);
  return simulateDelay({ id: pointId, ...updates } as RoutePoint);
};

/**
 * Optimizes a route
 */
export const optimizeRoute = async (shipmentId: string): Promise<RoutePoint[]> => {
  // In production: return fetch(`${API_BASE_URL}/shipments/${shipmentId}/route/optimize`, {
  //   method: 'POST'
  // }).then(res => res.json());
  console.log('Optimizing route:', shipmentId);
  return simulateDelay([]);
};

/**
 * Gets route suggestions for rest stops
 */
export const getRestStopSuggestions = async (shipmentId: string): Promise<RoutePoint[]> => {
  // In production: return fetch(`${API_BASE_URL}/shipments/${shipmentId}/route/rest-stops`).then(res => res.json());
  console.log('Getting rest stop suggestions:', shipmentId);
  return simulateDelay([]);
};
