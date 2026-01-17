import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../../base.page';

export interface PickupInfo {
  street: string;
  city: string;
  country: string;
  contactPerson: string;
  contactPhone: string;
  pickupDate: string;
  loadingType?: 'DOCK' | 'GROUND' | 'CRANE' | 'FORKLIFT';
}

export class PickupInfoStepPage extends BasePage {
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly countrySelect: Locator;
  readonly contactPersonInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly pickupDateInput: Locator;
  readonly loadingTypeSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.streetInput = page.getByPlaceholder('Enter pickup address');
    this.cityInput = page.locator('input[placeholder="Enter city"]').first();
    this.countrySelect = page.locator('select').first();
    this.contactPersonInput = page.getByPlaceholder('Contact person name').first();
    this.contactPhoneInput = page.getByPlaceholder('Phone number').first();
    this.pickupDateInput = page.locator('input[type="date"]').first();
    this.loadingTypeSelect = page.locator('select').nth(1);
  }

  async fillPickupInfo(info: PickupInfo): Promise<void> {
    await this.fill(this.streetInput, info.street);
    await this.fill(this.cityInput, info.city);
    await this.selectOption(this.countrySelect, info.country);
    await this.fill(this.contactPersonInput, info.contactPerson);
    await this.fill(this.contactPhoneInput, info.contactPhone);
    await this.fill(this.pickupDateInput, info.pickupDate);

    if (info.loadingType) {
      await this.selectOption(this.loadingTypeSelect, info.loadingType);
    }
  }

  async clearAllFields(): Promise<void> {
    await this.streetInput.clear();
    await this.cityInput.clear();
    await this.contactPersonInput.clear();
    await this.contactPhoneInput.clear();
    await this.pickupDateInput.clear();
  }

  getValidationError(fieldName: string): Locator {
    return this.page.locator('.text-red-500').filter({ hasText: new RegExp(fieldName, 'i') });
  }

  async expectValidationErrors(fields: string[]): Promise<void> {
    for (const field of fields) {
      const error = this.getValidationError(field);
      await expect(error).toBeVisible();
    }
  }

  async expectStreetError(): Promise<void> {
    const error = this.page.locator('.text-red-500').first();
    await expect(error).toBeVisible();
  }
}
