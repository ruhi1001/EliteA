"""
NavigationPage page object for APR2_ViewUserProfile.
Contains navigation menu actions like opening profile and logging out.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage


class NavigationPage(BasePage):
    MENU_TOGGLE = (By.CSS_SELECTOR, "nav .menu-toggle")
    PROFILE_LINK = (By.LINK_TEXT, "Profile")
    LOGOUT_LINK = (By.LINK_TEXT, "Logout")

    def open_profile(self):
        self.click(self.MENU_TOGGLE)
        self.click(self.PROFILE_LINK)

    def logout(self):
        self.click(self.MENU_TOGGLE)
        self.click(self.LOGOUT_LINK)

