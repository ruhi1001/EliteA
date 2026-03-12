import { Page, Locator } from '@playwright/test';

/**
 * Newsletter Signup form component.
 */
export class NewsletterSignupForm {
  readonly page: Page;

  // Locators
  readonly root: Locator;

  readonly emailInput: Locator;
  readonly emailInputs: Locator;

  readonly submitButton: Locator;
  readonly submitControls: Locator;

  readonly statusMessage: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Heuristic: choose the first <form> that contains an email-type input.
    this.root = page.locator('form', { has: page.locator('input[type="email"]') }).first();

    this.emailInput = this.root
      .getByLabel(/email/i)
      .or(this.root.getByPlaceholder(/email/i))
      .or(this.root.locator('input[type="email"], input[name*="email" i], input[id*="email" i]'))
      .first();

    this.emailInputs = this.root.locator(
      'input[type="email"], input[name*="email" i], input[id*="email" i]'
    );

    this.submitButton = this.root
      .getByRole('button', { name: /subscribe|sign\s*up|join|submit/i })
      .or(this.root.locator('button[type="submit"], input[type="submit"]'))
      .first();

    this.submitControls = this.root.locator('button[type="submit"], input[type="submit"]');

    // Prefer role=status for non-blocking confirmations.
    this.statusMessage = page.getByRole('status');
    this.alertMessage = page.getByRole('alert');
  }

  /**
   * Fills the newsletter email input.
   * @param email - Email to enter.
   * @returns The current NewsletterSignupForm instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async fillEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  /**
   * Clicks the Subscribe/Submit button.
   * @returns The current NewsletterSignupForm instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async submit(): Promise<this> {
    await this.submitButton.click();
    return this;
  }

  /**
   * Returns the number of email inputs found within the form.
   * @returns Count of matching email inputs.
   * Maps to: REQ_002, TC_REQ002_01
   */
  async getEmailInputCount(): Promise<number> {
    return this.emailInputs.count();
  }

  /**
   * Returns the number of submit controls (button/input[type=submit]) found within the form.
   * @returns Count of matching submit controls.
   * Maps to: REQ_002, TC_REQ002_01
   */
  async getSubmitControlCount(): Promise<number> {
    return this.submitControls.count();
  }
}