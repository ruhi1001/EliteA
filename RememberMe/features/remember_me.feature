Feature: APR-3 - Remember Me Functionality
  As a user
  I want the system to remember my login
  So that I do not need to log in repeatedly

  Background:
    Given the user is on the login page
    And the login form contains a "Remember Me" checkbox

  # ─── Acceptance Criteria: Scenario 1 ───────────────────────────────────────

  Scenario: User selects Remember Me with valid credentials and session persists after browser close
    Given the "Remember Me" checkbox is unchecked by default
    When the user enters valid credentials
    And the user checks the "Remember Me" checkbox
    And the user clicks the Login button
    Then the user is successfully authenticated
    And a persistent session token is issued
    And when the user closes and reopens the browser within 7 days
    Then the user remains authenticated without re-entering credentials

  Scenario: User remains authenticated when revisiting within the 7-day session window
    Given the user has previously logged in with "Remember Me" selected
    And the persistent session was created less than 7 days ago
    When the user opens the application in a new browser session
    Then the user is automatically authenticated
    And the user is directed to the authenticated home page

  # ─── Acceptance Criteria: Scenario 2 ───────────────────────────────────────

  Scenario: User logs in without selecting Remember Me and session does not persist
    Given the "Remember Me" checkbox is not checked
    When the user enters valid credentials
    And the user clicks the Login button
    Then the user is successfully authenticated with a standard session
    And when the user closes the browser
    And the user reopens the browser and navigates to the application
    Then the user is redirected to the login page and must re-authenticate

  Scenario: Standard session expires on browser close when Remember Me is not selected
    Given the user is authenticated without "Remember Me"
    When the user terminates the browser session
    Then no persistent authentication token is stored
    And the session is invalidated

  # ─── Acceptance Criteria: Scenario 3 ───────────────────────────────────────

  Scenario: Persistent session expires exactly after 7 days
    Given the user has previously logged in with "Remember Me" selected
    And 7 days have elapsed since the persistent session was created
    When the user opens the application
    Then the persistent session is expired
    And the user is redirected to the login page
    And the user is prompted to log in again

  Scenario: Persistent session is still valid one day before expiry
    Given the user has previously logged in with "Remember Me" selected
    And 6 days have elapsed since the persistent session was created
    When the user opens the application in a new browser session
    Then the user remains authenticated
    And the user is not prompted to log in again

  Scenario: Persistent session is invalid one day after expiry boundary
    Given the user has previously logged in with "Remember Me" selected
    And 8 days have elapsed since the persistent session was created
    When the user opens the application
    Then the user is redirected to the login page
    And the expired session token is invalidated

  # ─── Negative Scenarios ─────────────────────────────────────────────────────

  Scenario: User attempts login with invalid credentials and Remember Me checked
    Given the "Remember Me" checkbox is checked
    When the user enters invalid credentials
    And the user clicks the Login button
    Then the login attempt fails
    And an appropriate error message is displayed
    And no persistent session token is issued

  Scenario: User attempts login with empty credentials and Remember Me checked
    Given the "Remember Me" checkbox is checked
    When the user submits the login form with empty username and password
    Then the login attempt fails
    And validation error messages are displayed
    And no persistent session token is created

  Scenario: User attempts login with valid username and empty password with Remember Me checked
    Given the "Remember Me" checkbox is checked
    When the user enters a valid username and leaves the password field empty
    And the user clicks the Login button
    Then the login attempt fails
    And a validation error is displayed for the password field
    And no persistent session is created

  # ─── Edge Case: Browser Cookies Cleared ─────────────────────────────────────

  Scenario: User manually clears browser cookies and storage after Remember Me login
    Given the user is authenticated with a persistent session via "Remember Me"
    When the user manually clears all browser cookies and local storage
    And the user navigates to the application
    Then the persistent session is invalidated
    And the user is redirected to the login page
    And the user must re-authenticate

  # ─── Edge Case: Explicit Logout ──────────────────────────────────────────────

  Scenario: User explicitly logs out after selecting Remember Me
    Given the user is authenticated with a persistent session via "Remember Me"
    When the user explicitly clicks the Logout button
    Then the persistent session token is cleared from the client
    And the persistent token is invalidated on the server side
    And the user is redirected to the login page
    And reopening the browser does not restore the session

  Scenario: User logs out and persistent token is not reusable
    Given the user has logged out explicitly after a "Remember Me" session
    When the user attempts to access a protected page directly
    Then the user is redirected to the login page
    And the previously issued persistent token is rejected by the server

  # ─── Edge Case: Password Change ──────────────────────────────────────────────

  Scenario: All persistent sessions are invalidated when user changes password
    Given the user has active "Remember Me" sessions on multiple devices
    When the user changes their account password
    Then all persistent session tokens associated with the account are invalidated
    And each device is redirected to the login page upon next access
    And the user must re-authenticate on all devices

  Scenario: User with changed password cannot access application using old persistent token
    Given the user previously logged in with "Remember Me" on a device
    And the user has since changed their password from another session
    When the user opens the application on the original device within the 7-day window
    Then the persistent session is invalidated
    And the user is redirected to the login page

  # ─── Edge Case: Multiple Devices ─────────────────────────────────────────────

  Scenario: Remember Me sessions are independent across multiple devices
    Given the user has logged in with "Remember Me" on Device A
    When the user logs in with "Remember Me" on Device B
    Then Device A maintains its own independent persistent session
    And Device B maintains its own independent persistent session
    And logging out on Device A does not affect the session on Device B

  Scenario: Persistent session on one device does not affect session state on another device
    Given the user has an active "Remember Me" session on Device A
    When the user closes the browser on Device A
    And the user opens the application on Device B within 7 days of Device B session creation
    Then Device B session remains valid independently

  # ─── Edge Case: Account Suspension or Deactivation ──────────────────────────

  Scenario: Persistent session is immediately revoked upon account suspension
    Given the user has an active persistent session via "Remember Me"
    When the user account is suspended or deactivated
    And the user attempts to access the application
    Then the persistent session is revoked immediately
    And the user is redirected to the login page
    And the user receives an appropriate account suspension message

  Scenario: Suspended account user cannot re-authenticate using persistent token
    Given the user account has been suspended
    And a previously issued persistent session token exists
    When the application attempts to validate the persistent token
    Then the token validation fails
    And access to the application is denied

  # ─── Security Scenarios ──────────────────────────────────────────────────────

  Scenario: Persistent session token is issued as a secure HttpOnly cookie
    Given the user logs in with valid credentials and "Remember Me" checked
    When the authentication succeeds
    Then the persistent token is stored in a secure HttpOnly cookie
    And the cookie is not accessible via client-side scripts
    And the cookie is transmitted only over HTTPS

  Scenario: Persistent session cookie is not present when Remember Me is not selected
    Given the user logs in with valid credentials without checking "Remember Me"
    When the authentication succeeds
    Then no persistent HttpOnly cookie is issued
    And only a standard session cookie is created

  Scenario: Persistent session token is rotated upon successful use
    Given the user has an active persistent session via "Remember Me"
    When the user accesses the application and the persistent token is validated
    Then the existing persistent token is rotated
    And a new persistent token is issued to replace the old one
    And the old token is invalidated on the server

  Scenario: Expired persistent token is rejected and not reactivated
    Given a persistent session token that expired after 7 days
    When the token is submitted to the authentication service
    Then the token is rejected as expired
    And no new session is created from the expired token
    And the user is redirected to the login page

  # ─── Boundary Value Scenarios ────────────────────────────────────────────────

  Scenario Outline: Persistent session boundary validation at exact day thresholds
    Given the user logged in with "Remember Me" <days_elapsed> days ago
    When the user opens the application
    Then the session state should be "<expected_state>"

    Examples:
      | days_elapsed | expected_state |
      | 0            | authenticated  |
      | 1            | authenticated  |
      | 6            | authenticated  |
      | 7            | expired        |
      | 8            | expired        |

  # ─── Remember Me Checkbox UI State ──────────────────────────────────────────

  Scenario: Remember Me checkbox is unchecked by default on login page load
    When the user navigates to the login page
    Then the "Remember Me" checkbox is displayed
    And the "Remember Me" checkbox is unchecked by default

  Scenario: User can check and uncheck the Remember Me checkbox before submitting
    Given the user is on the login page
    When the user checks the "Remember Me" checkbox
    Then the checkbox reflects the checked state
    When the user unchecks the "Remember Me" checkbox
    Then the checkbox reflects the unchecked state
    And no persistent session is created after login
