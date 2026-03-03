from behave import given, when, then
from RememberMe.pages.login_page import LoginPage
from RememberMe.pages.home_page import HomePage
from RememberMe.pages.session_helper import SessionHelper


# ── Login Action Steps ────────────────────────────────────────────────────────

@when('the user enters valid credentials')
def step_user_enters_valid_credentials(context):
    context.login_page.enter_credentials(context.valid_username, context.valid_password)


@when('the user enters invalid credentials')
def step_user_enters_invalid_credentials(context):
    context.login_page.enter_credentials(context.invalid_username, context.invalid_password)


@when('the user checks the "Remember Me" checkbox')
def step_user_checks_remember_me(context):
    context.login_page.check_remember_me()


@when('the user unchecks the "Remember Me" checkbox')
def step_user_unchecks_remember_me(context):
    context.login_page.uncheck_remember_me()


@when('the user clicks the Login button')
def step_user_clicks_login_button(context):
    context.login_page.click_login_button()


@when('the user submits the login form with empty username and password')
def step_user_submits_empty_credentials(context):
    context.login_page.submit_empty_credentials()


@when('the user enters a valid username and leaves the password field empty')
def step_user_enters_valid_username_empty_password(context):
    context.login_page.enter_username(context.valid_username)


@when('the user explicitly clicks the Logout button')
def step_user_clicks_logout(context):
    context.home_page.click_logout()


@when('the user attempts to access a protected page directly')
def step_user_accesses_protected_page(context):
    context.login_page.navigate_to(context.protected_page_url)


@when('the user navigates to the application')
def step_user_navigates_to_application(context):
    context.login_page.navigate_to(context.base_url)


@when('the user opens the application')
def step_user_opens_application(context):
    context.login_page.navigate_to(context.base_url)


@when('the user opens the application in a new browser session')
def step_user_opens_application_new_session(context):
    context.login_page.navigate_to(context.base_url)


# ── Login State Precondition Steps ────────────────────────────────────────────

@given('the user has previously logged in with "Remember Me" selected')
def step_user_previously_logged_in_with_remember_me(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)
    context.pre_login_token = context.session_helper.persistent_cookie_value()


@given('the user is authenticated with a persistent session via "Remember Me"')
def step_user_authenticated_with_persistent_session(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)


@given('the user is authenticated without "Remember Me"')
def step_user_authenticated_without_remember_me(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)


@given('the user has logged out explicitly after a "Remember Me" session')
def step_user_logged_out_after_remember_me_session(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)
    context.home_page.click_logout()
    context.login_page.wait_for_element_visible(context.login_page._LOGIN_BUTTON)


@given('the user logs in with valid credentials and "Remember Me" checked')
def step_user_logs_in_with_remember_me_checked(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()


@given('the user logs in with valid credentials without checking "Remember Me"')
def step_user_logs_in_without_remember_me(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.uncheck_remember_me()


@when('the authentication succeeds')
def step_authentication_succeeds(context):
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)


# ── Authentication Assertion Steps ────────────────────────────────────────────

@then('the user is successfully authenticated')
def step_user_is_successfully_authenticated(context):
    assert context.home_page.is_authenticated(), \
        "User is not authenticated after login"


@then('the user is successfully authenticated with a standard session')
def step_user_authenticated_standard_session(context):
    assert context.home_page.is_authenticated(), \
        "User is not authenticated with a standard session"


@then('the user is automatically authenticated')
def step_user_is_automatically_authenticated(context):
    assert context.home_page.is_authenticated(), \
        "User was not automatically authenticated"


@then('the user is directed to the authenticated home page')
def step_user_directed_to_home_page(context):
    context.home_page.wait_for_url_contains("/dashboard")
    assert context.home_page.is_authenticated(), \
        "User is not on the authenticated home page"


@then('the user remains authenticated without re-entering credentials')
def step_user_remains_authenticated(context):
    assert context.home_page.is_authenticated(), \
        "User is not authenticated after browser reopen"


@then('the user remains authenticated')
def step_user_remains_authenticated_simple(context):
    assert context.home_page.is_authenticated(), \
        "User is not authenticated"


@then('the user is not prompted to log in again')
def step_user_not_prompted_to_login(context):
    assert not context.login_page.is_on_login_page(), \
        "User was prompted to log in again unexpectedly"


@then('the user is redirected to the login page and must re-authenticate')
def step_user_redirected_to_login(context):
    context.login_page.wait_for_url_contains("/login")
    assert context.login_page.is_on_login_page(), \
        "User was not redirected to the login page"


@then('the user is redirected to the login page')
def step_user_redirected_to_login_page(context):
    context.login_page.wait_for_url_contains("/login")
    assert context.login_page.is_on_login_page(), \
        "User was not redirected to the login page"


@then('the user is prompted to log in again')
def step_user_prompted_to_login(context):
    assert context.login_page.is_on_login_page(), \
        "User was not prompted to log in again"


@then('the user must re-authenticate')
def step_user_must_reauthenticate(context):
    assert context.login_page.is_on_login_page(), \
        "Login page is not displayed for re-authentication"


# ── Login Failure Assertion Steps ─────────────────────────────────────────────

@then('the login attempt fails')
def step_login_attempt_fails(context):
    assert not context.home_page.is_authenticated(), \
        "Login should have failed but user is authenticated"


@then('an appropriate error message is displayed')
def step_error_message_displayed(context):
    assert context.login_page.is_error_message_displayed(), \
        "Error message is not displayed after failed login"


@then('validation error messages are displayed')
def step_validation_error_messages_displayed(context):
    assert (
        context.login_page.is_username_validation_error_displayed()
        or context.login_page.is_password_validation_error_displayed()
    ), "Validation error messages are not displayed"


@then('a validation error is displayed for the password field')
def step_password_validation_error_displayed(context):
    assert context.login_page.is_password_validation_error_displayed(), \
        "Password validation error is not displayed"
