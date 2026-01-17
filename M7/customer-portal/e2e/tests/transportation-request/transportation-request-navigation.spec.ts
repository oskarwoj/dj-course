import { test, expect } from '../../fixtures/auth.fixture';
import { TransportationRequestWizardPage } from '../../page-objects/transportation-request/transportation-request-wizard.page';
import {
  defaultPickupInfo,
  defaultDeliveryInfo,
  defaultCargoInfo,
  defaultSpecialInstructions,
} from '../../test-data/transportation-request.data';

test.describe('Transportation Request - Navigation', () => {
  let wizardPage: TransportationRequestWizardPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    wizardPage = new TransportationRequestWizardPage(authenticatedPage);
    await wizardPage.navigateToWizard();
  });

  test.describe('Back Button Navigation', () => {
    test('should not show Back button on step 1', async () => {
      await wizardPage.expectOnStep(1);
      await wizardPage.expectBackNotVisible();
    });

    test('should show Back button on step 2', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(2);
      await wizardPage.expectBackVisible();
    });

    test('should navigate back from step 2 to step 1', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(2);

      await wizardPage.clickBack();
      await wizardPage.expectOnStep(1);
    });

    test('should navigate back from step 3 to step 2', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(3);

      await wizardPage.clickBack();
      await wizardPage.expectOnStep(2);
    });

    test('should navigate back through all steps to step 1', async () => {
      // Go to step 6
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.clickNext();
      await wizardPage.clickNext(); // Skip special instructions
      await wizardPage.expectOnStep(6);

      // Navigate back through all steps
      await wizardPage.clickBack();
      await wizardPage.expectOnStep(5);
      await wizardPage.clickBack();
      await wizardPage.expectOnStep(4);
      await wizardPage.clickBack();
      await wizardPage.expectOnStep(3);
      await wizardPage.clickBack();
      await wizardPage.expectOnStep(2);
      await wizardPage.clickBack();
      await wizardPage.expectOnStep(1);
    });
  });

  test.describe('Data Persistence During Navigation', () => {
    test('should preserve service type selection when navigating back and forward', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('EXPRESS_DELIVERY');
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(2);

      await wizardPage.clickBack();
      await wizardPage.expectOnStep(1);

      // Service type should still be selected
      await wizardPage.serviceTypeStep.expectServiceTypeSelected('EXPRESS_DELIVERY');
    });

    test('should preserve pickup info when navigating back and forward', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(3);

      await wizardPage.clickBack();
      await wizardPage.expectOnStep(2);

      // Verify data is preserved
      await expect(wizardPage.pickupInfoStep.streetInput).toHaveValue(defaultPickupInfo.street);
      await expect(wizardPage.pickupInfoStep.cityInput).toHaveValue(defaultPickupInfo.city);
      await expect(wizardPage.pickupInfoStep.contactPersonInput).toHaveValue(defaultPickupInfo.contactPerson);
      await expect(wizardPage.pickupInfoStep.contactPhoneInput).toHaveValue(defaultPickupInfo.contactPhone);
    });

    test('should preserve delivery info when navigating back and forward', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(4);

      await wizardPage.clickBack();
      await wizardPage.expectOnStep(3);

      // Verify data is preserved
      await expect(wizardPage.deliveryInfoStep.streetInput).toHaveValue(defaultDeliveryInfo.street);
      await expect(wizardPage.deliveryInfoStep.cityInput).toHaveValue(defaultDeliveryInfo.city);
      await expect(wizardPage.deliveryInfoStep.contactPersonInput).toHaveValue(defaultDeliveryInfo.contactPerson);
      await expect(wizardPage.deliveryInfoStep.contactPhoneInput).toHaveValue(defaultDeliveryInfo.contactPhone);
    });

    test('should preserve cargo info when navigating back and forward', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(5);

      await wizardPage.clickBack();
      await wizardPage.expectOnStep(4);

      // Verify data is preserved
      await expect(wizardPage.cargoInfoStep.descriptionTextarea).toHaveValue(defaultCargoInfo.description);
      await expect(wizardPage.cargoInfoStep.weightInput).toHaveValue(defaultCargoInfo.weight.toString());
    });

    test('should preserve special instructions when navigating back and forward', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.clickNext();
      await wizardPage.specialInstructionsStep.fillSpecialInstructions(defaultSpecialInstructions);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(6);

      await wizardPage.clickBack();
      await wizardPage.expectOnStep(5);

      // Verify data is preserved
      if (defaultSpecialInstructions.instructions) {
        await expect(wizardPage.specialInstructionsStep.instructionsTextarea).toHaveValue(
          defaultSpecialInstructions.instructions
        );
      }
      if (defaultSpecialInstructions.priority) {
        await wizardPage.specialInstructionsStep.expectPrioritySelected(defaultSpecialInstructions.priority);
      }
    });
  });

  test.describe('Edit Button Navigation from Review Step', () => {
    test.beforeEach(async () => {
      // Navigate to step 6 with all data filled
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.clickNext();
      await wizardPage.specialInstructionsStep.fillSpecialInstructions(defaultSpecialInstructions);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(6);
    });

    test('should navigate to step 1 when clicking Edit on Service Type', async () => {
      await wizardPage.reviewSubmitStep.clickEditServiceType();
      await wizardPage.expectOnStep(1);
    });

    test('should navigate to step 2 when clicking Edit on Pickup Information', async () => {
      await wizardPage.reviewSubmitStep.clickEditPickupInfo();
      await wizardPage.expectOnStep(2);
    });

    test('should navigate to step 3 when clicking Edit on Delivery Information', async () => {
      await wizardPage.reviewSubmitStep.clickEditDeliveryInfo();
      await wizardPage.expectOnStep(3);
    });

    test('should navigate to step 4 when clicking Edit on Cargo Information', async () => {
      await wizardPage.reviewSubmitStep.clickEditCargoInfo();
      await wizardPage.expectOnStep(4);
    });

    test('should navigate to step 5 when clicking Edit on Special Instructions', async () => {
      await wizardPage.reviewSubmitStep.clickEditSpecialInstructions();
      await wizardPage.expectOnStep(5);
    });

    test('should preserve all data after editing and returning to review', async () => {
      // Edit service type
      await wizardPage.reviewSubmitStep.clickEditServiceType();
      await wizardPage.expectOnStep(1);
      await wizardPage.serviceTypeStep.selectServiceType('EXPRESS_DELIVERY');

      // Navigate back to review
      await wizardPage.clickNext();
      await wizardPage.clickNext();
      await wizardPage.clickNext();
      await wizardPage.clickNext();
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(6);

      // Verify the change is reflected
      await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Express Delivery');

      // Verify other data is preserved
      await wizardPage.reviewSubmitStep.expectPickupAddressDisplayed(defaultPickupInfo.street);
      await wizardPage.reviewSubmitStep.expectDeliveryAddressDisplayed(defaultDeliveryInfo.street);
    });
  });

  test.describe('Forward Navigation', () => {
    test('should navigate through all steps in order', async () => {
      // Step 1
      await wizardPage.expectOnStep(1);
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();

      // Step 2
      await wizardPage.expectOnStep(2);
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();

      // Step 3
      await wizardPage.expectOnStep(3);
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();

      // Step 4
      await wizardPage.expectOnStep(4);
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.clickNext();

      // Step 5
      await wizardPage.expectOnStep(5);
      await wizardPage.clickNext();

      // Step 6
      await wizardPage.expectOnStep(6);

      // Verify Next button is replaced by Submit button
      await expect(wizardPage.nextButton).not.toBeVisible();
      await expect(wizardPage.reviewSubmitStep.submitButton).toBeVisible();
    });
  });

  test.describe('Page Title and Description', () => {
    test('should display correct page title', async ({ authenticatedPage }) => {
      await expect(wizardPage.pageTitle).toBeVisible();
      await expect(wizardPage.pageTitle).toContainText('New Transportation Request');
    });

    test('should display correct step title for each step', async () => {
      // Step 1
      await wizardPage.expectOnStep(1);

      // Navigate through steps and verify titles
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(2);

      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(3);

      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(4);

      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(5);

      await wizardPage.clickNext();
      await wizardPage.expectOnStep(6);
    });
  });
});
