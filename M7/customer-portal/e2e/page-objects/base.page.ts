import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(locator: Locator, timeout = 30000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async checkCheckbox(locator: Locator): Promise<void> {
    await locator.check();
  }

  async uncheckCheckbox(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  async getText(locator: Locator): Promise<string> {
    return await locator.innerText();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  async hasClass(locator: Locator, className: string): Promise<boolean> {
    const classes = await locator.getAttribute('class');
    return classes?.includes(className) ?? false;
  }

  async expectToBeVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async expectToContainText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text);
  }

  async expectToBeEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  async expectToBeDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }
}
