/**
 * Data transformation utilities for converting backend API responses to frontend types
 * Backend uses snake_case, frontend uses camelCase
 */

import { Driver, DriverRoute, CalendarEvent } from '../model/drivers/driver.types';
import { Vehicle, MaintenanceRecord } from '../model/vehicles/vehicle.types';
import { UIShipment } from '../model/shipments/ui.types';

/**
 * Transform backend driver data to frontend Driver type
 */
export function transformDriver(backendDriver: any): Driver {
  const profileData = backendDriver.profile_data || {};
  
  return {
    id: String(backendDriver.id),
    name: backendDriver.name,
    email: backendDriver.email,
    phone: backendDriver.phone || '',
    
    // Address from profile_data or defaults
    address: profileData.address || {
      street: '',
      city: '',
      postalCode: '',
      country: ''
    },
    
    contractType: profileData.contractType || 'full-time',
    salary: profileData.salary || 0,
    currency: profileData.currency || 'USD',
    licenseNumber: backendDriver.license_number || '',
    licenseExpiry: profileData.licenseExpiry ? new Date(profileData.licenseExpiry) : new Date(),
    hireDate: backendDriver.hire_date ? new Date(backendDriver.hire_date) : new Date(),
    
    // Current location from profile_data
    currentLocation: profileData.currentLocation,
    
    // Map backend status to frontend status
    status: mapDriverStatus(backendDriver.status),
    
    // Emergency contact from profile_data
    emergencyContact: profileData.emergencyContact || profileData.emergency_contacts?.[0] || {
      name: '',
      phone: '',
      relationship: ''
    },
    
    // Routes and calendar events
    routes: (profileData.routes || []).map(transformDriverRoute),
    calendarEvents: (profileData.calendarEvents || profileData.calendar_events || []).map(transformCalendarEvent)
  };
}

/**
 * Map backend driver status to frontend status
 */
function mapDriverStatus(status: string): Driver['status'] {
  const statusMap: Record<string, Driver['status']> = {
    'active': 'active',
    'on-route': 'on-route',
    'off-duty': 'off-duty',
    'resting': 'resting',
    'sick-leave': 'sick-leave'
  };
  
  return statusMap[status] || 'off-duty';
}

/**
 * Transform backend driver route to frontend DriverRoute type
 */
function transformDriverRoute(route: any): DriverRoute {
  return {
    id: String(route.id),
    name: route.name,
    startDate: new Date(route.startDate || route.start_date),
    endDate: new Date(route.endDate || route.end_date),
    origin: route.origin,
    destination: route.destination,
    distance: route.distance,
    status: route.status,
    points: route.points || []
  };
}

/**
 * Transform backend calendar event to frontend CalendarEvent type
 */
function transformCalendarEvent(event: any): CalendarEvent {
  return {
    id: String(event.id),
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    type: event.type,
    description: event.description,
    routeId: event.routeId || event.route_id
  };
}

/**
 * Transform backend vehicle data to frontend Vehicle type
 */
export function transformVehicle(backendVehicle: any): Vehicle {
  const maintenanceHistory = backendVehicle.maintenance_history || [];
  
  return {
    id: String(backendVehicle.id),
    plateNumber: backendVehicle.plate_number,
    make: backendVehicle.make,
    model: backendVehicle.model,
    year: backendVehicle.year,
    type: backendVehicle.type || 'standard',
    status: backendVehicle.status,
    mileage: backendVehicle.mileage || 0,
    
    capacity: {
      weight: 0, // TODO: Add to backend
      volume: 0  // TODO: Add to backend
    },
    
    cargoTypes: [], // TODO: Add to backend
    currentDriver: undefined, // TODO: Add to backend
    currentLocation: undefined, // TODO: Add to backend
    
    ownership: {
      type: 'owned' // TODO: Add to backend
    },
    
    documents: [], // TODO: Add documents support
    maintenanceHistory: maintenanceHistory.map(transformMaintenanceRecord),
    maintenanceTasks: [] // TODO: Add to backend
  };
}

/**
 * Transform backend maintenance record to frontend MaintenanceRecord type
 */
function transformMaintenanceRecord(record: any): MaintenanceRecord {
  return {
    id: String(record.id || Math.random()),
    date: record.date,
    type: record.type,
    description: record.notes || record.description || '',
    cost: record.cost || 0,
    mileage: record.mileage || 0,
    duration: record.duration || 0,
    serviceProvider: record.serviceProvider || record.service_provider || 'Unknown',
    technician: record.technician || 'Unknown',
    status: 'completed', // Maintenance history is always completed
    notes: record.notes
  };
}

/**
 * Transform backend shipment data to frontend UIShipment type
 */
export function transformShipment(backendShipment: any): UIShipment {
  return {
    id: String(backendShipment.id),
    driver: backendShipment.driver_name || `Driver ${backendShipment.driver_id || 'N/A'}`,
    status: backendShipment.status,
    origin: backendShipment.origin || '',
    destination: backendShipment.destination || '',
    eta: backendShipment.eta || 'N/A',
    elapsedTime: backendShipment.elapsed_time,
    distanceCovered: backendShipment.distance_covered,
    totalDistance: backendShipment.total_distance,
    delay: backendShipment.delay || false,
    estimatedDelay: backendShipment.estimated_delay || null
  };
}

/**
 * Transform snake_case to camelCase for generic objects
 */
export function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = snakeToCamel(obj[key]);
    }
  }
  
  return result;
}
