from RememberMe.pages.base_page import BasePage


PERSISTENT_COOKIE_NAME = "remember_me_token"
SESSION_COOKIE_NAME = "session_id"


class SessionHelper(BasePage):

    # ── Cookie Inspection ─────────────────────────────────────────────────────
    def get_persistent_cookie(self) -> dict:
        return self.get_cookie(PERSISTENT_COOKIE_NAME)

    def get_session_cookie(self) -> dict:
        return self.get_cookie(SESSION_COOKIE_NAME)

    def has_persistent_cookie(self) -> bool:
        return self.get_persistent_cookie() is not None

    def has_session_cookie(self) -> bool:
        return self.get_session_cookie() is not None

    def persistent_cookie_is_http_only(self) -> bool:
        cookie = self.get_persistent_cookie()
        return cookie is not None and cookie.get("httpOnly", False) is True

    def persistent_cookie_is_secure(self) -> bool:
        cookie = self.get_persistent_cookie()
        return cookie is not None and cookie.get("secure", False) is True

    def persistent_cookie_value(self) -> str:
        cookie = self.get_persistent_cookie()
        return cookie.get("value", "") if cookie else ""

    # ── Cookie Manipulation ───────────────────────────────────────────────────
    def clear_all_client_storage(self):
        self.delete_all_cookies()
        self.clear_local_storage()
        self.clear_session_storage()

    def inject_expired_persistent_cookie(self, token_value: str):
        expired_cookie = {
            "name": PERSISTENT_COOKIE_NAME,
            "value": token_value,
            "path": "/",
            "expiry": 0,
        }
        self.driver.add_cookie(expired_cookie)

    # ── Client-Side Script Access Check ───────────────────────────────────────
    def persistent_cookie_accessible_via_js(self) -> bool:
        result = self.execute_script(
            f"return document.cookie.includes('{PERSISTENT_COOKIE_NAME}');"
        )
        return bool(result)
