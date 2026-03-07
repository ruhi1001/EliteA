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
   */
  resetLinks: {
    fresh: process.env.RESET_LINK_FRESH || '',
    expired: process.env.RESET_LINK_EXPIRED || '',
    used: process.env.RESET_LINK_USED || ''
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
