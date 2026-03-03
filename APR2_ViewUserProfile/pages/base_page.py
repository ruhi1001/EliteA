"""
BasePage utilities for APR2_ViewUserProfile tests.
Initial structure created by automation upload script.
"""

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


class BasePage:
    """Base page providing common webdriver utilities and explicit waits."""

    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.timeout = timeout

    # TODO: add explicit wait utilities, click, get_text, is_visible, cookies helpers
    def wait_for_element(self, locator):
        """Wait for element to be present and return it."""
        return WebDriverWait(self.driver, self.timeout).until(EC.presence_of_element_located(locator))

    def click(self, locator):
        elem = WebDriverWait(self.driver, self.timeout).until(EC.element_to_be_clickable(locator))
        elem.click()

    def get_text(self, locator):
        elem = WebDriverWait(self.driver, self.timeout).until(EC.visibility_of_element_located(locator))
        return elem.text

    # Placeholder for additional utilities
    # def set_cookie(self, name, value):
    #     self.driver.add_cookie({'name': name, 'value': value})

