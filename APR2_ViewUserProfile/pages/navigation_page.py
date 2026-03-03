from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class NavigationPage(BasePage):

    # ------------------------------------------------------------------ #
    #  Locators
    # ------------------------------------------------------------------ #
    _NAV_MENU           = (By.ID,         "main-nav-menu")
    _PROFILE_NAV_LINK   = (By.ID,         "nav-profile-link")
    _LOGOUT_BUTTON      = (By.ID,         "nav-logout-btn")
    _USER_MENU_TOGGLE   = (By.ID,         "user-menu-toggle")

    # ------------------------------------------------------------------ #
    #  Actions
    # ------------------------------------------------------------------ #
    def open_navigation_menu(self):
        self.click(self._USER_MENU_TOGGLE)
        self.wait_for_element_visible(self._NAV_MENU)

    def click_profile_nav_link(self):
        self.click(self._PROFILE_NAV_LINK)

    def logout(self):
        self.open_navigation_menu()
        self.click(self._LOGOUT_BUTTON)

    # ------------------------------------------------------------------ #
    #  Verifications
    # ------------------------------------------------------------------ #
    def is_profile_link_visible(self) -> bool:
        return self.is_element_visible(self._PROFILE_NAV_LINK)

    def is_profile_link_clickable(self) -> bool:
        try:
            self.wait_for_element_clickable(self._PROFILE_NAV_LINK)
            return True
        except Exception:
            return False
