/**
 * Centralized test data and environment-driven configuration.
 * Keep any sensitive values in .env, not in source control.
 */

export type UserCredentials = {
  email: string;
  password: string;
};

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const testData = {
  urls: {
    loginPath: '/login',
    forgotPasswordPath: '/forgot-password'
  },

  users: {
    registered: {
      email: process.env.TEST_REGISTERED_EMAIL || 'registered.user@example.com',
      password: process.env.TEST_REGISTERED_PASSWORD || 'CorrectPassword123!'
    } satisfies UserCredentials,

    unregistered: {
      email: process.env.TEST_UNREGISTERED_EMAIL || 'unregistered.user@example.com'
    }
  },

  passwords: {
    validComplex: process.env.TEST_PASSWORD_VALID_COMPLEX || 'Abcdef1G',
    tooShort: process.env.TEST_PASSWORD_TOO_SHORT || 'Abcde12',
    noUppercase: process.env.TEST_PASSWORD_NO_UPPERCASE || 'abcdefg1',
    noDigit: process.env.TEST_PASSWORD_NO_DIGIT || 'AbcdefgH'
  },

  /**
   * Reset links are environment-driven because generating/reading email links
   * depends on the AUT implementation and test mailbox.
   *
   * Recommended: provide per-test links like RESET_LINK_TC_REQ002_01.
   * Fallbacks are supported via RESET_LINK_FRESH / RESET_LINK_EXPIRED / RESET_LINK_USED.
   */
  resetLinks: {
    fresh: process.env.RESET_LINK_FRESH || '',
    expired: process.env.RESET_LINK_EXPIRED || '',
    used: process.env.RESET_LINK_USED || ''
  },

  /**
   * Expected UI messaging. Override in env vars to match AUT copy.
   */
  messages: {
    forgotPasswordConfirmation:
      process.env.MSG_FORGOT_PASSWORD_CONFIRMATION ||
      'If an account exists for this email, we have sent a password reset link.',
    resetLinkExpired:
      process.env.MSG_RESET_LINK_EXPIRED || 'This password reset link has expired.',
    resetTokenInvalid:
      process.env.MSG_RESET_TOKEN_INVALID || 'This password reset link is invalid or has already been used.',
    passwordMinLength:
      process.env.MSG_PASSWORD_MIN_LENGTH || 'Password must be at least 8 characters.',
    passwordMissingUppercase:
      process.env.MSG_PASSWORD_MISSING_UPPERCASE || 'Password must include at least one uppercase letter.',
    passwordMissingDigit:
      process.env.MSG_PASSWORD_MISSING_DIGIT || 'Password must include at least one number.',
    passwordReuseNotAllowed:
      process.env.MSG_PASSWORD_REUSE_NOT_ALLOWED || 'You cannot reuse your last 3 passwords.',
    accountLocked:
      process.env.MSG_ACCOUNT_LOCKED || 'Your account is locked. Please try again in 15 minutes.'
  },

  /**
   * Password history data (REQ_005). Provide these in env vars for deterministic runs.
   */
  passwordHistory: {
    last1: process.env.TEST_PASSWORD_HISTORY_1 || '',
    last2: process.env.TEST_PASSWORD_HISTORY_2 || '',
    last3: process.env.TEST_PASSWORD_HISTORY_3 || '',
    newNotInHistory: process.env.TEST_PASSWORD_NEW_NOT_IN_HISTORY || ''
  },

  /**
   * Feature flags / capabilities.
   */
  capabilities: {
    hasDeterministicResetLinks: Boolean(process.env.RESET_LINK_FRESH),
    hasPasswordHistoryFixtures: Boolean(process.env.TEST_PASSWORD_NEW_NOT_IN_HISTORY)
  },

  requiredEnv
};
