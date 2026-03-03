from behave import given, when, then
from RememberMe.pages.login_page import LoginPage
from RememberMe.pages.home_page import HomePage
from RememberMe.pages.session_helper import SessionHelper


@given('the user is on the login page')
def step_user_is_on_login_page(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)


@given('the login form contains a "Remember Me" checkbox')
def step_login_form_contains_remember_me_checkbox(context):
    assert context.login_page.is_remember_me_checkbox_displayed(), \
        "Remember Me checkbox is not present on the login form"


@when('the user navigates to the login page')
def step_user_navigates_to_login_page(context):
    context.login_page = LoginPage(context.driver)
    context.home_page = HomePage(context.driver)
    context.session_helper = SessionHelper(context.driver)
    context.login_page.open(context.base_url)


@given('the "Remember Me" checkbox is unchecked by default')
def step_remember_me_unchecked_by_default(context):
    assert context.login_page.is_remember_me_checkbox_unchecked(), \
        "Remember Me checkbox should be unchecked by default"


@given('the "Remember Me" checkbox is not checked')
def step_remember_me_is_not_checked(context):
    context.login_page.uncheck_remember_me()


@given('the "Remember Me" checkbox is checked')
def step_remember_me_is_checked(context):
    context.login_page.check_remember_me()
