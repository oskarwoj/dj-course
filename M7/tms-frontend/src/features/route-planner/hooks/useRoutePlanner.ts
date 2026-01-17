import { useCallback, useEffect, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Shipment, RoutePoint, Coordinates } from '@/model/shipments';
import { Driver } from '@/model/drivers';
import { Vehicle as VehicleType } from '@/model/vehicles';
import {
  routeContextAtom,
  contextEntityAtom,
  selectedShipmentAtom,
  planningRouteAtom,
  pendingPointTypeAtom,
  statusFilterAtom,
  searchTermAtom,
  entitySearchTermAtom,
  showEntityDropdownAtom,
  currentRouteAtom,
  isEditingAllowedAtom,
  changeContextAtom
} from '../store/route-planner.store';
import { RouteContext, EntitySuggestion } from '../models/route-planner.model';
import { convertDriverRouteToShipment, generateVehicleRouteShipments } from '../services/route-conversion.service';
import {
  createRoutePoint,
  addPointToRoute,
  removePointFromRoute,
  updatePointInRoute,
  reorderRoutePoints,
  optimizeRoute,
  addRestStopsToRoute
} from '../services/route-operations.service';

interface UseRoutePlannerProps {
  initialContext?: RouteContext;
  initialContextEntity?: Driver | VehicleType;
  shipments: Shipment[];
  drivers?: Driver[];
  vehicles?: VehicleType[];
  onShipmentUpdate?: (shipment: Shipment) => void;
  onContextChange?: (context: RouteContext, entity?: Driver | VehicleType) => void;
}

