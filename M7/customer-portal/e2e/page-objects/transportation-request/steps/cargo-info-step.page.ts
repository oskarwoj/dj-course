import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../base.page';

export interface CargoInfo {
  description: string;
  cargoType?: 'GENERAL_CARGO' | 'PERISHABLE' | 'HAZARDOUS' | 'OVERSIZED' | 'VALUABLE';
  weight: number;
  packaging?: 'PALLETS' | 'BOXES' | 'CRATES' | 'BULK' | 'CONTAINERS';
  quantity?: number;
  value?: number;
  fragile?: boolean;
  stackable?: boolean;
  requiresInsurance?: boolean;
}

export class CargoInfoStepPage extends BasePage {
  readonly descriptionTextarea: Locator;
  readonly cargoTypeSelect: Locator;
  readonly weightInput: Locator;
  readonly packagingSelect: Locator;
  readonly quantityInput: Locator;
  readonly valueInput: Locator;
  readonly fragileCheckbox: Locator;
  readonly stackableCheckbox: Locator;
  readonly insuranceCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.descriptionTextarea = page.getByPlaceholder('Describe the cargo to be transported');
    this.cargoTypeSelect = page.locator('select').first();
    this.weightInput = page.getByPlaceholder('Enter weight in kg');
    this.packagingSelect = page.locator('select').nth(1);
    this.quantityInput = page.getByPlaceholder('Number of units');
    this.valueInput = page.getByPlaceholder('Enter estimated value');
    this.fragileCheckbox = page.locator('label').filter({ hasText: 'Fragile' }).locator('input[type="checkbox"]');
    this.stackableCheckbox = page.locator('label').filter({ hasText: 'Stackable' }).locator('input[type="checkbox"]');
    this.insuranceCheckbox = page.locator('label').filter({ hasText: 'Requires Insurance' }).locator('input[type="checkbox"]');
  }

  async fillCargoInfo(info: CargoInfo): Promise<void> {
    await this.fill(this.descriptionTextarea, info.description);
    await this.fill(this.weightInput, info.weight.toString());

    if (info.cargoType) {
      await this.selectOption(this.cargoTypeSelect, info.cargoType);
    }

    if (info.packaging) {
      await this.selectOption(this.packagingSelect, info.packaging);
    }

    if (info.quantity) {
      await this.fill(this.quantityInput, info.quantity.toString());
    }

    if (info.value) {
      await this.fill(this.valueInput, info.value.toString());
    }

    if (info.fragile) {
      await this.checkCheckbox(this.fragileCheckbox);
    }

    if (info.stackable) {
      await this.checkCheckbox(this.stackableCheckbox);
    }

    if (info.requiresInsurance) {
      await this.checkCheckbox(this.insuranceCheckbox);
    }
  }

  async clearAllFields(): Promise<void> {
    await this.descriptionTextarea.clear();
    await this.weightInput.clear();
    await this.quantityInput.clear();
    await this.valueInput.clear();
  }

  getValidationError(fieldName: string): Locator {
    return this.page.locator('.text-red-500').filter({ hasText: new RegExp(fieldName, 'i') });
  }

  async expectDescriptionError(): Promise<void> {
    const error = this.page.locator('.text-red-500').first();
    await expect(error).toBeVisible();
  }

  async expectWeightError(): Promise<void> {
    const error = this.page.locator('.text-red-500').filter({ hasText: /weight/i });
    await expect(error).toBeVisible();
  }
}
