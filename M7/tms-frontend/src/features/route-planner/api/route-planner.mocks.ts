import { Shipment, RouteData, RoutePoint, Vehicle } from '@/model/shipments';

const MOCK_DELAY = 500;

/**
 * Simulates network delay for mock API calls
 */
export const simulateDelay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY));
};

/**
 * Generates mock route points for testing
 */
export const generateMockRoutePoints = (count: number = 3): RoutePoint[] => {
  const types: RoutePoint['type'][] = ['pickup', 'delivery', 'rest', 'fuel', 'border'];
  const cities = ['Warszawa', 'Kraków', 'Gdańsk', 'Wrocław', 'Poznań', 'Łódź', 'Szczecin'];

  return Array.from({ length: count }, (_, i) => {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const type = types[Math.floor(Math.random() * types.length)];

    return {
      id: `mock-point-${Date.now()}-${i}`,
      coordinates: {
        lat: 50 + Math.random() * 4,
        lng: 17 + Math.random() * 6
      },
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${city}`,
      address: `${city}, Polska`,
      estimatedArrival: new Date(Date.now() + (i + 1) * 2 * 60 * 60 * 1000),
      duration: type === 'rest' ? 45 : type === 'fuel' ? 30 : 60
    };
  });
};

/**
 * Generates a mock vehicle
 */
export const generateMockVehicle = (): Vehicle => ({
  id: `mock-vehicle-${Date.now()}`,
  coordinates: { lat: 52.2297, lng: 21.0122 },
  heading: 180,
  speed: 75,
  driver: 'Jan Kowalski',
  plateNumber: 'WA 12345'
});

/**
 * Generates a mock route
 */
export const generateMockRoute = (): RouteData => {
  const points = generateMockRoutePoints(4);

  return {
    id: `mock-route-${Date.now()}`,
    name: 'Trasa Warszawa - Kraków',
    points,
    vehicle: generateMockVehicle(),
    totalDistance: 350,
    estimatedDuration: 280,
    status: 'active',
    startTime: new Date(),
    estimatedCompletion: new Date(Date.now() + 6 * 60 * 60 * 1000)
  };
};

/**
 * Generates a mock shipment
 */
export const generateMockShipment = (): Shipment => ({
  id: `mock-shipment-${Date.now()}`,
  name: 'Przesyłka testowa',
  customer: 'Test Customer',
  priority: 'medium',
  route: generateMockRoute(),
  createdAt: new Date(),
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
});

/**
 * Generates multiple mock shipments
 */
export const generateMockShipments = (count: number = 5): Shipment[] => {
  const statuses: RouteData['status'][] = ['active', 'planned', 'completed', 'delayed'];
  const priorities: Shipment['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const customers = ['Transport A', 'Logistics B', 'Shipping C', 'Cargo D', 'Freight E'];

  return Array.from({ length: count }, (_, i) => {
    const shipment = generateMockShipment();
    return {
      ...shipment,
      id: `mock-shipment-${i}`,
      name: `Shipment #${i + 1}`,
      customer: customers[i % customers.length],
      priority: priorities[i % priorities.length],
      route: {
        ...shipment.route,
        id: `mock-route-${i}`,
        status: statuses[i % statuses.length]
      }
    };
  });
};
