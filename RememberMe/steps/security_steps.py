from behave import given, when, then
from RememberMe.pages.login_page import LoginPage
from RememberMe.pages.home_page import HomePage
from RememberMe.pages.session_helper import SessionHelper


# ── Account Suspension Steps ──────────────────────────────────────────────────

@when('the user account is suspended or deactivated')
def step_account_suspended_or_deactivated(context):
    context.account_suspended = True


@when('the user attempts to access the application')
def step_user_attempts_to_access_application(context):
    context.login_page.navigate_to(context.base_url)


@given('the user account has been suspended')
def step_account_has_been_suspended(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.account_suspended = True


@given('a previously issued persistent session token exists')
def step_previously_issued_persistent_token_exists(context):
    context.login_page.navigate_to(context.base_url)
    context.session_helper.inject_expired_persistent_cookie("suspended_account_token_999")


@when('the application attempts to validate the persistent token')
def step_app_validates_persistent_token(context):
    context.login_page.navigate_to(context.base_url)


@then('the persistent session is revoked immediately')
def step_persistent_session_revoked_immediately(context):
    assert not context.session_helper.has_persistent_cookie() \
           or context.login_page.is_on_login_page(), \
        "Persistent session was not revoked upon account suspension"


@then('the user receives an appropriate account suspension message')
def step_user_receives_suspension_message(context):
    assert (
        context.home_page.is_account_suspended_message_displayed()
        or context.login_page.is_error_message_displayed()
    ), "Account suspension message was not displayed"


@then('the token validation fails')
def step_token_validation_fails(context):
    assert context.login_page.is_on_login_page(), \
        "Token validation should have failed for suspended account"


@then('access to the application is denied')
def step_access_to_application_denied(context):
    assert not context.home_page.is_authenticated(), \
        "Access to application should be denied for suspended account"


# ── HttpOnly Cookie Security Steps ────────────────────────────────────────────

@then('the persistent token is stored in a secure HttpOnly cookie')
def step_persistent_token_in_http_only_cookie(context):
    assert context.session_helper.has_persistent_cookie(), \
        "Persistent cookie was not issued"
    assert context.session_helper.persistent_cookie_is_http_only(), \
        "Persistent cookie is not marked as HttpOnly"


@then('the cookie is not accessible via client-side scripts')
def step_cookie_not_accessible_via_js(context):
    assert not context.session_helper.persistent_cookie_accessible_via_js(), \
        "HttpOnly cookie is accessible via client-side JavaScript"


@then('the cookie is transmitted only over HTTPS')
def step_cookie_transmitted_over_https_only(context):
    assert context.session_helper.persistent_cookie_is_secure(), \
        "Persistent cookie does not have the Secure flag set"


@then('no persistent HttpOnly cookie is issued')
def step_no_persistent_http_only_cookie_issued(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "A persistent HttpOnly cookie was issued when Remember Me was not selected"


@then('only a standard session cookie is created')
def step_only_standard_session_cookie_created(context):
    assert context.session_helper.has_session_cookie(), \
        "Standard session cookie was not created"
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent cookie should not exist when Remember Me is not selected"


# ── Checkbox UI State Steps ────────────────────────────────────────────────────

@then('the "Remember Me" checkbox is displayed')
def step_remember_me_checkbox_is_displayed(context):
    assert context.login_page.is_remember_me_checkbox_displayed(), \
        "Remember Me checkbox is not displayed on the login page"


@then('the "Remember Me" checkbox is unchecked by default')
def step_remember_me_checkbox_unchecked_by_default(context):
    assert context.login_page.is_remember_me_checkbox_unchecked(), \
        "Remember Me checkbox is not unchecked by default"


@then('the checkbox reflects the checked state')
def step_checkbox_reflects_checked_state(context):
    assert context.login_page.is_remember_me_checkbox_checked(), \
        "Remember Me checkbox does not reflect the checked state"


@then('the checkbox reflects the unchecked state')
def step_checkbox_reflects_unchecked_state(context):
    assert context.login_page.is_remember_me_checkbox_unchecked(), \
        "Remember Me checkbox does not reflect the unchecked state"
