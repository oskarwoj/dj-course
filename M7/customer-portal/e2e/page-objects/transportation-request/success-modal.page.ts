import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class SuccessModalPage extends BasePage {
  readonly modal: Locator;
  readonly title: Locator;
  readonly message: Locator;
  readonly referenceNumber: Locator;
  readonly nextSteps: Locator;
  readonly viewRequestButton: Locator;
  readonly downloadPdfButton: Locator;
  readonly createAnotherButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Transportation Request Submitted Successfully!') });
    this.title = page.getByText('Transportation Request Submitted Successfully!');
    this.message = page.getByText('Your transportation request has been received');
    this.referenceNumber = this.modal.locator('.font-mono.font-semibold');
    this.nextSteps = this.modal.locator('text=What happens next?').locator('..').locator('ul');
    this.viewRequestButton = page.getByRole('button', { name: 'View Request' });
    this.downloadPdfButton = page.getByRole('button', { name: 'Download PDF' });
    this.createAnotherButton = page.getByRole('button', { name: 'Create Another Request' });
  }

  async expectModalVisible(): Promise<void> {
    await expect(this.title).toBeVisible({ timeout: 10000 });
  }

  async expectModalNotVisible(): Promise<void> {
    await expect(this.title).not.toBeVisible();
  }

  async expectReferenceNumberVisible(): Promise<void> {
    await expect(this.referenceNumber).toBeVisible();
  }

  async getReferenceNumber(): Promise<string> {
    return await this.referenceNumber.innerText();
  }

  async clickViewRequest(): Promise<void> {
    await this.viewRequestButton.click();
  }

  async clickDownloadPdf(): Promise<void> {
    await this.downloadPdfButton.click();
  }

  async clickCreateAnother(): Promise<void> {
    await this.createAnotherButton.click();
  }

  async expectNextStepsVisible(): Promise<void> {
    await expect(this.nextSteps).toBeVisible();
  }

  async expectSuccessState(): Promise<void> {
    await this.expectModalVisible();
    await this.expectReferenceNumberVisible();
    await this.expectNextStepsVisible();
  }
}
