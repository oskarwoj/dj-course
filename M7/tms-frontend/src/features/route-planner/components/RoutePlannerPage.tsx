import React from 'react';
import {
  ArrowLeft,
  Route as RouteIcon,
  User,
  Truck,
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Shipment } from '@/model/shipments';
import { Driver } from '@/model/drivers';
import { Vehicle as VehicleType } from '@/model/vehicles';
import { RouteContext } from '../models/route-planner.model';
import { useRoutePlanner } from '../hooks/useRoutePlanner';
import { useVehicleSimulation } from '../hooks/useVehicleSimulation';
import { ContextSelector } from './ContextSelector';
import { LogisticsMap } from './LogisticsMap';
import { RouteControls } from './RouteControls';
import { RouteSummary } from './RouteSummary';
import { VehicleStatus } from './VehicleStatus';

interface RoutePlannerPageProps {
  initialContext?: RouteContext;
  initialContextEntity?: Driver | VehicleType;
  shipments: Shipment[];
  drivers?: Driver[];
  vehicles?: VehicleType[];
  onBack?: () => void;
  onShipmentUpdate?: (shipment: Shipment) => void;
  onContextChange?: (context: RouteContext, entity?: Driver | VehicleType) => void;
}

export const RoutePlannerPage: React.FC<RoutePlannerPageProps> = ({
  initialContext = 'active-shipments',
  initialContextEntity,
  shipments,
  drivers = [],
  vehicles = [],
  onBack,
  onShipmentUpdate,
  onContextChange
}) => {
  const {
    context,
    contextEntity,
    selectedShipment,
    pendingPointType,
    statusFilter,
    searchTerm,
    entitySearchTerm,
    showEntityDropdown,
    currentRoute,
    isEditingAllowed,
    filteredShipments,
    entitySuggestions,
    hasValidData,
    setStatusFilter,
    setSearchTerm,
    setEntitySearchTerm,
    setShowEntityDropdown,
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
  } = useRoutePlanner({
    initialContext,
    initialContextEntity,
    shipments,
    drivers,
    vehicles,
    onShipmentUpdate,
    onContextChange
  });

  // Vehicle simulation effect
  useVehicleSimulation({
    selectedShipment,
    context,
    onShipmentUpdate: () => {} // Placeholder - this would update selected shipment
  });

  const getContextTitle = (): string => {
    switch (context) {
      case 'route-planning':
        return 'Route Planning';
      case 'driver-routes':
        return contextEntity ? `Driver Routes - ${(contextEntity as Driver).name}` : 'Driver Routes';
      case 'vehicle-routes':
        return contextEntity
          ? `Vehicle Routes - ${(contextEntity as VehicleType).plateNumber}`
          : 'Vehicle Routes';
      case 'active-shipments':
      default:
        return 'Active Shipments - Route Planner';
    }
  };

  const getContextDescription = (): string => {
    switch (context) {
      case 'route-planning':
        return 'Create and optimize new routes with advanced planning tools';
      case 'driver-routes':
        return contextEntity
          ? `View and track routes assigned to ${(contextEntity as Driver).name}`
          : 'Select a driver to view their routes';
      case 'vehicle-routes':
        return contextEntity
          ? `View and track routes completed by ${(contextEntity as VehicleType).plateNumber}`
          : 'Select a vehicle to view its routes';
      case 'active-shipments':
      default:
        return 'Plan and manage active shipment routes with real-time tracking';
    }
  };

  const getContextIcon = () => {
    switch (context) {
      case 'route-planning':
        return <Navigation className="w-5 h-5 text-blue-600" />;
      case 'driver-routes':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'vehicle-routes':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'active-shipments':
      default:
        return <RouteIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <div className="flex items-center gap-3">
          {getContextIcon()}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getContextTitle()}</h2>
            <p className="text-gray-600">{getContextDescription()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Context and Filters */}
          <ContextSelector
            context={context}
            contextEntity={contextEntity}
            entitySearchTerm={entitySearchTerm}
            showEntityDropdown={showEntityDropdown}
            entitySuggestions={entitySuggestions}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onContextChange={handleContextChange}
            onEntitySelect={handleEntitySelect}
            onEntityClear={handleEntityClear}
            onEntitySearchChange={setEntitySearchTerm}
            onShowEntityDropdown={setShowEntityDropdown}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
          />

          {/* Route Controls */}
          {isEditingAllowed && currentRoute && (
            <RouteControls
              route={currentRoute.route}
              onAddPoint={handleAddPointOfType}
              onOptimizeRoute={handleOptimizeRoute}
              onAddRestStops={handleAddRestStops}
            />
          )}

          {/* Vehicle Status */}
          {currentRoute && <VehicleStatus vehicle={currentRoute.route.vehicle} />}

          {/* Shipment Selector for non-planning contexts */}
          {context !== 'route-planning' && hasValidData && (
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-blue-600" />
                {context === 'active-shipments'
                  ? 'Active Shipments'
                  : context === 'driver-routes'
                    ? 'Driver Routes'
                    : 'Vehicle Routes'}
              </h2>

              {/* Scrollable container */}
              <div className="max-h-80 overflow-y-auto pr-2 -mr-2">
                <div className="grid grid-cols-1 gap-3">
                  {filteredShipments.map((shipment) => (
                    <button
                      key={shipment.id}
                      onClick={() => handleShipmentSelect(shipment)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedShipment?.id === shipment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">{shipment.name}</h3>
                        <div className="flex items-center">
                          {shipment.route.status === 'active' && (
                            <Truck className="w-4 h-4 text-green-600" />
                          )}
                          {shipment.route.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                          {shipment.route.status === 'delayed' && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          {shipment.route.status === 'planned' && (
                            <Clock className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 truncate">{shipment.customer}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            shipment.priority === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : shipment.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : shipment.priority === 'medium'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {shipment.priority.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        {shipment.route.points.length} stops • {shipment.route.totalDistance.toFixed(0)}{' '}
                        km
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {filteredShipments.length > 3 && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Scroll to see more ({filteredShipments.length} total)
                </div>
              )}
            </div>
          )}

          {/* Context-specific information */}
          {context === 'driver-routes' && contextEntity && (
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Driver Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{(contextEntity as Driver).name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">
                    {(contextEntity as Driver).status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Routes:</span>
                  <span className="font-medium">{(contextEntity as Driver).routes.length}</span>
                </div>
              </div>
            </div>
          )}

          {context === 'vehicle-routes' && contextEntity && (
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Vehicle Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plate:</span>
                  <span className="font-medium">{(contextEntity as VehicleType).plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">
                    {(contextEntity as VehicleType).make} {(contextEntity as VehicleType).model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">
                    {(contextEntity as VehicleType).status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mileage:</span>
                  <span className="font-medium">
                    {(contextEntity as VehicleType).mileage.toLocaleString()} km
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* No data message */}
          {!hasValidData && context !== 'route-planning' && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-gray-400 mb-2">
                {context === 'driver-routes' ? (
                  <User className="w-8 h-8 mx-auto" />
                ) : context === 'vehicle-routes' ? (
                  <Truck className="w-8 h-8 mx-auto" />
                ) : (
                  <RouteIcon className="w-8 h-8 mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {context === 'driver-routes' && !contextEntity
                  ? 'Select a Driver'
                  : context === 'vehicle-routes' && !contextEntity
                    ? 'Select a Vehicle'
                    : 'No Routes Available'}
              </h3>
              <p className="text-gray-500 text-sm">
                {context === 'driver-routes' && !contextEntity
                  ? 'Choose a driver to view their routes'
                  : context === 'vehicle-routes' && !contextEntity
                    ? 'Choose a vehicle to view its routes'
                    : 'No routes found for the selected criteria'}
              </p>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Map */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[600px]">
              {currentRoute ? (
                <LogisticsMap
                  points={currentRoute.route.points}
                  vehicle={currentRoute.route.vehicle}
                  onPointAdd={isEditingAllowed ? handleAddPoint : undefined}
                  onPointRemove={isEditingAllowed ? handleRemovePoint : undefined}
                  onPointEdit={isEditingAllowed ? handleEditPoint : undefined}
                  pendingPointType={isEditingAllowed ? pendingPointType : null}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Route Selected</h3>
                    <p className="text-gray-500">
                      {context === 'active-shipments'
                        ? 'Select a shipment to view its route'
                        : context === 'driver-routes'
                          ? 'Select a driver and route to view on the map'
                          : context === 'vehicle-routes'
                            ? 'Select a vehicle and route to view on the map'
                            : 'Start planning your route by adding points to the map'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Route Summary */}
          {currentRoute && (
            <RouteSummary
              route={currentRoute.route}
              onReorderPoints={isEditingAllowed ? handleReorderPoints : undefined}
              allowReordering={isEditingAllowed}
            />
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showEntityDropdown && (
        <div className="fixed inset-0 z-5" onClick={() => setShowEntityDropdown(false)} />
      )}
    </div>
  );
};
