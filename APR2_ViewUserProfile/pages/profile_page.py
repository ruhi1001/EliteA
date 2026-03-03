"""
ProfilePage page object for APR2_ViewUserProfile.
Holds locators and helpers to read profile fields and assert read-only state.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage


class ProfilePage(BasePage):
    FULL_NAME = (By.CSS_SELECTOR, "#full_name")
    EMAIL = (By.CSS_SELECTOR, "#email")

    def get_full_name(self):
        return self.get_text(self.FULL_NAME)

    def get_email(self):
        return self.get_text(self.EMAIL)

    def is_field_read_only(self, locator):
        el = self.wait_for_element(locator)
        readonly = el.get_attribute('readonly')
        disabled = el.get_attribute('disabled')
        tag = el.tag_name.lower()
        if readonly is not None or disabled is not None or tag in ('p', 'span', 'div'):
            return True
        return False

