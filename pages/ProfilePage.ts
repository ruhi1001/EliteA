import { Page, Locator } from '@playwright/test';

/**
 * Profile page object.
 * Covers reading and editing authenticated user's profile data.
 */
export class ProfilePage {
  readonly page: Page;

  // Locators
  readonly heading: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successBanner: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /profile/i });

    // Prefer accessible labels; CSS fallback supports common ids from legacy UI.
    this.fullNameInput = page
      .getByLabel(/full name|name/i)
      .or(page.locator('#full_name, input[name="full_name"], input[name="fullName"]'));

    this.emailInput = page
      .getByLabel(/email/i)
      .or(page.locator('#email, input[name="email"]'));

    this.phoneInput = page
      .getByLabel(/phone|mobile/i)
      .or(page.locator('#phone, #phone_number, input[name="phone"], input[name="phoneNumber"]'));

    this.addressInput = page
      .getByLabel(/address/i)
      .or(page.locator('#address, input[name="address"]'));

    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Prefer role=status for non-blocking confirmations.
    this.successBanner = page.getByRole('status');
    this.errorBanner = page.getByRole('alert');
  }

  /**
   * Navigates to the Profile page.
   * @param path - Profile path relative to baseURL.
   * @returns The current ProfilePage instance.
   * Maps to: REQ_001, TC_REQ001_01
   */
  async goto(path: string = '/profile'): Promise<this> {
    await this.page.goto(path);
    return this;
  }

  /**
   * Fills the Full Name field.
   * @param fullName - Full name to set.
   * @returns The current ProfilePage instance.
   * Maps to: REQ_001, TC_REQ001_01
   */
  async fillFullName(fullName: string): Promise<this> {
    await this.fullNameInput.fill(fullName);
    return this;
  }

  /**
   * Fills the Email field.
   * @param email - Email to set.
   * @returns The current ProfilePage instance.
   * Maps to: REQ_002, TC_REQ002_01
   */
  async fillEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  /**
   * Fills the Phone field.
   * @param phone - Phone number to set.
   * @returns The current ProfilePage instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async fillPhone(phone: string): Promise<this> {
    await this.phoneInput.fill(phone);
    return this;
  }

  /**
   * Fills the Address field.
   * @param address - Address to set.
   * @returns The current ProfilePage instance.
   * Maps to: REQ_001, TC_REQ002_03
   */
  async fillAddress(address: string): Promise<this> {
    await this.addressInput.fill(address);
    return this;
  }

  /**
   * Clicks Save to submit profile updates.
   * @returns The current ProfilePage instance.
   * Maps to: REQ_001, REQ_002, TC_REQ001_01
   */
  async clickSave(): Promise<this> {
    await this.saveButton.click();
    return this;
  }

  /**
   * Clicks Cancel to discard unsaved changes.
   * @returns The current ProfilePage instance.
   * Maps to: REQ_006, TC_REQ006_01
   */
  async clickCancel(): Promise<this> {
    await this.cancelButton.click();
    return this;
  }

  /**
   * Reads the currently displayed field values.
   * Note: For inputs, this reads the input value; otherwise it falls back to text content.
   * @returns Object with the visible values.
   * Maps to: REQ_001, TC_REQ001_01
   */
  async readValues(): Promise<{ fullName: string; email: string; phone: string; address: string }> {
    const read = async (locator: Locator): Promise<string> => {
      try {
        return await locator.inputValue();
      } catch {
        return (await locator.textContent())?.trim() || '';
      }
    };

    const [fullName, email, phone, address] = await Promise.all([
      read(this.fullNameInput),
      read(this.emailInput),
      read(this.phoneInput),
      read(this.addressInput)
    ]);

    return { fullName, email, phone, address };
  }
    this.errorBanner = page.getByRole('alert');
  }

  // Methods are added incrementally.