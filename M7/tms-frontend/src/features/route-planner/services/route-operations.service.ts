import { Shipment, RoutePoint, Coordinates } from '@/model/shipments';
import { calculateRouteDistance, estimateTravelTime, generateOptimizedRoute, addRestStops } from '../utils/route.utils';

/**
 * Creates a new route point with the given coordinates and type
 */
export const createRoutePoint = (
  coordinates: Coordinates,
  type: RoutePoint['type'],
  existingPointsCount: number
): RoutePoint => {
  return {
    id: `point-${Date.now()}`,
    coordinates,
    type,
    name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    address: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
    estimatedArrival: new Date(Date.now() + existingPointsCount * 2 * 60 * 60 * 1000),
    duration: type === 'rest' ? 45 : type === 'fuel' ? 30 : 60,
    notes: type === 'rest' ? 'Driver rest period' : undefined
  };
};

/**
 * Adds a point to a shipment's route and recalculates distance/duration
 */
export const addPointToRoute = (shipment: Shipment, newPoint: RoutePoint): Shipment => {
  const newPoints = [...shipment.route.points, newPoint];
  const totalDistance = calculateRouteDistance(newPoints);
  const estimatedDuration = estimateTravelTime(totalDistance);

  return {
    ...shipment,
    route: {
      ...shipment.route,
      points: newPoints,
      totalDistance,
      estimatedDuration
    }
  };
};

/**
 * Removes a point from a shipment's route and recalculates distance/duration
 */
export const removePointFromRoute = (shipment: Shipment, pointId: string): Shipment => {
  const newPoints = shipment.route.points.filter((p) => p.id !== pointId);
  const totalDistance = calculateRouteDistance(newPoints);
  const estimatedDuration = estimateTravelTime(totalDistance);

  return {
    ...shipment,
    route: {
      ...shipment.route,
      points: newPoints,
      totalDistance,
      estimatedDuration
    }
  };
};

/**
 * Updates a point in a shipment's route and recalculates distance/duration
 */
export const updatePointInRoute = (shipment: Shipment, updatedPoint: RoutePoint): Shipment => {
  const newPoints = shipment.route.points.map((p) => (p.id === updatedPoint.id ? updatedPoint : p));
  const totalDistance = calculateRouteDistance(newPoints);
  const estimatedDuration = estimateTravelTime(totalDistance);

  return {
    ...shipment,
    route: {
      ...shipment.route,
      points: newPoints,
      totalDistance,
      estimatedDuration
    }
  };
};

/**
 * Reorders points in a shipment's route and recalculates distance/duration
 */
export const reorderRoutePoints = (shipment: Shipment, newPoints: RoutePoint[]): Shipment => {
  const totalDistance = calculateRouteDistance(newPoints);
  const estimatedDuration = estimateTravelTime(totalDistance);

  return {
    ...shipment,
    route: {
      ...shipment.route,
      points: newPoints,
      totalDistance,
      estimatedDuration
    }
  };
};

/**
 * Optimizes a shipment's route
 */
export const optimizeRoute = (shipment: Shipment): Shipment => {
  const optimizedPoints = generateOptimizedRoute(shipment.route.points);
  const totalDistance = calculateRouteDistance(optimizedPoints);
  const estimatedDuration = estimateTravelTime(totalDistance);

  return {
    ...shipment,
    route: {
      ...shipment.route,
      points: optimizedPoints,
      totalDistance,
      estimatedDuration
    }
  };
};

/**
 * Adds mandatory rest stops to a shipment's route
 */
export const addRestStopsToRoute = (shipment: Shipment): Shipment => {
  const pointsWithRest = addRestStops(shipment.route.points);
  const totalDistance = calculateRouteDistance(pointsWithRest);
  const estimatedDuration = estimateTravelTime(totalDistance);

  return {
    ...shipment,
    route: {
      ...shipment.route,
      points: pointsWithRest,
      totalDistance,
      estimatedDuration
    }
  };
};

/**
 * Checks if a route requires mandatory rest stops based on EU regulations
 */
export const requiresRestStops = (totalDistance: number, estimatedDuration: number, currentRestStops: number): boolean => {
  // EU regulation: 45min break after 4.5h driving, or every ~360km
  const requiredRestStops = Math.floor(Math.max(estimatedDuration / 270, totalDistance / 360));
  return requiredRestStops > currentRestStops;
};

/**
 * Gets the warning message for missing rest stops
 */
export const getRestStopWarning = (
  totalDistance: number,
  estimatedDuration: number,
  currentRestStops: number
): string | null => {
  const requiredByTime = Math.floor(estimatedDuration / 270);
  const requiredByDistance = Math.floor(totalDistance / 360);
  const requiredRestStops = Math.max(requiredByTime, requiredByDistance);

  if (requiredRestStops > currentRestStops) {
    const missing = requiredRestStops - currentRestStops;
    return `This route requires ${missing} additional mandatory rest stop${missing > 1 ? 's' : ''} (EU regulation: 45min break every 4.5h driving)`;
  }

  return null;
};
