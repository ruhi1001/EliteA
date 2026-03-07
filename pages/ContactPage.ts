import { Page, Locator } from '@playwright/test';

/**
 * "Contact Us" page object.
 */
export class ContactPage {
  readonly page: Page;

  // Locators
  readonly heading: Locator;
  readonly form: Locator;

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;

  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /contact us/i });
    this.form = page.getByRole('form').or(page.locator('form'));

    this.nameInput = page.getByLabel(/name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.messageInput = page.getByLabel(/message/i);

    this.submitButton = page.getByRole('button', { name: /send|submit/i });

    // Prefer role=status for non-blocking confirmations; fallback to exact copy in assertions.
    this.successMessage = page.getByRole('status').or(
      page.getByText(/thank you for contacting us\./i)
    );

    this.errorBanner = page.getByRole('alert');
  }

  /**
   * Navigates to the Contact page.
   * @param path - Contact page path relative to baseURL.
   * @returns The current ContactPage instance.
   * Maps to: REQ_001, TC_REQ001_01
   */
  async goto(path: string = '/contact'): Promise<this> {
    await this.page.goto(path);
    return this;
  }

  /**
   * Fills the Name input.
   * @param name - Name value.
   * @returns The current ContactPage instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async fillName(name: string): Promise<this> {
    await this.nameInput.fill(name);
    return this;
  }

  /**
   * Fills the Email input.
   * @param email - Email value.
   * @returns The current ContactPage instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async fillEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  /**
   * Fills the Message textarea.
   * @param message - Message body.
   * @returns The current ContactPage instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async fillMessage(message: string): Promise<this> {
    await this.messageInput.fill(message);
    return this;
  }

  /**
   * Fills all Contact form fields.
   * @param data - Form data.
   * @returns The current ContactPage instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async fillForm(data: { name: string; email: string; message: string }): Promise<this> {
    await this.fillName(data.name);
    await this.fillEmail(data.email);
    await this.fillMessage(data.message);
    return this;
  }

  /**
   * Clicks the Submit button.
   * @returns The current ContactPage instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async submit(): Promise<this> {
    await this.submitButton.click();
    return this;
  }
}
