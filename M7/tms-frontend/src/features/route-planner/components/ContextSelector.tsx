import React from 'react';
import { Search, Filter, X, User, Truck, Navigation, Route as RouteIcon } from 'lucide-react';
import { RouteContext, StatusFilter, EntitySuggestion } from '../models/route-planner.model';
import { Driver } from '@/model/drivers';
import { Vehicle as VehicleType } from '@/model/vehicles';

interface ContextOption {
  value: RouteContext;
  label: string;
  icon: React.ReactNode;
}

const CONTEXT_OPTIONS: ContextOption[] = [
  {
    value: 'route-planning',
    label: 'Route Planning',
    icon: <Navigation className="w-4 h-4" />
  },
  {
    value: 'active-shipments',
    label: 'Active Shipments',
    icon: <RouteIcon className="w-4 h-4" />
  },
  {
    value: 'driver-routes',
    label: 'Driver Routes',
    icon: <User className="w-4 h-4" />
  },
  {
    value: 'vehicle-routes',
    label: 'Vehicle Routes',
    icon: <Truck className="w-4 h-4" />
  }
];

interface ContextSelectorProps {
  context: RouteContext;
  contextEntity: Driver | VehicleType | undefined;
  entitySearchTerm: string;
  showEntityDropdown: boolean;
  entitySuggestions: EntitySuggestion[];
  searchTerm: string;
  statusFilter: StatusFilter;
  onContextChange: (context: RouteContext) => void;
  onEntitySelect: (suggestion: EntitySuggestion) => void;
  onEntityClear: () => void;
  onEntitySearchChange: (value: string) => void;
  onShowEntityDropdown: (show: boolean) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  context,
  contextEntity,
  entitySearchTerm,
  showEntityDropdown,
  entitySuggestions,
  searchTerm,
  statusFilter,
  onContextChange,
  onEntitySelect,
  onEntityClear,
  onEntitySearchChange,
  onShowEntityDropdown,
  onSearchChange,
  onStatusFilterChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="space-y-4">
        {/* Context Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
          <select
            value={context}
            onChange={(e) => onContextChange(e.target.value as RouteContext)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {CONTEXT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Selector (for driver/vehicle routes) */}
        {(context === 'driver-routes' || context === 'vehicle-routes') && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {context === 'driver-routes' ? 'Select Driver' : 'Select Vehicle'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${context === 'driver-routes' ? 'drivers' : 'vehicles'}...`}
                value={entitySearchTerm}
                onChange={(e) => {
                  onEntitySearchChange(e.target.value);
                  onShowEntityDropdown(true);
                }}
                onFocus={() => onShowEntityDropdown(true)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {contextEntity && (
                <button
                  onClick={onEntityClear}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown with suggestions */}
            {showEntityDropdown && entitySuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {entitySuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => onEntitySelect(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'driver' ? (
                        <User className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Truck className="w-4 h-4 text-purple-500" />
                      )}
                      <span className="font-medium">{suggestion.name}</span>
                    </div>
                    {suggestion.type === 'driver' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Status: {(suggestion.entity as Driver).status.replace('-', ' ')}
                      </div>
                    )}
                    {suggestion.type === 'vehicle' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {(suggestion.entity as VehicleType).year} •{' '}
                        {(suggestion.entity as VehicleType).status.replace('-', ' ')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Routes - Only show for non-planning contexts */}
        {context !== 'route-planning' && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="planned">Planned</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
