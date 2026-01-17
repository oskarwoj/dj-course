import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../../base.page';

export type ServiceType =
  | 'FULL_TRUCKLOAD'
  | 'LESS_THAN_TRUCKLOAD'
  | 'EXPRESS_DELIVERY'
  | 'OVERSIZED_CARGO'
  | 'HAZARDOUS_MATERIALS';

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  FULL_TRUCKLOAD: 'Full Truckload (FTL)',
  LESS_THAN_TRUCKLOAD: 'Less Than Truckload (LTL)',
  EXPRESS_DELIVERY: 'Express Delivery',
  OVERSIZED_CARGO: 'Oversized Cargo',
  HAZARDOUS_MATERIALS: 'Hazardous Materials',
};

export class ServiceTypeStepPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  getServiceCard(serviceType: ServiceType): Locator {
    const label = SERVICE_TYPE_LABELS[serviceType];
    return this.page.locator('label').filter({ hasText: label });
  }

  async selectServiceType(serviceType: ServiceType): Promise<void> {
    const card = this.getServiceCard(serviceType);
    await card.click();
  }

  async isServiceTypeSelected(serviceType: ServiceType): Promise<boolean> {
    const card = this.getServiceCard(serviceType);
    const classes = await card.getAttribute('class');
    return classes?.includes('ring-2') ?? false;
  }

  async expectServiceTypeSelected(serviceType: ServiceType): Promise<void> {
    const card = this.getServiceCard(serviceType);
    await expect(card).toHaveClass(/ring-2/);
  }

  async expectValidationError(): Promise<void> {
    const errorMessage = this.page.locator('.text-red-500').filter({ hasText: /service type/i });
    await expect(errorMessage).toBeVisible();
  }

  getValidationError(): Locator {
    return this.page.locator('div').filter({ hasText: /Please select a service type/i });
  }
}
