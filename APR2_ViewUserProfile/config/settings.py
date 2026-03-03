BASE_URL = "https://your-app-domain.com"
DEFAULT_TIMEOUT = 10

PROFILE_URL = f"{BASE_URL}/profile"
LOGIN_URL = f"{BASE_URL}/login"

USERS = {
    "default": {"username": "default_user", "password": "default_pass"},
    "Alice":   {"username": "alice",         "password": "alice_pass"},
    "Bob":     {"username": "bob",           "password": "bob_pass"},
    "user1":   {"username": "user1",         "password": "user1_pass"},
    "user2":   {"username": "user2",         "password": "user2_pass"},
    "user3":   {"username": "user3",         "password": "user3_pass"},
}

PLACEHOLDER_FULL_NAME  = "N/A"
PLACEHOLDER_EMAIL      = "N/A"
SESSION_TIMEOUT_COOKIE = "session_token"
