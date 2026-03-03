from behave import given, when, then
from RememberMe.pages.login_page import LoginPage
from RememberMe.pages.home_page import HomePage
from RememberMe.pages.session_helper import SessionHelper


# ── Session Precondition Steps ────────────────────────────────────────────────

@given('the persistent session was created less than 7 days ago')
def step_session_created_less_than_7_days(context):
    assert context.session_helper.has_persistent_cookie(), \
        "Persistent session cookie is not present"


@given('7 days have elapsed since the persistent session was created')
def step_7_days_elapsed(context):
    context.simulated_days_elapsed = 7


@given('6 days have elapsed since the persistent session was created')
def step_6_days_elapsed(context):
    context.simulated_days_elapsed = 6


@given('8 days have elapsed since the persistent session was created')
def step_8_days_elapsed(context):
    context.simulated_days_elapsed = 8


@given('the user logged in with "Remember Me" {days_elapsed:d} days ago')
def step_user_logged_in_n_days_ago(context, days_elapsed):
    context.simulated_days_elapsed = days_elapsed


@given('the user has active "Remember Me" sessions on multiple devices')
def step_user_has_active_sessions_multiple_devices(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)


@given('the user previously logged in with "Remember Me" on a device')
def step_user_previously_logged_in_on_device(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)
    context.old_token = context.session_helper.persistent_cookie_value()


@given('the user has since changed their password from another session')
def step_user_changed_password_another_session(context):
    context.password_changed = True


@given('the user has an active persistent session via "Remember Me"')
def step_user_has_active_persistent_session(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)
    context.pre_rotation_token = context.session_helper.persistent_cookie_value()


@given('the user has logged in with "Remember Me" on Device A')
def step_user_logged_in_device_a(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)
    context.device_a_token = context.session_helper.persistent_cookie_value()


@given('the user has an active "Remember Me" session on Device A')
def step_user_has_active_session_device_a(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)


@given('a persistent session token that expired after 7 days')
def step_expired_persistent_token_exists(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)
    context.session_helper.inject_expired_persistent_cookie("expired_token_value_12345")


# ── Session Action Steps ───────────────────────────────────────────────────────

@when('the user manually clears all browser cookies and local storage')
def step_user_clears_cookies_and_storage(context):
    context.session_helper.clear_all_client_storage()


@when('the user terminates the browser session')
def step_user_terminates_browser_session(context):
    context.session_helper.delete_all_cookies()
    context.session_helper.clear_session_storage()


@when('when the user closes and reopens the browser within 7 days')
def step_user_closes_and_reopens_browser(context):
    context.session_helper.clear_session_storage()


@when('when the user closes the browser')
def step_user_closes_browser(context):
    context.session_helper.clear_session_storage()


@when('the user reopens the browser and navigates to the application')
def step_user_reopens_browser_and_navigates(context):
    context.session_helper.clear_session_storage()
    context.login_page.navigate_to(context.base_url)


@when('the user changes their account password')
def step_user_changes_account_password(context):
    context.home_page.change_password(context.valid_password, "NewSecurePassword456!")
    context.valid_password = "NewSecurePassword456!"


@when('the user logs in with "Remember Me" on Device B')
def step_user_logs_in_device_b(context):
    context.login_page.navigate_to(f"{context.base_url}/login")
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.check_remember_me()
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)
    context.device_b_token = context.session_helper.persistent_cookie_value()


@when('the user closes the browser on Device A')
def step_user_closes_browser_device_a(context):
    context.session_helper.clear_session_storage()


@when('the user opens the application on Device B within 7 days of Device B session creation')
def step_user_opens_app_device_b(context):
    context.login_page.navigate_to(context.base_url)


@when('the user opens the application on the original device within the 7-day window')
def step_user_opens_app_original_device(context):
    context.login_page.navigate_to(context.base_url)


@when('the user accesses the application and the persistent token is validated')
def step_user_accesses_with_persistent_token(context):
    context.pre_rotation_token = context.session_helper.persistent_cookie_value()
    context.login_page.navigate_to(context.base_url)
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)


@when('the token is submitted to the authentication service')
def step_token_submitted_to_auth_service(context):
    context.login_page.navigate_to(context.base_url)


# ── Session Assertion Steps ────────────────────────────────────────────────────

@then('a persistent session token is issued')
def step_persistent_session_token_issued(context):
    assert context.session_helper.has_persistent_cookie(), \
        "Persistent session cookie was not issued after Remember Me login"


