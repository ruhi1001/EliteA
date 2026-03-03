from selenium.webdriver.common.by import By
from RememberMe.pages.base_page import BasePage


class HomePage(BasePage):
    # ── Locators ──────────────────────────────────────────────────────────────
    _LOGOUT_BUTTON = (By.ID, "logout-btn")
    _USER_PROFILE_INDICATOR = (By.ID, "user-profile")
    _WELCOME_HEADER = (By.ID, "welcome-header")
    _ACCOUNT_SUSPENDED_MESSAGE = (By.ID, "account-suspended-message")
    _CHANGE_PASSWORD_LINK = (By.ID, "change-password-link")
    _CURRENT_PASSWORD_INPUT = (By.ID, "current-password")
    _NEW_PASSWORD_INPUT = (By.ID, "new-password")
    _CONFIRM_PASSWORD_INPUT = (By.ID, "confirm-password")
    _SAVE_PASSWORD_BUTTON = (By.ID, "save-password-btn")

    # ── Navigation ────────────────────────────────────────────────────────────
    def open(self, base_url: str):
        self.navigate_to(f"{base_url}/dashboard")
        self.wait_for_element_visible(self._USER_PROFILE_INDICATOR)

    # ── Actions ───────────────────────────────────────────────────────────────
    def click_logout(self):
        self.wait_for_element_clickable(self._LOGOUT_BUTTON).click()

    def navigate_to_change_password(self):
        self.wait_for_element_clickable(self._CHANGE_PASSWORD_LINK).click()

    def change_password(self, current_password: str, new_password: str):
        self.navigate_to_change_password()
        self.wait_for_element_visible(self._CURRENT_PASSWORD_INPUT).send_keys(current_password)
        self.wait_for_element_visible(self._NEW_PASSWORD_INPUT).send_keys(new_password)
        self.wait_for_element_visible(self._CONFIRM_PASSWORD_INPUT).send_keys(new_password)
        self.wait_for_element_clickable(self._SAVE_PASSWORD_BUTTON).click()

    # ── Queries ───────────────────────────────────────────────────────────────
    def is_authenticated(self) -> bool:
        return self.is_element_present(self._USER_PROFILE_INDICATOR)

    def is_logout_button_visible(self) -> bool:
        return self.is_element_present(self._LOGOUT_BUTTON)

    def is_account_suspended_message_displayed(self) -> bool:
        return self.is_element_present(self._ACCOUNT_SUSPENDED_MESSAGE)

    def get_account_suspended_message_text(self) -> str:
        return self.wait_for_element_visible(self._ACCOUNT_SUSPENDED_MESSAGE).text
