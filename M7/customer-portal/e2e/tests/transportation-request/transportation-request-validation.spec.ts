import { test, expect } from '../../fixtures/auth.fixture';
import { TransportationRequestWizardPage } from '../../page-objects/transportation-request/transportation-request-wizard.page';
import {
  defaultPickupInfo,
  defaultDeliveryInfo,
  defaultCargoInfo,
} from '../../test-data/transportation-request.data';

test.describe('Transportation Request - Validation', () => {
  let wizardPage: TransportationRequestWizardPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    wizardPage = new TransportationRequestWizardPage(authenticatedPage);
    await wizardPage.navigateToWizard();
  });

  test.describe('Step 1: Service Type Validation', () => {
    test('should disable Next button when no service type is selected', async () => {
      await wizardPage.expectOnStep(1);
      await wizardPage.expectNextDisabled();
    });

    test('should enable Next button after selecting a service type', async () => {
      await wizardPage.expectOnStep(1);
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.expectNextEnabled();
    });

    test('should show visual feedback when service type is selected', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('EXPRESS_DELIVERY');
      await wizardPage.serviceTypeStep.expectServiceTypeSelected('EXPRESS_DELIVERY');
    });

    test('should allow changing service type selection', async () => {
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.serviceTypeStep.expectServiceTypeSelected('FULL_TRUCKLOAD');

      await wizardPage.serviceTypeStep.selectServiceType('LESS_THAN_TRUCKLOAD');
      await wizardPage.serviceTypeStep.expectServiceTypeSelected('LESS_THAN_TRUCKLOAD');

      // First selection should no longer be selected
      const isFirstStillSelected = await wizardPage.serviceTypeStep.isServiceTypeSelected('FULL_TRUCKLOAD');
      expect(isFirstStillSelected).toBe(false);
    });
  });

  test.describe('Step 2: Pickup Information Validation', () => {
    test.beforeEach(async () => {
      // Navigate to step 2
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(2);
    });

    test('should disable Next button when required fields are empty', async () => {
      await wizardPage.expectNextDisabled();
    });

    test('should enable Next button when all required fields are filled', async () => {
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.expectNextEnabled();
    });

    test('should disable Next when street address is missing', async () => {
      await wizardPage.pickupInfoStep.fillPickupInfo({
        ...defaultPickupInfo,
        street: '',
      });
      // Clear the street field
      await wizardPage.pickupInfoStep.streetInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when city is missing', async () => {
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.pickupInfoStep.cityInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when contact person is missing', async () => {
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.pickupInfoStep.contactPersonInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when contact phone is missing', async () => {
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.pickupInfoStep.contactPhoneInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when pickup date is missing', async () => {
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.pickupInfoStep.pickupDateInput.clear();
      await wizardPage.expectNextDisabled();
    });
  });

  test.describe('Step 3: Delivery Information Validation', () => {
    test.beforeEach(async () => {
      // Navigate to step 3
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(3);
    });

    test('should disable Next button when required fields are empty', async () => {
      await wizardPage.expectNextDisabled();
    });

    test('should enable Next button when all required fields are filled', async () => {
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.expectNextEnabled();
    });

    test('should disable Next when delivery address is missing', async () => {
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.deliveryInfoStep.streetInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when delivery city is missing', async () => {
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.deliveryInfoStep.cityInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when delivery contact person is missing', async () => {
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.deliveryInfoStep.contactPersonInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when delivery contact phone is missing', async () => {
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.deliveryInfoStep.contactPhoneInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should allow delivery date to be optional', async () => {
      const deliveryWithoutDate = { ...defaultDeliveryInfo };
      delete deliveryWithoutDate.deliveryDate;
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(deliveryWithoutDate);
      await wizardPage.expectNextEnabled();
    });
  });

  test.describe('Step 4: Cargo Information Validation', () => {
    test.beforeEach(async () => {
      // Navigate to step 4
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(4);
    });

    test('should disable Next button when required fields are empty', async () => {
      await wizardPage.expectNextDisabled();
    });

    test('should enable Next button when description and weight are filled', async () => {
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.expectNextEnabled();
    });

    test('should disable Next when cargo description is missing', async () => {
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.cargoInfoStep.descriptionTextarea.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when weight is missing', async () => {
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.cargoInfoStep.weightInput.clear();
      await wizardPage.expectNextDisabled();
    });

    test('should disable Next when weight is zero', async () => {
      await wizardPage.cargoInfoStep.fillCargoInfo({
        ...defaultCargoInfo,
        weight: 0,
      });
      await wizardPage.expectNextDisabled();
    });

    test('should allow optional cargo fields to be empty', async () => {
      // Only fill required fields
      await wizardPage.cargoInfoStep.descriptionTextarea.fill('Test cargo');
      await wizardPage.cargoInfoStep.weightInput.fill('100');
      await wizardPage.expectNextEnabled();
    });
  });

  test.describe('Step 5: Special Instructions Validation', () => {
    test.beforeEach(async () => {
      // Navigate to step 5
      await wizardPage.serviceTypeStep.selectServiceType('FULL_TRUCKLOAD');
      await wizardPage.clickNext();
      await wizardPage.pickupInfoStep.fillPickupInfo(defaultPickupInfo);
      await wizardPage.clickNext();
      await wizardPage.deliveryInfoStep.fillDeliveryInfo(defaultDeliveryInfo);
      await wizardPage.clickNext();
      await wizardPage.cargoInfoStep.fillCargoInfo(defaultCargoInfo);
      await wizardPage.clickNext();
      await wizardPage.expectOnStep(5);
    });

    test('should enable Next button with no input (all fields optional)', async () => {
      await wizardPage.expectNextEnabled();
    });

    test('should allow selecting different priority levels', async () => {
      await wizardPage.specialInstructionsStep.selectPriority('LOW');
      await wizardPage.specialInstructionsStep.expectPrioritySelected('LOW');

      await wizardPage.specialInstructionsStep.selectPriority('HIGH');
      await wizardPage.specialInstructionsStep.expectPrioritySelected('HIGH');

      await wizardPage.specialInstructionsStep.selectPriority('URGENT');
      await wizardPage.specialInstructionsStep.expectPrioritySelected('URGENT');
    });

    test('should allow toggling customs clearance checkbox', async ({ authenticatedPage }) => {
      const checkbox = wizardPage.specialInstructionsStep.customsClearanceCheckbox;

      await expect(checkbox).not.toBeChecked();
      await checkbox.check();
      await expect(checkbox).toBeChecked();
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    });
  });

  test.describe('Step 6: Review & Submit Validation', () => {
    test.beforeEach(async () => {
      // Navigate to step 6
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
    });

    test('should display Submit Request button on review step', async () => {
      await expect(wizardPage.reviewSubmitStep.submitButton).toBeVisible();
      await expect(wizardPage.reviewSubmitStep.submitButton).toBeEnabled();
    });

    test('should display all entered data in review', async () => {
      await wizardPage.reviewSubmitStep.expectServiceTypeDisplayed('Full Truckload');
      await wizardPage.reviewSubmitStep.expectPickupAddressDisplayed(defaultPickupInfo.street);
      await wizardPage.reviewSubmitStep.expectDeliveryAddressDisplayed(defaultDeliveryInfo.street);
      await wizardPage.reviewSubmitStep.expectCargoDescriptionDisplayed(defaultCargoInfo.description);
    });

    test('should have edit buttons for each section', async ({ authenticatedPage }) => {
      await expect(wizardPage.reviewSubmitStep.getEditButton('Service Type')).toBeVisible();
      await expect(wizardPage.reviewSubmitStep.getEditButton('Pickup Information')).toBeVisible();
      await expect(wizardPage.reviewSubmitStep.getEditButton('Delivery Information')).toBeVisible();
      await expect(wizardPage.reviewSubmitStep.getEditButton('Cargo Information')).toBeVisible();
      await expect(wizardPage.reviewSubmitStep.getEditButton('Special Instructions')).toBeVisible();
    });
  });
});