@then('no persistent session token is issued')
def step_no_persistent_session_token_issued(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent session cookie should not have been issued"


@then('no persistent session token is created')
def step_no_persistent_session_token_created(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent session cookie should not have been created"


@then('no persistent session is created')
def step_no_persistent_session_created(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent session should not have been created"


@then('no persistent session is created after login')
def step_no_persistent_session_created_after_login(context):
    context.login_page.enter_credentials(context.valid_username, context.valid_password)
    context.login_page.click_login_button()
    context.home_page.wait_for_element_visible(context.home_page._USER_PROFILE_INDICATOR)
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent session should not be created when Remember Me is unchecked"


@then('no persistent authentication token is stored')
def step_no_persistent_auth_token_stored(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent authentication token was stored unexpectedly"


@then('the session is invalidated')
def step_session_is_invalidated(context):
    assert not context.session_helper.has_session_cookie(), \
        "Session cookie still present after termination"


@then('the persistent session is expired')
def step_persistent_session_is_expired(context):
    assert not context.home_page.is_authenticated(), \
        "Persistent session should be expired but user is still authenticated"


@then('the persistent session is invalidated')
def step_persistent_session_invalidated(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent session cookie should have been invalidated"


@then('the expired session token is invalidated')
def step_expired_session_token_invalidated(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Expired session token was not invalidated"


@then('the persistent session token is cleared from the client')
def step_persistent_token_cleared_from_client(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent session token was not cleared from client after logout"


@then('the persistent token is invalidated on the server side')
def step_persistent_token_invalidated_server_side(context):
    context.login_page.navigate_to(context.base_url)
    context.login_page.wait_for_url_contains("/login")
    assert context.login_page.is_on_login_page(), \
        "Server did not invalidate the persistent token on logout"


@then('reopening the browser does not restore the session')
def step_reopening_browser_does_not_restore_session(context):
    context.login_page.navigate_to(context.base_url)
    context.login_page.wait_for_url_contains("/login")
    assert context.login_page.is_on_login_page(), \
        "Session was restored after logout on browser reopen"


@then('the previously issued persistent token is rejected by the server')
def step_previous_token_rejected_by_server(context):
    assert context.login_page.is_on_login_page(), \
        "Server did not reject the previously issued persistent token"


@then('all persistent session tokens associated with the account are invalidated')
def step_all_persistent_tokens_invalidated(context):
    assert not context.session_helper.has_persistent_cookie(), \
        "Persistent cookies were not cleared after password change"


@then('each device is redirected to the login page upon next access')
def step_each_device_redirected_to_login(context):
    context.login_page.navigate_to(context.base_url)
    context.login_page.wait_for_url_contains("/login")
    assert context.login_page.is_on_login_page(), \
        "Device was not redirected to login page after password change"


@then('Device A maintains its own independent persistent session')
def step_device_a_maintains_independent_session(context):
    assert context.device_a_token, \
        "Device A does not have a persistent session token"


@then('Device B maintains its own independent persistent session')
def step_device_b_maintains_independent_session(context):
    assert context.device_b_token, \
        "Device B does not have a persistent session token"


@then('logging out on Device A does not affect the session on Device B')
def step_logout_device_a_does_not_affect_device_b(context):
    assert context.device_a_token != context.device_b_token, \
        "Device A and Device B should have independent session tokens"


@then('Device B session remains valid independently')
def step_device_b_session_remains_valid(context):
    assert context.home_page.is_authenticated(), \
        "Device B session is not valid independently"


@then('the existing persistent token is rotated')
def step_existing_token_is_rotated(context):
    new_token = context.session_helper.persistent_cookie_value()
    assert new_token != context.pre_rotation_token, \
        "Persistent token was not rotated after use"


@then('a new persistent token is issued to replace the old one')
def step_new_persistent_token_issued(context):
    assert context.session_helper.has_persistent_cookie(), \
        "New persistent token was not issued after rotation"


@then('the old token is invalidated on the server')
def step_old_token_invalidated_on_server(context):
    assert context.session_helper.persistent_cookie_value() != context.pre_rotation_token, \
        "Old token was not invalidated on the server after rotation"


@then('the token is rejected as expired')
def step_token_rejected_as_expired(context):
    assert context.login_page.is_on_login_page(), \
        "Expired token was not rejected"


@then('no new session is created from the expired token')
def step_no_new_session_from_expired_token(context):
    assert not context.home_page.is_authenticated(), \
        "A new session was created from an expired token"


@then('the session state should be "{expected_state}"')
def step_session_state_should_be(context, expected_state):
    if expected_state == "authenticated":
        assert context.home_page.is_authenticated(), \
            f"Expected session state 'authenticated' but user is not authenticated"
    elif expected_state == "expired":
        assert context.login_page.is_on_login_page(), \
            f"Expected session state 'expired' but user is still authenticated"
    else:
        raise ValueError(f"Unknown expected session state: {expected_state}")
