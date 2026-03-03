"""
Common reusable step definitions for APR2_ViewUserProfile.
Includes login/logout and navigation helpers.
"""

from behave import given, when, then
from APR2_ViewUserProfile.pages.login_page import LoginPage
from APR2_ViewUserProfile.pages.navigation_page import NavigationPage


@given('the user is logged into the system')
def step_impl(context):
    # TODO: initialize pages from context.driver and perform login using settings
    context.login_page = LoginPage(context.driver)
    context.nav_page = NavigationPage(context.driver)
    # Placeholder - actual credentials should come from config/settings
    context.login_page.open(context.base_url)
    context.login_page.login(context.username, context.password)


@given('the user is NOT logged into the system')
def step_impl_not_logged(context):
    # Ensure user is logged out for negative scenarios
    context.nav_page = NavigationPage(context.driver)
    try:
        context.nav_page.logout()
    except Exception:
        pass


@when('the user navigates to the Profile page')
def navigate_to_profile(context):
    context.nav_page.open_profile()


@then('the system should redirect the user to the Login page')
def assert_redirect_to_login(context):
    # Placeholder assertion - expecting login page URL or visible login form
    assert 'login' in context.driver.current_url.lower()