export const useRoutePlanner = ({
  initialContext = 'active-shipments',
  initialContextEntity,
  shipments: initialShipments,
  drivers = [],
  vehicles = [],
  onShipmentUpdate,
  onContextChange
}: UseRoutePlannerProps) => {
  const [context, setContext] = useAtom(routeContextAtom);
  const [contextEntity, setContextEntity] = useAtom(contextEntityAtom);
  const [selectedShipment, setSelectedShipment] = useAtom(selectedShipmentAtom);
  const [planningRoute, setPlanningRoute] = useAtom(planningRouteAtom);
  const [pendingPointType, setPendingPointType] = useAtom(pendingPointTypeAtom);
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [entitySearchTerm, setEntitySearchTerm] = useAtom(entitySearchTermAtom);
  const [showEntityDropdown, setShowEntityDropdown] = useAtom(showEntityDropdownAtom);
  const currentRoute = useAtomValue(currentRouteAtom);
  const isEditingAllowed = useAtomValue(isEditingAllowedAtom);
  const changeContext = useSetAtom(changeContextAtom);

  // Initialize context and entity from props
  useEffect(() => {
    if (initialContext) {
      setContext(initialContext);
    }
    if (initialContextEntity) {
      setContextEntity(initialContextEntity);
      if ('name' in initialContextEntity) {
        setEntitySearchTerm(initialContextEntity.name);
      } else if ('plateNumber' in initialContextEntity) {
        setEntitySearchTerm(`${initialContextEntity.plateNumber} - ${initialContextEntity.make} ${initialContextEntity.model}`);
      }
    }
  }, [initialContext, initialContextEntity, setContext, setContextEntity, setEntitySearchTerm]);

  // Determine the shipments to display based on context
  const contextualShipments = useMemo((): Shipment[] => {
    switch (context) {
      case 'route-planning':
        return [];

      case 'driver-routes':
        if (contextEntity && 'routes' in contextEntity) {
          return (contextEntity as Driver).routes.map((route) =>
            convertDriverRouteToShipment(route, contextEntity as Driver)
          );
        }
        return [];

      case 'vehicle-routes':
        if (contextEntity && 'plateNumber' in contextEntity) {
          return generateVehicleRouteShipments(contextEntity as VehicleType);
        }
        return [];

      case 'active-shipments':
      default:
        return initialShipments;
    }
  }, [context, contextEntity, initialShipments]);

  // Update selected shipment when context changes
  useEffect(() => {
    if (context === 'route-planning') {
      setSelectedShipment(planningRoute);
    } else if (contextualShipments.length > 0) {
      setSelectedShipment(contextualShipments[0]);
    } else {
      setSelectedShipment(null);
    }
  }, [context, contextEntity, contextualShipments, planningRoute, setSelectedShipment]);

  // Filter shipments based on search and status
  const filteredShipments = useMemo(() => {
    return contextualShipments.filter((shipment) => {
      const matchesSearch =
        shipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.route.vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || shipment.route.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contextualShipments, searchTerm, statusFilter]);

  // Generate entity suggestions
  const entitySuggestions = useMemo((): EntitySuggestion[] => {
    if (context === 'active-shipments' || context === 'route-planning' || !entitySearchTerm) return [];

    const suggestions: EntitySuggestion[] = [];

    if (context === 'driver-routes') {
      drivers
        .filter((driver) => driver.name.toLowerCase().includes(entitySearchTerm.toLowerCase()))
        .slice(0, 5)
        .forEach((driver) => {
          suggestions.push({
            id: driver.id,
            name: driver.name,
            type: 'driver',
            entity: driver
          });
        });
    } else if (context === 'vehicle-routes') {
      vehicles
        .filter(
          (vehicle) =>
            vehicle.plateNumber.toLowerCase().includes(entitySearchTerm.toLowerCase()) ||
            `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(entitySearchTerm.toLowerCase())
        )
        .slice(0, 5)
        .forEach((vehicle) => {
          suggestions.push({
            id: vehicle.id,
            name: `${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model}`,
            type: 'vehicle',
            entity: vehicle
          });
        });
    }

    return suggestions;
  }, [context, entitySearchTerm, drivers, vehicles]);

  // Handlers
  const handleContextChange = useCallback(
    (newContext: RouteContext) => {
      changeContext(newContext);
      onContextChange?.(newContext);
    },
    [changeContext, onContextChange]
  );

  const handleEntitySelect = useCallback(
    (suggestion: EntitySuggestion) => {
      setContextEntity(suggestion.entity);
      setEntitySearchTerm(suggestion.name);
      setShowEntityDropdown(false);
      onContextChange?.(context, suggestion.entity);
    },
    [context, setContextEntity, setEntitySearchTerm, setShowEntityDropdown, onContextChange]
  );

  const handleEntityClear = useCallback(() => {
    setContextEntity(undefined);
    setEntitySearchTerm('');
    onContextChange?.(context);
  }, [context, setContextEntity, setEntitySearchTerm, onContextChange]);

  const handleAddPoint = useCallback(
    (coordinates: Coordinates, type: RoutePoint['type']) => {
      const targetShipment = context === 'route-planning' ? planningRoute : selectedShipment;
      if (!targetShipment) return;

      const newPoint = createRoutePoint(coordinates, type, targetShipment.route.points.length);
      const updatedShipment = addPointToRoute(targetShipment, newPoint);

      if (context === 'route-planning') {
        setPlanningRoute(updatedShipment);
      } else {
        setSelectedShipment(updatedShipment);
        onShipmentUpdate?.(updatedShipment);
      }

      setPendingPointType(null);
    },
    [context, planningRoute, selectedShipment, setPlanningRoute, setSelectedShipment, setPendingPointType, onShipmentUpdate]
  );

  const handleRemovePoint = useCallback(
    (pointId: string) => {
      const targetShipment = context === 'route-planning' ? planningRoute : selectedShipment;
      if (!targetShipment) return;

      const updatedShipment = removePointFromRoute(targetShipment, pointId);

      if (context === 'route-planning') {
        setPlanningRoute(updatedShipment);
      } else {
        setSelectedShipment(updatedShipment);
        onShipmentUpdate?.(updatedShipment);
      }
    },
    [context, planningRoute, selectedShipment, setPlanningRoute, setSelectedShipment, onShipmentUpdate]
  );

  const handleEditPoint = useCallback(
    (updatedPoint: RoutePoint) => {
      const targetShipment = context === 'route-planning' ? planningRoute : selectedShipment;
      if (!targetShipment) return;

      const updatedShipment = updatePointInRoute(targetShipment, updatedPoint);

      if (context === 'route-planning') {
        setPlanningRoute(updatedShipment);
      } else {
        setSelectedShipment(updatedShipment);
        onShipmentUpdate?.(updatedShipment);
      }
    },
    [context, planningRoute, selectedShipment, setPlanningRoute, setSelectedShipment, onShipmentUpdate]
  );

  const handleReorderPoints = useCallback(
    (newPoints: RoutePoint[]) => {
      const targetShipment = context === 'route-planning' ? planningRoute : selectedShipment;
      if (!targetShipment) return;

      const updatedShipment = reorderRoutePoints(targetShipment, newPoints);

      if (context === 'route-planning') {
        setPlanningRoute(updatedShipment);
      } else {
        setSelectedShipment(updatedShipment);
        onShipmentUpdate?.(updatedShipment);
      }
    },
    [context, planningRoute, selectedShipment, setPlanningRoute, setSelectedShipment, onShipmentUpdate]
  );

  const handleOptimizeRoute = useCallback(() => {
    const targetShipment = context === 'route-planning' ? planningRoute : selectedShipment;
    if (!targetShipment) return;

    const updatedShipment = optimizeRoute(targetShipment);

    if (context === 'route-planning') {
      setPlanningRoute(updatedShipment);
    } else {
      setSelectedShipment(updatedShipment);
      onShipmentUpdate?.(updatedShipment);
    }
  }, [context, planningRoute, selectedShipment, setPlanningRoute, setSelectedShipment, onShipmentUpdate]);

  const handleAddRestStops = useCallback(() => {
    const targetShipment = context === 'route-planning' ? planningRoute : selectedShipment;
    if (!targetShipment) return;

    const updatedShipment = addRestStopsToRoute(targetShipment);

    if (context === 'route-planning') {
      setPlanningRoute(updatedShipment);
    } else {
      setSelectedShipment(updatedShipment);
      onShipmentUpdate?.(updatedShipment);
    }
  }, [context, planningRoute, selectedShipment, setPlanningRoute, setSelectedShipment, onShipmentUpdate]);

  const handleAddPointOfType = useCallback(
    (type: RoutePoint['type']) => {
      setPendingPointType(type);
    },
    [setPendingPointType]
  );

  const handleShipmentSelect = useCallback(
    (shipment: Shipment) => {
      setSelectedShipment(shipment);
      setPendingPointType(null);
    },
    [setSelectedShipment, setPendingPointType]
  );

  const hasValidData =
    (context === 'route-planning' && planningRoute) || (contextualShipments.length > 0 && selectedShipment);

  return {
    // State
    context,
    contextEntity,
    selectedShipment,
    planningRoute,
    pendingPointType,
    statusFilter,
    searchTerm,
    entitySearchTerm,
    showEntityDropdown,
    currentRoute,
    isEditingAllowed,
    contextualShipments,
    filteredShipments,
    entitySuggestions,
    hasValidData,

    // Setters
    setStatusFilter,
    setSearchTerm,
    setEntitySearchTerm,
    setShowEntityDropdown,

    // Handlers
    handleContextChange,
    handleEntitySelect,
    handleEntityClear,
    handleAddPoint,
    handleRemovePoint,
    handleEditPoint,
    handleReorderPoints,
    handleOptimizeRoute,
    handleAddRestStops,
    handleAddPointOfType,
    handleShipmentSelect
  };
};
