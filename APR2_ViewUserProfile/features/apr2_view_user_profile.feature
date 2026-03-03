# Feature: APR-2 - View User Profile

Feature: APR-2 - View User Profile
  As a logged-in user
  I want to view my profile details
  So that I can see my personal information

  Scenario: Logged-in user navigates to profile page and views full name and email
    Given the user is logged into the system
    When the user navigates to the Profile page
    Then the profile page should display the user's full name
    And the profile page should display the user's email address

  Scenario: Profile fields are displayed in read-only mode
    Given the user is logged into the system
    When the user navigates to the Profile page
    Then all profile fields should be in read-only mode
    And no edit controls should be available for any profile field

  Scenario: Profile page is accessible from the navigation menu after login
    Given the user is logged into the system
    When the user accesses the navigation menu
    Then the Profile page option should be visible and accessible

  Scenario: Unauthenticated user attempts to access the profile page via navigation
    Given the user is NOT logged into the system
    When the user attempts to access the Profile page
    Then the system should redirect the user to the Login page

  Scenario: Unauthenticated user attempts to access the profile page directly via URL
    Given the user is NOT logged into the system
    When the user directly navigates to the Profile page URL
    Then the system should redirect the user to the Login page

  Scenario: Session expires while the user is on the profile page
    Given the user is logged into the system
    And the user is on the Profile page
    When the user's session expires
    Then the system should redirect the user to the Login page
    And a session timeout message should be displayed

  Scenario: Profile page is displayed when user profile data is complete
    Given the user is logged into the system
    And the user has a complete profile with full name and email address
    When the user navigates to the Profile page
    Then the profile page should display the user's full name
    And the profile page should display the user's email address

  Scenario: Profile page handles missing full name gracefully
    Given the user is logged into the system
    And the user's profile has no full name stored
    When the user navigates to the Profile page
    Then the profile page should display a placeholder for the missing full name
    And the profile page should display the user's email address

  Scenario: Profile page handles missing email address gracefully
    Given the user is logged into the system
    And the user's profile has no email address stored
    When the user navigates to the Profile page
    Then the profile page should display the user's full name
    And the profile page should display a placeholder for the missing email address

  Scenario: Profile page handles completely missing profile data
    Given the user is logged into the system
    And the user's profile has no stored data
    When the user navigates to the Profile page
    Then the profile page should display placeholders for all missing profile fields
    And the page should still render without errors

  Scenario: Profile API returns an error when loading profile page
    Given the user is logged into the system
    When the user navigates to the Profile page
    And the profile API returns an error response
    Then the system should display a user-friendly error message
    And the system should not expose any technical error details to the user

  Scenario Outline: Profile page displays correct data for different users
    Given the user "<username>" is logged into the system
    When the user navigates to the Profile page
    Then the profile page should display the full name "<full_name>"
    And the profile page should display the email address "<email>"
    And all profile fields should be in read-only mode

    Examples:
      | username | full_name         | email                    |
      | user1    | Alice Johnson     | alice.johnson@email.com  |
      | user2    | Bob Smith         | bob.smith@email.com      |
      | user3    | Carol White       | carol.white@email.com    |

  Scenario: Profile page does not allow editing the full name field
    Given the user is logged into the system
    And the user is on the Profile page
    When the user attempts to modify the full name field
    Then the full name field should not accept any input

  Scenario: Profile page does not allow editing the email address field
    Given the user is logged into the system
    And the user is on the Profile page
    When the user attempts to modify the email address field
    Then the email address field should not accept any input

  Scenario: Profile page does not display edit profile functionality
    Given the user is logged into the system
    When the user navigates to the Profile page
    Then no option to edit or update profile information should be present

  Scenario: Profile page does not display profile photo upload functionality
    Given the user is logged into the system
    When the user navigates to the Profile page
    Then no profile photo upload or management option should be present

  Scenario: Profile page does not display password change functionality
    Given the user is logged into the system
    When the user navigates to the Profile page
    Then no password change option should be present on the profile page

  Scenario: Authenticated user's profile data belongs only to the logged-in user
    Given user "Alice" is logged into the system
    When the user navigates to the Profile page
    Then the profile page should display only Alice's full name
    And the profile page should display only Alice's email address
    And no other user's profile data should be visible

  Scenario: Profile page does not expose another user's data via URL manipulation
    Given user "Alice" is logged into the system
    When the user attempts to access the Profile page of user "Bob" via direct URL
    Then the system should not display Bob's profile data
    And the system should either redirect to Alice's profile or display an authorization error

  Scenario: Profile page loads successfully after re-login following session expiry
    Given the user's session has expired
    And the user has been redirected to the Login page
    When the user logs in again with valid credentials
    And the user navigates to the Profile page
    Then the profile page should display the user's full name
    And the profile page should display the user's email address
    And all profile fields should be in read-only mode

  Scenario: Profile page is not accessible after user logs out
    Given the user is logged into the system
    When the user logs out of the system
    And the user attempts to access the Profile page
    Then the system should redirect the user to the Login page
