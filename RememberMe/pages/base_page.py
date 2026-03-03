from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


class BasePage:
    DEFAULT_TIMEOUT = 15

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, self.DEFAULT_TIMEOUT)

    def navigate_to(self, url: str):
        self.driver.get(url)

    def wait_for_element_visible(self, locator: tuple):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def wait_for_element_clickable(self, locator: tuple):
        return self.wait.until(EC.element_to_be_clickable(locator))

    def wait_for_url_contains(self, partial_url: str):
        self.wait.until(EC.url_contains(partial_url))

    def wait_for_url_to_be(self, url: str):
        self.wait.until(EC.url_to_be(url))

    def is_element_present(self, locator: tuple) -> bool:
        try:
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located(locator)
            )
            return True
        except Exception:
            return False

    def get_current_url(self) -> str:
        return self.driver.current_url

    def get_cookie(self, name: str) -> dict:
        return self.driver.get_cookie(name)

    def get_all_cookies(self) -> list:
        return self.driver.get_cookies()

    def delete_all_cookies(self):
        self.driver.delete_all_cookies()

    def clear_local_storage(self):
        self.driver.execute_script("window.localStorage.clear();")

    def clear_session_storage(self):
        self.driver.execute_script("window.sessionStorage.clear();")

    def execute_script(self, script: str, *args):
        return self.driver.execute_script(script, *args)

    def refresh(self):
        self.driver.refresh()
