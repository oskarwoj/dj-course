import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../../base.page';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface SpecialInstructions {
  instructions?: string;
  priority?: Priority;
  requiresCustomsClearance?: boolean;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export class SpecialInstructionsStepPage extends BasePage {
  readonly instructionsTextarea: Locator;
  readonly customsClearanceCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.instructionsTextarea = page.getByPlaceholder('Any special handling requirements, delivery instructions, or additional information...');
    this.customsClearanceCheckbox = page.locator('label').filter({ hasText: 'Requires Customs Clearance' }).locator('input[type="checkbox"]');
  }

  getPriorityCard(priority: Priority): Locator {
    const label = PRIORITY_LABELS[priority];
    return this.page.locator('label').filter({ hasText: new RegExp(`^${label}$`) });
  }

  async fillSpecialInstructions(info: SpecialInstructions): Promise<void> {
    if (info.instructions) {
      await this.fill(this.instructionsTextarea, info.instructions);
    }

    if (info.priority) {
      await this.selectPriority(info.priority);
    }

    if (info.requiresCustomsClearance) {
      await this.checkCheckbox(this.customsClearanceCheckbox);
    }
  }

  async selectPriority(priority: Priority): Promise<void> {
    const card = this.getPriorityCard(priority);
    await card.click();
  }

  async isPrioritySelected(priority: Priority): Promise<boolean> {
    const card = this.getPriorityCard(priority);
    const classes = await card.getAttribute('class');
    return classes?.includes('ring-2') ?? false;
  }

  async expectPrioritySelected(priority: Priority): Promise<void> {
    const card = this.getPriorityCard(priority);
    await expect(card).toHaveClass(/ring-2/);
  }

  async clearInstructions(): Promise<void> {
    await this.instructionsTextarea.clear();
  }
}
