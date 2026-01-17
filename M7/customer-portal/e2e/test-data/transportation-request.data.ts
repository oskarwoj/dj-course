import type { ServiceType } from '../page-objects/transportation-request/steps/service-type-step.page';
import type { PickupInfo } from '../page-objects/transportation-request/steps/pickup-info-step.page';
import type { DeliveryInfo } from '../page-objects/transportation-request/steps/delivery-info-step.page';
import type { CargoInfo } from '../page-objects/transportation-request/steps/cargo-info-step.page';
import type { SpecialInstructions, Priority } from '../page-objects/transportation-request/steps/special-instructions-step.page';
import type { TransportationRequestData } from '../page-objects/transportation-request/transportation-request-wizard.page';

// Get a date in the future (7 days from now)
function getFutureDate(daysFromNow: number = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

export const defaultPickupInfo: PickupInfo = {
  street: 'ul. Testowa 123',
  city: 'Warsaw',
  country: 'Poland',
  contactPerson: 'Jan Kowalski',
  contactPhone: '+48123456789',
  pickupDate: getFutureDate(7),
  loadingType: 'DOCK',
};

export const defaultDeliveryInfo: DeliveryInfo = {
  street: 'Hauptstrasse 456',
  city: 'Berlin',
  country: 'Germany',
  contactPerson: 'Hans Mueller',
  contactPhone: '+49123456789',
  deliveryDate: getFutureDate(10),
  unloadingType: 'DOCK',
};

export const defaultCargoInfo: CargoInfo = {
  description: 'Electronic components and spare parts for manufacturing',
  cargoType: 'GENERAL_CARGO',
  weight: 1500,
  packaging: 'PALLETS',
  quantity: 10,
  value: 25000,
  fragile: true,
  stackable: false,
  requiresInsurance: true,
};

export const defaultSpecialInstructions: SpecialInstructions = {
  instructions: 'Handle with care. Requires temperature-controlled environment.',
  priority: 'NORMAL',
  requiresCustomsClearance: false,
};

export const defaultTransportationRequest: TransportationRequestData = {
  serviceType: 'FULL_TRUCKLOAD',
  pickup: defaultPickupInfo,
  delivery: defaultDeliveryInfo,
  cargo: defaultCargoInfo,
  specialInstructions: defaultSpecialInstructions,
};

// Factory functions for creating test data variants
export function createTransportationRequest(
  overrides: Partial<TransportationRequestData> = {}
): TransportationRequestData {
  return {
    ...defaultTransportationRequest,
    ...overrides,
    pickup: { ...defaultPickupInfo, ...overrides.pickup },
    delivery: { ...defaultDeliveryInfo, ...overrides.delivery },
    cargo: { ...defaultCargoInfo, ...overrides.cargo },
    specialInstructions: { ...defaultSpecialInstructions, ...overrides.specialInstructions },
  };
}

export function createPickupInfo(overrides: Partial<PickupInfo> = {}): PickupInfo {
  return { ...defaultPickupInfo, ...overrides, pickupDate: overrides.pickupDate || getFutureDate(7) };
}

export function createDeliveryInfo(overrides: Partial<DeliveryInfo> = {}): DeliveryInfo {
  return { ...defaultDeliveryInfo, ...overrides, deliveryDate: overrides.deliveryDate || getFutureDate(10) };
}

export function createCargoInfo(overrides: Partial<CargoInfo> = {}): CargoInfo {
  return { ...defaultCargoInfo, ...overrides };
}

export function createSpecialInstructions(overrides: Partial<SpecialInstructions> = {}): SpecialInstructions {
  return { ...defaultSpecialInstructions, ...overrides };
}

// Service type variations
export const serviceTypeVariations: Record<string, TransportationRequestData> = {
  fullTruckload: createTransportationRequest({ serviceType: 'FULL_TRUCKLOAD' }),
  lessThanTruckload: createTransportationRequest({ serviceType: 'LESS_THAN_TRUCKLOAD' }),
  expressDelivery: createTransportationRequest({
    serviceType: 'EXPRESS_DELIVERY',
    specialInstructions: createSpecialInstructions({ priority: 'URGENT' }),
  }),
  oversizedCargo: createTransportationRequest({
    serviceType: 'OVERSIZED_CARGO',
    cargo: createCargoInfo({ cargoType: 'OVERSIZED', weight: 5000 }),
  }),
  hazardousMaterials: createTransportationRequest({
    serviceType: 'HAZARDOUS_MATERIALS',
    cargo: createCargoInfo({ cargoType: 'HAZARDOUS' }),
    specialInstructions: createSpecialInstructions({
      instructions: 'ADR compliant transport required. Handle with extreme care.',
      priority: 'HIGH',
    }),
  }),
};

// Priority variations
export const priorityVariations: Record<Priority, TransportationRequestData> = {
  LOW: createTransportationRequest({ specialInstructions: createSpecialInstructions({ priority: 'LOW' }) }),
  NORMAL: createTransportationRequest({ specialInstructions: createSpecialInstructions({ priority: 'NORMAL' }) }),
  HIGH: createTransportationRequest({ specialInstructions: createSpecialInstructions({ priority: 'HIGH' }) }),
  URGENT: createTransportationRequest({ specialInstructions: createSpecialInstructions({ priority: 'URGENT' }) }),
};

// Country route variations
export const routeVariations = {
  polandToGermany: defaultTransportationRequest,
  polandToCzechRepublic: createTransportationRequest({
    delivery: createDeliveryInfo({ city: 'Prague', country: 'Czech Republic' }),
  }),
  germanyToNetherlands: createTransportationRequest({
    pickup: createPickupInfo({ city: 'Munich', country: 'Germany' }),
    delivery: createDeliveryInfo({ city: 'Amsterdam', country: 'Netherlands' }),
  }),
  franceToBelgium: createTransportationRequest({
    pickup: createPickupInfo({ city: 'Paris', country: 'France' }),
    delivery: createDeliveryInfo({ city: 'Brussels', country: 'Belgium' }),
  }),
};

// Minimal valid data (only required fields)
export const minimalValidRequest: TransportationRequestData = {
  serviceType: 'FULL_TRUCKLOAD',
  pickup: {
    street: 'Test Street 1',
    city: 'Warsaw',
    country: 'Poland',
    contactPerson: 'Contact Person',
    contactPhone: '123456789',
    pickupDate: getFutureDate(7),
  },
  delivery: {
    street: 'Delivery Street 1',
    city: 'Berlin',
    country: 'Germany',
    contactPerson: 'Delivery Contact',
    contactPhone: '987654321',
  },
  cargo: {
    description: 'Test cargo',
    weight: 100,
  },
};
