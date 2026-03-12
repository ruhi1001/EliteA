from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from pages.base_page import BasePage
from config.settings import PROFILE_URL, PLACEHOLDER_FULL_NAME, PLACEHOLDER_EMAIL


class ProfilePage(BasePage):

    # ------------------------------------------------------------------ #
    #  Locators
    # ------------------------------------------------------------------ #
    _PROFILE_PAGE_CONTAINER    = (By.ID,         "profile-page-container")
    _FULL_NAME_FIELD           = (By.ID,         "profile-full-name")
    _EMAIL_FIELD               = (By.ID,         "profile-email")
    _EDIT_PROFILE_BUTTON       = (By.ID,         "edit-profile-btn")
    _SAVE_PROFILE_BUTTON       = (By.ID,         "save-profile-btn")
    _PHOTO_UPLOAD_CONTROL      = (By.ID,         "profile-photo-upload")
    _CHANGE_PASSWORD_LINK      = (By.ID,         "change-password-link")
    _ERROR_BANNER              = (By.ID,         "profile-error-banner")
    _ERROR_BANNER_TEXT         = (By.ID,         "profile-error-message")
    _SESSION_TIMEOUT_MESSAGE   = (By.ID,         "session-timeout-msg")
    _EDIT_CONTROLS_GROUP       = (By.CSS_SELECTOR, "[data-testid='edit-control']")
    _AUTHORIZATION_ERROR       = (By.ID,         "authorization-error-msg")
    _PAGE_BODY                 = (By.TAG_NAME,   "body")

    # ------------------------------------------------------------------ #
    #  Actions
    # ------------------------------------------------------------------ #
    def open_profile_page(self):
        self.open(PROFILE_URL)

    def open_profile_page_for_user(self, user_id: str):
        self.open(f"{PROFILE_URL}/{user_id}")

    def attempt_to_modify_full_name(self, text: str = "modified_text"):
        element = self.wait_for_element_present(self._FULL_NAME_FIELD)
        element.send_keys(text)

    def attempt_to_modify_email(self, text: str = "modified@test.com"):
        element = self.wait_for_element_present(self._EMAIL_FIELD)
        element.send_keys(text)

    def wait_for_profile_page_to_load(self):
        self.wait_for_element_visible(self._PROFILE_PAGE_CONTAINER)

    # ------------------------------------------------------------------ #
    #  Verifications — Data
    # ------------------------------------------------------------------ #
    def get_displayed_full_name(self) -> str:
        return self.get_attribute(self._FULL_NAME_FIELD, "value") or \
               self.get_text(self._FULL_NAME_FIELD)

    def get_displayed_email(self) -> str:
        return self.get_attribute(self._EMAIL_FIELD, "value") or \
               self.get_text(self._EMAIL_FIELD)

    def is_full_name_displayed(self) -> bool:
        return self.is_element_visible(self._FULL_NAME_FIELD)

    def is_email_displayed(self) -> bool:
        return self.is_element_visible(self._EMAIL_FIELD)

    def is_full_name_placeholder_shown(self) -> bool:
        value = self.get_displayed_full_name()
        return value == PLACEHOLDER_FULL_NAME or value == ""

    def is_email_placeholder_shown(self) -> bool:
        value = self.get_displayed_email()
        return value == PLACEHOLDER_EMAIL or value == ""

    # ------------------------------------------------------------------ #
    #  Verifications — Read-only
    # ------------------------------------------------------------------ #
    def is_full_name_read_only(self) -> bool:
        readonly  = self.get_attribute(self._FULL_NAME_FIELD, "readonly")
        disabled  = self.get_attribute(self._FULL_NAME_FIELD, "disabled")
        tag       = self.wait_for_element_present(self._FULL_NAME_FIELD).tag_name
        return readonly is not None or disabled is not None or tag in ("p", "span", "div")

    def is_email_read_only(self) -> bool:
        readonly  = self.get_attribute(self._EMAIL_FIELD, "readonly")
        disabled  = self.get_attribute(self._EMAIL_FIELD, "disabled")
        tag       = self.wait_for_element_present(self._EMAIL_FIELD).tag_name
        return readonly is not None or disabled is not None or tag in ("p", "span", "div")

    def all_fields_are_read_only(self) -> bool:
        return self.is_full_name_read_only() and self.is_email_read_only()

    def full_name_did_not_accept_input(self, attempted_value: str) -> bool:
        current_value = self.get_displayed_full_name()
        return attempted_value not in current_value

    def email_did_not_accept_input(self, attempted_value: str) -> bool:
        current_value = self.get_displayed_email()
        return attempted_value not in current_value

    # ------------------------------------------------------------------ #
    #  Verifications — Hidden controls
    # ------------------------------------------------------------------ #
    def is_edit_button_absent(self) -> bool:
        return not self.is_element_present(self._EDIT_PROFILE_BUTTON)

    def is_save_button_absent(self) -> bool:
        return not self.is_element_present(self._SAVE_PROFILE_BUTTON)

    def no_edit_controls_present(self) -> bool:
        return not self.is_element_present(self._EDIT_CONTROLS_GROUP)

    def is_photo_upload_absent(self) -> bool:
        return not self.is_element_present(self._PHOTO_UPLOAD_CONTROL)

    def is_change_password_absent(self) -> bool:
        return not self.is_element_present(self._CHANGE_PASSWORD_LINK)

    # ------------------------------------------------------------------ #
    #  Verifications — Error states
    # ------------------------------------------------------------------ #
    def is_error_banner_displayed(self) -> bool:
        return self.is_element_visible(self._ERROR_BANNER)

    def get_error_message_text(self) -> str:
        return self.get_text(self._ERROR_BANNER_TEXT)

    def error_contains_technical_details(self) -> bool:
        technical_keywords = ["stack trace", "exception", "null pointer",
                               "500", "traceback", "sql", "internal server"]
        error_text = self.get_error_message_text().lower()
        return any(keyword in error_text for keyword in technical_keywords)

    def is_session_timeout_message_displayed(self) -> bool:
        return self.is_element_visible(self._SESSION_TIMEOUT_MESSAGE)

    def is_authorization_error_displayed(self) -> bool:
        return self.is_element_visible(self._AUTHORIZATION_ERROR)

    def page_renders_without_errors(self) -> bool:
        body_text = self.get_text(self._PAGE_BODY)
        error_indicators = ["500 error", "page not found", "uncaught exception"]
        return not any(indicator in body_text.lower() for indicator in error_indicators)
