import { RoutePoint } from '@/model/shipments';
import { PointTypeConfig } from '../models/route-planner.model';

export const POINT_TYPE_CONFIGS: Record<RoutePoint['type'], PointTypeConfig> = {
  pickup: {
    type: 'pickup',
    label: 'Pickup Point',
    icon: '📦',
    color: '#10B981',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    textColor: 'text-green-600',
    badgeColor: 'bg-green-100 text-green-800'
  },
  delivery: {
    type: 'delivery',
    label: 'Delivery Point',
    icon: '🏭',
    color: '#F59E0B',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
    textColor: 'text-amber-600',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  rest: {
    type: 'rest',
    label: 'Rest Stop',
    icon: '🛏️',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    textColor: 'text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  fuel: {
    type: 'fuel',
    label: 'Fuel Station',
    icon: '⛽',
    color: '#EF4444',
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
    textColor: 'text-red-600',
    badgeColor: 'bg-red-100 text-red-800'
  },
  border: {
    type: 'border',
    label: 'Border Crossing',
    icon: '🛂',
    color: '#6B7280',
    bgColor: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
    textColor: 'text-gray-600',
    badgeColor: 'bg-gray-100 text-gray-800'
  }
};

export const getPointTypeConfig = (type: RoutePoint['type']): PointTypeConfig => {
  return POINT_TYPE_CONFIGS[type];
};

export const getPointTypeLabel = (type: RoutePoint['type']): string => {
  const labels: Record<RoutePoint['type'], string> = {
    pickup: 'Pickup Location',
    delivery: 'Delivery Location',
    rest: 'Rest Stop',
    fuel: 'Fuel Station',
    border: 'Border Crossing'
  };
  return labels[type];
};

export const getPointTypeColor = (type: RoutePoint['type']): string => {
  return POINT_TYPE_CONFIGS[type].color;
};

export const getPointTypeBgClass = (type: RoutePoint['type']): string => {
  const classes: Record<RoutePoint['type'], string> = {
    pickup: 'bg-green-500',
    delivery: 'bg-amber-500',
    rest: 'bg-purple-500',
    fuel: 'bg-red-500',
    border: 'bg-gray-500'
  };
  return classes[type];
};

export const getPointTypeBadgeClass = (type: RoutePoint['type']): string => {
  return POINT_TYPE_CONFIGS[type].badgeColor;
};

export const getPointTypeTextClass = (type: RoutePoint['type']): string => {
  return POINT_TYPE_CONFIGS[type].textColor;
};

export const ALL_POINT_TYPES: RoutePoint['type'][] = ['pickup', 'delivery', 'rest', 'fuel', 'border'];
