import { atom } from 'jotai';
import { Shipment, RoutePoint } from '@/model/shipments';
import { Driver } from '@/model/drivers';
import { Vehicle as VehicleType } from '@/model/vehicles';
import { RouteContext, StatusFilter } from '../models/route-planner.model';
import { createDefaultPlanningRoute } from '../services/route-conversion.service';

// Point type for pending state
type PendingPointType = RoutePoint['type'] | null;

// Core state atoms
export const routeContextAtom = atom<RouteContext>('active-shipments');
export const contextEntityAtom = atom<Driver | VehicleType | undefined>(undefined);
export const selectedShipmentAtom = atom<Shipment | null>(null);
export const planningRouteAtom = atom<Shipment>(createDefaultPlanningRoute());
export const pendingPointTypeAtom = atom<PendingPointType>(null);

// Filter and search atoms
export const statusFilterAtom = atom<StatusFilter>('all');
export const searchTermAtom = atom<string>('');
export const entitySearchTermAtom = atom<string>('');
export const showEntityDropdownAtom = atom<boolean>(false);

// Derived atoms
export const currentRouteAtom = atom((get) => {
  const context = get(routeContextAtom);
  if (context === 'route-planning') {
    return get(planningRouteAtom);
  }
  return get(selectedShipmentAtom);
});

export const isEditingAllowedAtom = atom((get) => {
  const context = get(routeContextAtom);
  return context === 'active-shipments' || context === 'route-planning';
});

// Actions (write-only atoms)
export const resetRoutePlannerAtom = atom(null, (_, set) => {
  set(routeContextAtom, 'active-shipments');
  set(contextEntityAtom, undefined);
  set(selectedShipmentAtom, null);
  set(planningRouteAtom, createDefaultPlanningRoute());
  set(pendingPointTypeAtom, null);
  set(statusFilterAtom, 'all');
  set(searchTermAtom, '');
  set(entitySearchTermAtom, '');
  set(showEntityDropdownAtom, false);
});

export const clearPendingPointTypeAtom = atom(null, (_, set) => {
  set(pendingPointTypeAtom, null);
});

export const changeContextAtom = atom(null, (_, set, newContext: RouteContext) => {
  set(routeContextAtom, newContext);
  set(contextEntityAtom, undefined);
  set(entitySearchTermAtom, '');
  set(showEntityDropdownAtom, false);
  set(pendingPointTypeAtom, null);
});
