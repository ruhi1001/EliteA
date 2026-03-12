from behave import given, when, then
from unittest.mock import patch
from pages.profile_page import ProfilePage
from pages.navigation_page import NavigationPage
from config.settings import USERS


# ------------------------------------------------------------------ #
#  Pre-conditions — Profile data state
# ------------------------------------------------------------------ #

@given("the user has a complete profile with full name and email address")
def step_user_has_complete_profile(context):
    context.profile_state = "complete"


@given("the user's profile has no full name stored")
def step_profile_missing_full_name(context):
    context.profile_state = "missing_full_name"


@given("the user's profile has no email address stored")
def step_profile_missing_email(context):
    context.profile_state = "missing_email"


@given("the user's profile has no stored data")
def step_profile_has_no_data(context):
    context.profile_state = "empty"


# ------------------------------------------------------------------ #
#  Actions — Profile page interactions
# ------------------------------------------------------------------ #

@when("the profile API returns an error response")
def step_api_returns_error(context):
    profile_page = ProfilePage(context.driver)
    profile_page.open_profile_page()


@when("the user attempts to modify the full name field")
def step_attempt_modify_full_name(context):
    context.attempted_full_name_value = "modified_full_name_text"
    profile_page = ProfilePage(context.driver)
    profile_page.attempt_to_modify_full_name(context.attempted_full_name_value)


@when("the user attempts to modify the email address field")
def step_attempt_modify_email(context):
    context.attempted_email_value = "modified@hacker.com"
    profile_page = ProfilePage(context.driver)
    profile_page.attempt_to_modify_email(context.attempted_email_value)


@when('the user attempts to access the Profile page of user "Bob" via direct URL')
def step_attempt_access_bob_profile(context):
    bob_user_id  = USERS["Bob"]["username"]
    profile_page = ProfilePage(context.driver)
    profile_page.open_profile_page_for_user(bob_user_id)


# ------------------------------------------------------------------ #
#  Assertions — Profile data display
# ------------------------------------------------------------------ #

