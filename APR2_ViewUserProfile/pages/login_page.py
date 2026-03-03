"""
LoginPage page object for APR2_ViewUserProfile.
Contains locators and actions for login.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage


class LoginPage(BasePage):
    """Page object for the login page."""

    # Locator placeholders
    USERNAME = (By.ID, "username")
    PASSWORD = (By.ID, "password")
    LOGIN_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")

    def __init__(self, driver, timeout=10):
        super().__init__(driver, timeout)

    def open(self, url):
        self.driver.get(url)

    def login(self, username, password):
        self.wait_for_element(self.USERNAME).send_keys(username)
        self.wait_for_element(self.PASSWORD).send_keys(password)
        self.click(self.LOGIN_BUTTON)

