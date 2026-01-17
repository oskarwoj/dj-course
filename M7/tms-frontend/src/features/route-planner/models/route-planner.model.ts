import { Shipment, RoutePoint, RouteData, Vehicle, Coordinates } from '@/model/shipments';
import { Driver } from '@/model/drivers';
import { Vehicle as VehicleType } from '@/model/vehicles';

export type RouteContext = 'active-shipments' | 'driver-routes' | 'vehicle-routes' | 'route-planning';

export type StatusFilter = 'all' | 'active' | 'completed' | 'planned' | 'delayed';

export interface RoutePlannerState {
  context: RouteContext;
  contextEntity: Driver | VehicleType | undefined;
  selectedShipment: Shipment | null;
  planningRoute: Shipment;
  pendingPointType: RoutePoint['type'] | null;
  statusFilter: StatusFilter;
  searchTerm: string;
  entitySearchTerm: string;
  showEntityDropdown: boolean;
}

export interface ContextOption {
  value: RouteContext;
  label: string;
  icon: React.ReactNode;
}

export interface EntitySuggestion {
  id: string;
  name: string;
  type: 'driver' | 'vehicle';
  entity: Driver | VehicleType;
}

export interface PointTypeConfig {
  type: RoutePoint['type'];
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  badgeColor: string;
}

// Re-export commonly used types from model
export type { Shipment, RoutePoint, RouteData, Vehicle, Coordinates } from '@/model/shipments';
export type { Driver, DriverRoute } from '@/model/drivers';
export type { Vehicle as VehicleType } from '@/model/vehicles';