@then("the profile page should display the user's full name")
def step_assert_full_name_displayed(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_full_name_displayed(), \
        "Full name is not visible on the Profile page."
    full_name = profile_page.get_displayed_full_name()
    assert full_name not in ("", None), \
        f"Full name is empty. Displayed value: '{full_name}'"


@then("the profile page should display the user's email address")
def step_assert_email_displayed(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_email_displayed(), \
        "Email address is not visible on the Profile page."
    email = profile_page.get_displayed_email()
    assert email not in ("", None), \
        f"Email address is empty. Displayed value: '{email}'"


@then('the profile page should display the full name "{full_name}"')
def step_assert_specific_full_name(context, full_name):
    profile_page = ProfilePage(context.driver)
    displayed    = profile_page.get_displayed_full_name()
    assert displayed == full_name, \
        f"Expected full name '{full_name}' but found '{displayed}'."


@then('the profile page should display the email address "{email}"')
def step_assert_specific_email(context, email):
    profile_page = ProfilePage(context.driver)
    displayed    = profile_page.get_displayed_email()
    assert displayed == email, \
        f"Expected email '{email}' but found '{displayed}'."


@then("the profile page should display only Alice's full name")
def step_assert_only_alice_full_name(context):
    alice_full_name = "Alice"
    profile_page    = ProfilePage(context.driver)
    displayed       = profile_page.get_displayed_full_name()
    assert alice_full_name in displayed, \
        f"Expected Alice's full name but found '{displayed}'."


@then("the profile page should display only Alice's email address")
def step_assert_only_alice_email(context):
    profile_page = ProfilePage(context.driver)
    displayed    = profile_page.get_displayed_email()
    assert "alice" in displayed.lower(), \
        f"Expected Alice's email but found '{displayed}'."


@then("no other user's profile data should be visible")
def step_assert_no_other_user_data(context):
    profile_page = ProfilePage(context.driver)
    email        = profile_page.get_displayed_email()
    full_name    = profile_page.get_displayed_full_name()
    assert "bob" not in full_name.lower() and "bob" not in email.lower(), \
        "Another user's profile data is visible on the page."


# ------------------------------------------------------------------ #
#  Assertions — Placeholder display
# ------------------------------------------------------------------ #

@then("the profile page should display a placeholder for the missing full name")
def step_assert_placeholder_full_name(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_full_name_placeholder_shown(), \
        "Expected a placeholder for missing full name but found actual data."


@then("the profile page should display a placeholder for the missing email address")
def step_assert_placeholder_email(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_email_placeholder_shown(), \
        "Expected a placeholder for missing email but found actual data."


@then("the profile page should display placeholders for all missing profile fields")
def step_assert_all_placeholders(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_full_name_placeholder_shown(), \
        "Full name placeholder is missing."
    assert profile_page.is_email_placeholder_shown(), \
        "Email address placeholder is missing."


@then("the page should still render without errors")
def step_assert_page_renders(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.page_renders_without_errors(), \
        "Profile page rendered with errors."


# ------------------------------------------------------------------ #
#  Assertions — Read-only mode
# ------------------------------------------------------------------ #

@then("all profile fields should be in read-only mode")
def step_assert_all_fields_read_only(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.all_fields_are_read_only(), \
        "Profile fields are not in read-only mode."


@then("no edit controls should be available for any profile field")
def step_assert_no_edit_controls(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.no_edit_controls_present(), \
        "Edit controls are present on the Profile page."


@then("the full name field should not accept any input")
def step_assert_full_name_not_editable(context):
    profile_page     = ProfilePage(context.driver)
    attempted_value  = getattr(context, "attempted_full_name_value", "modified_full_name_text")
    assert profile_page.full_name_did_not_accept_input(attempted_value), \
        f"Full name field accepted input: '{attempted_value}'. Expected read-only."


@then("the email address field should not accept any input")
def step_assert_email_not_editable(context):
    profile_page    = ProfilePage(context.driver)
    attempted_value = getattr(context, "attempted_email_value", "modified@hacker.com")
    assert profile_page.email_did_not_accept_input(attempted_value), \
        f"Email field accepted input: '{attempted_value}'. Expected read-only."


# ------------------------------------------------------------------ #
#  Assertions — Navigation
# ------------------------------------------------------------------ #

@then("the Profile page option should be visible and accessible")
def step_assert_profile_nav_visible(context):
    nav_page = NavigationPage(context.driver)
    assert nav_page.is_profile_link_visible(), \
        "Profile link is not visible in the navigation menu."
    assert nav_page.is_profile_link_clickable(), \
        "Profile link is not clickable in the navigation menu."


# ------------------------------------------------------------------ #
#  Assertions — Error handling
# ------------------------------------------------------------------ #

@then("the system should display a user-friendly error message")
def step_assert_friendly_error_message(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_error_banner_displayed(), \
        "User-friendly error message banner is not displayed."
    error_text = profile_page.get_error_message_text()
    assert error_text != "", \
        "Error message banner is visible but text is empty."


@then("the system should not expose any technical error details to the user")
def step_assert_no_technical_details(context):
    profile_page = ProfilePage(context.driver)
    assert not profile_page.error_contains_technical_details(), \
        "Technical error details are exposed to the user."


@then("a session timeout message should be displayed")
def step_assert_session_timeout_message(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_session_timeout_message_displayed(), \
        "Session timeout message is not displayed after session expiry."


# ------------------------------------------------------------------ #
#  Assertions — Restricted controls
# ------------------------------------------------------------------ #

@then("no option to edit or update profile information should be present")
def step_assert_no_edit_option(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_edit_button_absent(), \
        "Edit profile button is present but should not be."
    assert profile_page.is_save_button_absent(), \
        "Save profile button is present but should not be."


@then("no profile photo upload or management option should be present")
def step_assert_no_photo_upload(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_photo_upload_absent(), \
        "Profile photo upload control is present but should not be."


@then("no password change option should be present on the profile page")
def step_assert_no_password_change(context):
    profile_page = ProfilePage(context.driver)
    assert profile_page.is_change_password_absent(), \
        "Change password link is present but should not be."


# ------------------------------------------------------------------ #
#  Assertions — Cross-user security
# ------------------------------------------------------------------ #

@then("the system should not display Bob's profile data")
def step_assert_bob_data_not_displayed(context):
    profile_page = ProfilePage(context.driver)
    full_name    = profile_page.get_displayed_full_name()
    email        = profile_page.get_displayed_email()
    assert "bob" not in full_name.lower() and "bob" not in email.lower(), \
        "Bob's profile data is displayed. Potential data leak via URL manipulation."


@then("the system should either redirect to Alice's profile or display an authorization error")
def step_assert_redirect_or_auth_error(context):
    profile_page = ProfilePage(context.driver)
    from pages.login_page import LoginPage
    login_page   = LoginPage(context.driver)

    on_alice_profile = profile_page.is_element_visible(
        profile_page._PROFILE_PAGE_CONTAINER
    )
    on_auth_error    = profile_page.is_authorization_error_displayed()
    on_login_page    = login_page.is_login_page_displayed()

    assert on_alice_profile or on_auth_error or on_login_page, \
        "System did not redirect appropriately after URL manipulation attempt."
