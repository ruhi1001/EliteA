"""
Profile-specific step definitions for APR2_ViewUserProfile.
Assertions for profile data and read-only checks.
"""

from behave import then
from APR2_ViewUserProfile.pages.profile_page import ProfilePage


@then('the profile page should display the user\'s full name')
def step_check_full_name(context):
    context.profile_page = ProfilePage(context.driver)
    expected = context.user_full_name if hasattr(context, 'user_full_name') else None
    actual = context.profile_page.get_full_name()
    if expected:
        assert expected == actual
    else:
        assert actual != ''


@then('the profile page should display the user\'s email address')
def step_check_email(context):
    context.profile_page = ProfilePage(context.driver)
    expected = context.user_email if hasattr(context, 'user_email') else None
    actual = context.profile_page.get_email()
    if expected:
        assert expected == actual
    else:
        assert '@' in actual


@then('all profile fields should be in read-only mode')
def step_check_read_only(context):
    context.profile_page = ProfilePage(context.driver)
    assert context.profile_page.is_field_read_only(context.profile_page.FULL_NAME)
    assert context.profile_page.is_field_read_only(context.profile_page.EMAIL)

