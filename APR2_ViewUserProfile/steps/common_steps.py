from behave import given, when, then
from pages.login_page import LoginPage
from pages.navigation_page import NavigationPage
from pages.profile_page import ProfilePage
from config.settings import USERS, PROFILE_URL, SESSION_TIMEOUT_COOKIE


# ------------------------------------------------------------------ #
#  Authentication — Logged-in state
# ------------------------------------------------------------------ #

@given("the user is logged into the system")
def step_user_is_logged_in(context):
    credentials = USERS["default"]
    login_page  = LoginPage(context.driver)
    login_page.login(credentials["username"], credentials["password"])
    login_page.wait_for_url_contains("/dashboard")
    context.current_user = credentials["username"]


@given('user "{username}" is logged into the system')
def step_named_user_is_logged_in(context, username):
    credentials = USERS[username]
    login_page  = LoginPage(context.driver)
    login_page.login(credentials["username"], credentials["password"])
    login_page.wait_for_url_contains("/dashboard")
    context.current_user = username


@given('the user "{username}" is logged into the system')
def step_parametrised_user_is_logged_in(context, username):
    credentials = USERS[username]
    login_page  = LoginPage(context.driver)
    login_page.login(credentials["username"], credentials["password"])
    login_page.wait_for_url_contains("/dashboard")
    context.current_user = username


# ------------------------------------------------------------------ #
#  Authentication — Guest / unauthenticated state
# ------------------------------------------------------------------ #

@given("the user is NOT logged into the system")
def step_user_is_not_logged_in(context):
    context.driver.delete_all_cookies()
    context.current_user = None


# ------------------------------------------------------------------ #
#  Session expiry
# ------------------------------------------------------------------ #

@given("the user is on the Profile page")
def step_user_is_on_profile_page(context):
    profile_page = ProfilePage(context.driver)
    profile_page.open_profile_page()
    profile_page.wait_for_profile_page_to_load()


@when("the user's session expires")
def step_session_expires(context):
    base_page = ProfilePage(context.driver)
    base_page.delete_cookie(SESSION_TIMEOUT_COOKIE)
    base_page.refresh_page()


@given("the user's session has expired")
def step_user_session_has_expired(context):
    context.driver.delete_all_cookies()


@given("the user has been redirected to the Login page")
def step_user_redirected_to_login(context):
    login_page = LoginPage(context.driver)
    login_page.open_login_page()
    assert login_page.is_login_page_displayed(), \
        "Expected Login page to be displayed after session expiry."


@when("the user logs in again with valid credentials")
def step_user_logs_in_again(context):
    credentials = USERS["default"]
    login_page  = LoginPage(context.driver)
    login_page.enter_username(credentials["username"])
    login_page.enter_password(credentials["password"])
    login_page.click_login()
    login_page.wait_for_url_contains("/dashboard")
    context.current_user = credentials["username"]


# ------------------------------------------------------------------ #
#  Navigation
# ------------------------------------------------------------------ #

@when("the user navigates to the Profile page")
def step_navigate_to_profile(context):
    nav_page = NavigationPage(context.driver)
    nav_page.click_profile_nav_link()
    profile_page = ProfilePage(context.driver)
    profile_page.wait_for_profile_page_to_load()


@when("the user accesses the navigation menu")
def step_open_navigation_menu(context):
    nav_page = NavigationPage(context.driver)
    nav_page.open_navigation_menu()


@when("the user attempts to access the Profile page")
def step_attempt_access_profile_page(context):
    profile_page = ProfilePage(context.driver)
    profile_page.open_profile_page()


@when("the user directly navigates to the Profile page URL")
def step_direct_url_navigation(context):
    profile_page = ProfilePage(context.driver)
    profile_page.open_profile_page()


@when("the user logs out of the system")
def step_user_logs_out(context):
    nav_page = NavigationPage(context.driver)
    nav_page.logout()


# ------------------------------------------------------------------ #
#  Shared login-page redirect assertion
# ------------------------------------------------------------------ #

@then("the system should redirect the user to the Login page")
def step_assert_redirected_to_login(context):
    login_page = LoginPage(context.driver)
    login_page.wait_for_url_contains("/login")
    assert login_page.is_login_page_displayed(), \
        "Expected redirect to Login page but Login page is not displayed."
