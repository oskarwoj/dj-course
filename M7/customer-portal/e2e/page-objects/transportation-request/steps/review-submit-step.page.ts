import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../../base.page';

export class ReviewSubmitStepPage extends BasePage {
  readonly serviceTypeSection: Locator;
  readonly pickupInfoSection: Locator;
  readonly deliveryInfoSection: Locator;
  readonly cargoInfoSection: Locator;
  readonly specialInstructionsSection: Locator;
  readonly submitButton: Locator;
  readonly submittingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.serviceTypeSection = page.locator('h3').filter({ hasText: 'Service Type' }).locator('..');
    this.pickupInfoSection = page.locator('h3').filter({ hasText: 'Pickup Information' }).locator('..');
    this.deliveryInfoSection = page.locator('h3').filter({ hasText: 'Delivery Information' }).locator('..');
    this.cargoInfoSection = page.locator('h3').filter({ hasText: 'Cargo Information' }).locator('..');
    this.specialInstructionsSection = page.locator('h3').filter({ hasText: 'Special Instructions' }).locator('..');
    this.submitButton = page.getByRole('button', { name: 'Submit Request' });
    this.submittingSpinner = page.locator('.animate-spin');
  }

  getEditButton(sectionName: string): Locator {
    return this.page.locator('h3').filter({ hasText: sectionName }).locator('..').getByRole('button', { name: 'Edit' });
  }

  async clickEditServiceType(): Promise<void> {
    await this.getEditButton('Service Type').click();
  }

  async clickEditPickupInfo(): Promise<void> {
    await this.getEditButton('Pickup Information').click();
  }

  async clickEditDeliveryInfo(): Promise<void> {
    await this.getEditButton('Delivery Information').click();
  }

  async clickEditCargoInfo(): Promise<void> {
    await this.getEditButton('Cargo Information').click();
  }

  async clickEditSpecialInstructions(): Promise<void> {
    await this.getEditButton('Special Instructions').click();
  }

  async submitRequest(): Promise<void> {
    await this.submitButton.click();
  }

  async expectServiceTypeDisplayed(serviceTypeName: string): Promise<void> {
    const section = this.page.locator('h3').filter({ hasText: 'Service Type' }).locator('..').locator('..');
    await expect(section).toContainText(serviceTypeName);
  }

  async expectPickupAddressDisplayed(address: string): Promise<void> {
    const section = this.page.locator('h3').filter({ hasText: 'Pickup Information' }).locator('..').locator('..');
    await expect(section).toContainText(address);
  }

  async expectDeliveryAddressDisplayed(address: string): Promise<void> {
    const section = this.page.locator('h3').filter({ hasText: 'Delivery Information' }).locator('..').locator('..');
    await expect(section).toContainText(address);
  }

  async expectCargoDescriptionDisplayed(description: string): Promise<void> {
    const section = this.page.locator('h3').filter({ hasText: 'Cargo Information' }).locator('..').locator('..');
    await expect(section).toContainText(description);
  }

  async expectSubmitting(): Promise<void> {
    await expect(this.submittingSpinner).toBeVisible();
  }
}
