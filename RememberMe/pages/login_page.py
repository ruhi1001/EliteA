from selenium.webdriver.common.by import By
from RememberMe.pages.base_page import BasePage


class LoginPage(BasePage):
    # ── Locators ──────────────────────────────────────────────────────────────
    _USERNAME_INPUT = (By.ID, "username")
    _PASSWORD_INPUT = (By.ID, "password")
    _REMEMBER_ME_CHECKBOX = (By.ID, "remember-me")
    _LOGIN_BUTTON = (By.ID, "login-btn")
    _ERROR_MESSAGE = (By.ID, "login-error-message")
    _USERNAME_VALIDATION_ERROR = (By.ID, "username-error")
    _PASSWORD_VALIDATION_ERROR = (By.ID, "password-error")
    _REMEMBER_ME_LABEL = (By.CSS_SELECTOR, "label[for='remember-me']")

    # ── Navigation ────────────────────────────────────────────────────────────
    def open(self, base_url: str):
        self.navigate_to(f"{base_url}/login")
        self.wait_for_element_visible(self._LOGIN_BUTTON)

    # ── Actions ───────────────────────────────────────────────────────────────
    def enter_username(self, username: str):
        field = self.wait_for_element_visible(self._USERNAME_INPUT)
        field.clear()
        field.send_keys(username)

    def enter_password(self, password: str):
        field = self.wait_for_element_visible(self._PASSWORD_INPUT)
        field.clear()
        field.send_keys(password)

    def enter_credentials(self, username: str, password: str):
        self.enter_username(username)
        self.enter_password(password)

    def check_remember_me(self):
        checkbox = self.wait_for_element_clickable(self._REMEMBER_ME_CHECKBOX)
        if not checkbox.is_selected():
            checkbox.click()

    def uncheck_remember_me(self):
        checkbox = self.wait_for_element_clickable(self._REMEMBER_ME_CHECKBOX)
        if checkbox.is_selected():
            checkbox.click()

    def click_login_button(self):
        self.wait_for_element_clickable(self._LOGIN_BUTTON).click()

    def submit_empty_credentials(self):
        self.wait_for_element_clickable(self._LOGIN_BUTTON).click()

    # ── Queries ───────────────────────────────────────────────────────────────
    def is_remember_me_checkbox_displayed(self) -> bool:
        return self.is_element_present(self._REMEMBER_ME_CHECKBOX)

    def is_remember_me_checkbox_checked(self) -> bool:
        checkbox = self.wait_for_element_visible(self._REMEMBER_ME_CHECKBOX)
        return checkbox.is_selected()

    def is_remember_me_checkbox_unchecked(self) -> bool:
        return not self.is_remember_me_checkbox_checked()

    def get_error_message_text(self) -> str:
        return self.wait_for_element_visible(self._ERROR_MESSAGE).text

    def get_username_validation_error_text(self) -> str:
        return self.wait_for_element_visible(self._USERNAME_VALIDATION_ERROR).text

    def get_password_validation_error_text(self) -> str:
        return self.wait_for_element_visible(self._PASSWORD_VALIDATION_ERROR).text

    def is_error_message_displayed(self) -> bool:
        return self.is_element_present(self._ERROR_MESSAGE)

    def is_username_validation_error_displayed(self) -> bool:
        return self.is_element_present(self._USERNAME_VALIDATION_ERROR)

    def is_password_validation_error_displayed(self) -> bool:
        return self.is_element_present(self._PASSWORD_VALIDATION_ERROR)

    def is_on_login_page(self) -> bool:
        return self.is_element_present(self._LOGIN_BUTTON)
