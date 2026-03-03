from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "https://your-application.com"
VALID_USERNAME = "valid_user@example.com"
VALID_PASSWORD = "ValidPassword123!"
INVALID_USERNAME = "invalid_user@example.com"
INVALID_PASSWORD = "WrongPassword!"
PROTECTED_PAGE_URL = f"{BASE_URL}/dashboard"
PERSISTENT_COOKIE_NAME = "remember_me_token"
SESSION_COOKIE_NAME = "session_id"


def before_scenario(context, scenario):
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    context.driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    context.driver.implicitly_wait(0)
    context.driver.maximize_window()
    context.base_url = BASE_URL
    context.valid_username = VALID_USERNAME
    context.valid_password = VALID_PASSWORD
    context.invalid_username = INVALID_USERNAME
    context.invalid_password = INVALID_PASSWORD
    context.protected_page_url = PROTECTED_PAGE_URL
    context.persistent_cookie_name = PERSISTENT_COOKIE_NAME
    context.session_cookie_name = SESSION_COOKIE_NAME


def after_scenario(context, scenario):
    if hasattr(context, "driver") and context.driver:
        context.driver.quit()
