"""Create an administrator or reset an existing administrator's password."""
import argparse
import os
from getpass import getpass


def reset_admin_password(username: str, password: str) -> bool:
    from backend.database import SessionLocal, User
    from backend.main import hash_password

    if len(password) < 12:
        raise ValueError("Use at least 12 characters")
    hashed = hash_password(password)
    with SessionLocal.begin() as db:
        changed = db.query(User).filter_by(username=username, role="admin").update({
            "hashed_password": hashed,
            "must_change_password": "0",
        })
    return changed == 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("account", help="New account email or existing admin username")
    parser.add_argument("--name", default="Administrator")
    parser.add_argument("--reset-password", action="store_true", help="Reset an existing admin by username")
    parser.add_argument("--prompt-database-url", action="store_true", help="Prompt for the production PostgreSQL URL without echoing it")
    args = parser.parse_args()
    account = args.account.strip()
    if not args.reset_password and "@" not in account:
        parser.error("Enter an email address")
    if args.prompt_database_url:
        from sqlalchemy.engine import make_url
        from sqlalchemy.exc import ArgumentError, NoSuchModuleError

        url = getpass("Paste the Neon DATABASE_URL used by Render (hidden): ").strip().strip("'\"")
        try:
            parsed_url = make_url(url)
            is_postgres = parsed_url.get_backend_name() in {"postgres", "postgresql"} and parsed_url.host and parsed_url.database
        except (ArgumentError, NoSuchModuleError, ValueError):
            is_postgres = False
        if not is_postgres:
            parser.error("Enter the full PostgreSQL connection URL, starting with postgresql:// or postgres://")
        os.environ["APP_ENV"] = "production"
        os.environ["DATABASE_URL"] = url
    password = getpass("Administrator password: ")
    if len(password) < 12 or password != getpass("Repeat password: "):
        parser.error("Use matching passwords of at least 12 characters")
    if args.reset_password:
        if not reset_admin_password(account, password):
            parser.error("No administrator with that username in the configured database")
        print(f"Password updated for administrator {account}.")
        return
    from backend.database import create_user, init_db
    from backend.main import hash_password

    init_db()
    email = account.lower()
    try:
        create_user(email, hash_password(password), role="admin", full_name=args.name, email=email)
    except ValueError as exc:
        parser.error(f"Could not create administrator ({exc}). Use --reset-password for an existing administrator.")
    print(f"Administrator {email} created.")


if __name__ == "__main__":
    main()
