from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config.settings import LOGIN_URL


class LoginPage(BasePage):

    # ------------------------------------------------------------------ #
    #  Locators
    # ------------------------------------------------------------------ #
    _USERNAME_INPUT    = (By.ID,   "username")
    _PASSWORD_INPUT    = (By.ID,   "password")
    _LOGIN_BUTTON      = (By.ID,   "login-btn")
    _LOGIN_PAGE_HEADER = (By.ID,   "login-heading")
    _ERROR_MESSAGE     = (By.ID,   "login-error-msg")

    # ------------------------------------------------------------------ #
    #  Actions
    # ------------------------------------------------------------------ #
    def open_login_page(self):
        self.open(LOGIN_URL)

    def enter_username(self, username: str):
        self.enter_text(self._USERNAME_INPUT, username)

    def enter_password(self, password: str):
        self.enter_text(self._PASSWORD_INPUT, password)

    def click_login(self):
        self.click(self._LOGIN_BUTTON)

    def login(self, username: str, password: str):
        self.open_login_page()
        self.enter_username(username)
        self.enter_password(password)
        self.click_login()

    # ------------------------------------------------------------------ #
    #  Verifications
    # ------------------------------------------------------------------ #
    def is_login_page_displayed(self) -> bool:
        return self.is_element_visible(self._LOGIN_PAGE_HEADER)

    def get_login_error_message(self) -> str:
        return self.get_text(self._ERROR_MESSAGE)
