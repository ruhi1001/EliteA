import { Page, Locator } from '@playwright/test';

/**
 * Login page object.
 */
export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.signInButton = page.getByRole('button', { name: /sign in|log in|login/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.alertMessage = page.getByRole('alert');
  }

  /**
   * Navigates to the Login page.
   * @param path - Login path relative to baseURL.
   * @returns The current LoginPage instance.
   * Maps to: REQ_001, REQ_006, TC_REQ001_01
   */
  async goto(path: string = '/login'): Promise<this> {
    await this.page.goto(path);
    return this;
  }

  /**
   * Attempts to login with provided credentials.
   * @param email - User email.
   * @param password - User password.
   * @returns The current LoginPage instance (post-submit).
   * Maps to: REQ_006, TC_REQ006_01
   */
  async login(email: string, password: string): Promise<this> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    return this;
  }

  /**
   * Opens the "Forgot Password" flow from the Login page.
   * @returns The current Playwright page (navigation target handled by caller).
   * Maps to: REQ_001, TC_REQ001_01
   */
  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
}
