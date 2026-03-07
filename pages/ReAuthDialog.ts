import { Page, Locator } from '@playwright/test';

/**
 * Re-authentication dialog component.
 * Used when sensitive profile changes (e.g., email) require credential confirmation.
 */
export class ReAuthDialog {
  readonly page: Page;

  // Locators
  readonly dialog: Locator;
  readonly passwordInput: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page.getByRole('dialog', { name: /re-?auth|confirm|verify|authentication/i });
    this.passwordInput = this.dialog.getByLabel(/password/i);
    this.confirmButton = this.dialog.getByRole('button', { name: /confirm|continue|verify|submit/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /cancel|close/i });
    this.errorMessage = this.dialog.getByRole('alert');
  }

  /**
   * Completes re-authentication using the provided password.
   * @param password - Current user password.
   * @returns The current ReAuthDialog instance.
   * Maps to: REQ_002, TC_REQ002_01
   */
  async complete(password: string): Promise<this> {
    await this.passwordInput.fill(password);
    await this.confirmButton.click();
    return this;
  }

  /**
   * Cancels the re-authentication flow.
   * @returns The current ReAuthDialog instance.
   * Maps to: REQ_002, TC_REQ002_02
   */
  async cancel(): Promise<this> {
    await this.cancelButton.click();
    return this;
  }
}
