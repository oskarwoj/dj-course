import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { type CargoInfo, CargoInfoStepPage } from './steps/cargo-info-step.page';
import { type DeliveryInfo, DeliveryInfoStepPage } from './steps/delivery-info-step.page';
import { type PickupInfo, PickupInfoStepPage } from './steps/pickup-info-step.page';
import { ReviewSubmitStepPage } from './steps/review-submit-step.page';
import { type ServiceType, ServiceTypeStepPage } from './steps/service-type-step.page';
import { type SpecialInstructions, SpecialInstructionsStepPage } from './steps/special-instructions-step.page';
import { SuccessModalPage } from './success-modal.page';

export interface TransportationRequestData {
  serviceType: ServiceType;
  pickup: PickupInfo;
  delivery: DeliveryInfo;
  cargo: CargoInfo;
  specialInstructions?: SpecialInstructions;
}

export class TransportationRequestWizardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly timeline: Locator;

  // Step pages
  readonly serviceTypeStep: ServiceTypeStepPage;
  readonly pickupInfoStep: PickupInfoStepPage;
  readonly deliveryInfoStep: DeliveryInfoStepPage;
  readonly cargoInfoStep: CargoInfoStepPage;
  readonly specialInstructionsStep: SpecialInstructionsStepPage;
  readonly reviewSubmitStep: ReviewSubmitStepPage;
  readonly successModal: SuccessModalPage;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: 'New Transportation Request' });
    this.stepTitle = page.locator('.card h2');
    this.stepDescription = page.locator('.card p').first();
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.timeline = page.locator('.mb-8').nth(1);

    // Initialize step pages
    this.serviceTypeStep = new ServiceTypeStepPage(page);
    this.pickupInfoStep = new PickupInfoStepPage(page);
    this.deliveryInfoStep = new DeliveryInfoStepPage(page);
    this.cargoInfoStep = new CargoInfoStepPage(page);
    this.specialInstructionsStep = new SpecialInstructionsStepPage(page);
    this.reviewSubmitStep = new ReviewSubmitStepPage(page);
    this.successModal = new SuccessModalPage(page);
  }

  async navigateToWizard(): Promise<void> {
    await this.navigate('/dashboard/transportation/new');
    await this.waitForPageLoad();
  }

  async expectOnStep(stepNumber: number): Promise<void> {
    const stepTitles: Record<number, string> = {
      1: 'Service Type',
      2: 'Pickup Information',
      3: 'Delivery Information',
      4: 'Cargo Information',
      5: 'Special Instructions',
      6: 'Review & Submit',
    };
    const expectedTitle = stepTitles[stepNumber];
    await expect(this.stepTitle).toContainText(expectedTitle);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async clickBack(): Promise<void> {
    await this.backButton.click();
  }

  async expectNextEnabled(): Promise<void> {
    await expect(this.nextButton).toBeEnabled();
  }

  async expectNextDisabled(): Promise<void> {
    await expect(this.nextButton).toBeDisabled();
  }

  async expectBackVisible(): Promise<void> {
    await expect(this.backButton).toBeVisible();
  }

  async expectBackNotVisible(): Promise<void> {
    await expect(this.backButton).not.toBeVisible();
  }

  // Complete flow helper
  async completeFullFlow(data: TransportationRequestData): Promise<void> {
    // Step 1: Service Type
    await this.expectOnStep(1);
    await this.serviceTypeStep.selectServiceType(data.serviceType);
    await this.clickNext();

    // Step 2: Pickup Information
    await this.expectOnStep(2);
    await this.pickupInfoStep.fillPickupInfo(data.pickup);
    await this.clickNext();

    // Step 3: Delivery Information
    await this.expectOnStep(3);
    await this.deliveryInfoStep.fillDeliveryInfo(data.delivery);
    await this.clickNext();

    // Step 4: Cargo Information
    await this.expectOnStep(4);
    await this.cargoInfoStep.fillCargoInfo(data.cargo);
    await this.clickNext();

    // Step 5: Special Instructions
    await this.expectOnStep(5);
    if (data.specialInstructions) {
      await this.specialInstructionsStep.fillSpecialInstructions(data.specialInstructions);
    }
    await this.clickNext();

    // Step 6: Review & Submit
    await this.expectOnStep(6);
  }

  async submitAndExpectSuccess(): Promise<void> {
    await this.reviewSubmitStep.submitRequest();
    await this.successModal.expectSuccessState();
  }
}
