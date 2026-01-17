import { test, expect } from '../../fixtures/auth.fixture';
import { TransportationRequestWizardPage } from '../../page-objects/transportation-request/transportation-request-wizard.page';
import {
  defaultTransportationRequest,
  serviceTypeVariations,
  minimalValidRequest,
  createTransportationRequest,
} from '../../test-data/transportation-request.data';

test.describe('Transportation Request - Happy Path', () => {
  let wizardPage: TransportationRequestWizardPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    wizardPage = new TransportationRequestWizardPage(authenticatedPage);
    await wizardPage.navigateToWizard();
  });

  test('should complete full transportation request flow with all details', async () => {
    // Complete all steps
    await wizardPage.completeFullFlow(defaultTransportationRequest);

    // Verify review step shows correct data
    await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Full Truckload (FTL)');
    await wizardPage.reviewSubmitStep.expectPickupAddressDisplayed(defaultTransportationRequest.pickup.street);
    await wizardPage.reviewSubmitStep.expectDeliveryAddressDisplayed(defaultTransportationRequest.delivery.street);
    await wizardPage.reviewSubmitStep.expectCargoDescriptionDisplayed(defaultTransportationRequest.cargo.description);

    // Submit and verify success
    await wizardPage.submitAndExpectSuccess();

    // Verify reference number is displayed
    const referenceNumber = await wizardPage.successModal.getReferenceNumber();
    expect(referenceNumber).toBeTruthy();
    expect(referenceNumber.length).toBeGreaterThan(0);
  });

  test('should complete request with minimal required fields', async () => {
    await wizardPage.completeFullFlow(minimalValidRequest);
    await wizardPage.submitAndExpectSuccess();
  });

  test('should complete Full Truckload (FTL) request', async () => {
    const request = serviceTypeVariations.fullTruckload;
    await wizardPage.completeFullFlow(request);

    await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Full Truckload (FTL)');
    await wizardPage.submitAndExpectSuccess();
  });

  test('should complete Less Than Truckload (LTL) request', async () => {
    const request = serviceTypeVariations.lessThanTruckload;
    await wizardPage.completeFullFlow(request);

    await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Less Than Truckload (LTL)');
    await wizardPage.submitAndExpectSuccess();
  });

  test('should complete Express Delivery request', async () => {
    const request = serviceTypeVariations.expressDelivery;
    await wizardPage.completeFullFlow(request);

    await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Express Delivery');
    await wizardPage.submitAndExpectSuccess();
  });

  test('should complete Oversized Cargo request', async () => {
    const request = serviceTypeVariations.oversizedCargo;
    await wizardPage.completeFullFlow(request);

    await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Oversized Cargo');
    await wizardPage.submitAndExpectSuccess();
  });

  test('should complete Hazardous Materials request', async () => {
    const request = serviceTypeVariations.hazardousMaterials;
    await wizardPage.completeFullFlow(request);

    await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Hazardous Materials');
    await wizardPage.submitAndExpectSuccess();
  });

  test('should handle request with fragile cargo', async () => {
    const request = createTransportationRequest({
      cargo: {
        description: 'Fragile glass items',
        weight: 500,
        fragile: true,
        stackable: false,
        requiresInsurance: true,
      },
    });

    await wizardPage.completeFullFlow(request);
    await wizardPage.submitAndExpectSuccess();
  });

  test('should handle request requiring customs clearance', async () => {
    const request = createTransportationRequest({
      specialInstructions: {
        instructions: 'Cross-border shipment requiring full customs documentation',
        priority: 'HIGH',
        requiresCustomsClearance: true,
      },
    });

    await wizardPage.completeFullFlow(request);
    await wizardPage.submitAndExpectSuccess();
  });

  test('should display success modal with all elements after submission', async ({ authenticatedPage }) => {
    await wizardPage.completeFullFlow(defaultTransportationRequest);
    await wizardPage.reviewSubmitStep.submitRequest();

    // Verify success modal elements
    await wizardPage.successModal.expectModalVisible();
    await wizardPage.successModal.expectReferenceNumberVisible();
    await wizardPage.successModal.expectNextStepsVisible();

    // Verify action buttons are present
    await expect(wizardPage.successModal.viewRequestButton).toBeVisible();
    await expect(wizardPage.successModal.downloadPdfButton).toBeVisible();
    await expect(wizardPage.successModal.createAnotherButton).toBeVisible();
  });

  test('should navigate to requests list when clicking View Request', async ({ authenticatedPage }) => {
    await wizardPage.completeFullFlow(defaultTransportationRequest);
    await wizardPage.submitAndExpectSuccess();

    await wizardPage.successModal.clickViewRequest();

    // Should navigate to transportation requests list
    await expect(authenticatedPage).toHaveURL(/\/dashboard\/requests\/transportation/);
  });

  test('should reset form when clicking Create Another Request', async ({ authenticatedPage }) => {
    await wizardPage.completeFullFlow(defaultTransportationRequest);
    await wizardPage.submitAndExpectSuccess();

    await wizardPage.successModal.clickCreateAnother();

    // Should navigate back to transportation requests and modal should close
    await expect(authenticatedPage).toHaveURL(/\/dashboard\/requests\/transportation/);
  });
});
