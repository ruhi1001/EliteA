from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from config.settings import DEFAULT_TIMEOUT


class BasePage:

    def __init__(self, driver):
        self.driver  = driver
        self.timeout = DEFAULT_TIMEOUT
        self.wait    = WebDriverWait(self.driver, self.timeout)

    # ------------------------------------------------------------------ #
    #  Navigation
    # ------------------------------------------------------------------ #
    def open(self, url: str):
        self.driver.get(url)

    def get_current_url(self) -> str:
        return self.driver.current_url

    # ------------------------------------------------------------------ #
    #  Wait helpers
    # ------------------------------------------------------------------ #
    def wait_for_element_visible(self, locator: tuple):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def wait_for_element_clickable(self, locator: tuple):
        return self.wait.until(EC.element_to_be_clickable(locator))

    def wait_for_element_present(self, locator: tuple):
        return self.wait.until(EC.presence_of_element_located(locator))

    def wait_for_url_contains(self, partial_url: str):
        self.wait.until(EC.url_contains(partial_url))

    def wait_for_element_invisible(self, locator: tuple):
        self.wait.until(EC.invisibility_of_element_located(locator))

    # ------------------------------------------------------------------ #
    #  Element interaction
    # ------------------------------------------------------------------ #
    def click(self, locator: tuple):
        self.wait_for_element_clickable(locator).click()

    def enter_text(self, locator: tuple, text: str):
        element = self.wait_for_element_visible(locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator: tuple) -> str:
        return self.wait_for_element_visible(locator).text.strip()

    def get_attribute(self, locator: tuple, attribute: str) -> str:
        return self.wait_for_element_present(locator).get_attribute(attribute)

    def is_element_present(self, locator: tuple) -> bool:
        try:
            WebDriverWait(self.driver, 3).until(
                EC.presence_of_element_located(locator)
            )
            return True
        except Exception:
            return False

    def is_element_visible(self, locator: tuple) -> bool:
        try:
            WebDriverWait(self.driver, 3).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except Exception:
            return False

    # ------------------------------------------------------------------ #
    #  Cookie helpers
    # ------------------------------------------------------------------ #
    def delete_cookie(self, cookie_name: str):
        self.driver.delete_cookie(cookie_name)

    def refresh_page(self):
        self.driver.refresh()
