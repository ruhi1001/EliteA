from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from config.settings import BASE_URL, DEFAULT_TIMEOUT


def before_all(context):
    context.base_url = BASE_URL
    context.default_timeout = DEFAULT_TIMEOUT


def before_scenario(context, scenario):
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--window-size=1920,1080")

    context.driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options,
    )
    context.driver.implicitly_wait(0)
    context.driver.maximize_window()
    context.session_data = {}


def after_scenario(context, scenario):
    if scenario.status == "failed":
        context.driver.save_screenshot(f"reports/screenshots/{scenario.name}.png")
    context.driver.quit()


def after_all(context):
    pass
