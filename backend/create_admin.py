"""Provision an administrator with an interactive password prompt."""
import argparse
from getpass import getpass

from backend.database import create_user, init_db
from backend.main import hash_password


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("email")
    parser.add_argument("--name", default="Administrator")
    args = parser.parse_args()
    email = args.email.strip().lower()
    if "@" not in email:
        parser.error("Enter an email address")
    password = getpass("Administrator password: ")
    if len(password) < 12 or password != getpass("Repeat password: "):
        parser.error("Use matching passwords of at least 12 characters")
    init_db()
    create_user(email, hash_password(password), role="admin", full_name=args.name, email=email)
    print(f"Administrator {email} created.")


if __name__ == "__main__":
    main()
