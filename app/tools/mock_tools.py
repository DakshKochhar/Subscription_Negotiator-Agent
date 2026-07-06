"""
Mock tools for local testing when real API credentials are not configured.
These functions simulate the behavior of external MCP servers (OpenFinance, Google Workspace).
"""
import json
from datetime import date


def get_mock_subscriptions() -> str:
    """
    Returns hardcoded mock subscription data simulating an OpenFinance / Plaid response.
    Call this tool to retrieve subscription data when Plaid credentials are not configured.
    Parse the returned JSON and populate the subscriptions list accordingly.
    """
    data = {
        "subscriptions": [
            {
                "vendor": "Netflix",
                "monthly_cost": 15.99,
                "cadence": "monthly",
                "last_billing_date": str(date.today().replace(day=1))
            },
            {
                "vendor": "Adobe Creative Cloud",
                "monthly_cost": 54.99,
                "cadence": "monthly",
                "last_billing_date": str(date.today().replace(day=5))
            },
            {
                "vendor": "Spotify",
                "monthly_cost": 9.99,
                "cadence": "monthly",
                "last_billing_date": str(date.today().replace(day=10))
            }
        ],
        "source": "MOCK DATA — Plaid credentials not configured"
    }
    return json.dumps(data, indent=2)


def create_gmail_draft(recipient: str, subject: str, body: str) -> str:
    """
    Simulates creating a Gmail draft email in the user's Drafts folder.
    Use this tool to stage negotiation emails when Google Workspace credentials are not configured.

    Args:
        recipient: The vendor support email address to send the draft to.
        subject: The subject line of the negotiation email.
        body: The full body content of the drafted email.

    Returns:
        A confirmation string with the staged draft details.
    """
    separator = "=" * 70
    print(f"\n{separator}")
    print("📧  [MOCK GMAIL DRAFT STAGED]")
    print(f"    To      : {recipient}")
    print(f"    Subject : {subject}")
    print(f"    Body    :\n")
    for line in body.split("\n"):
        print(f"        {line}")
    print(f"{separator}\n")

    return (
        f"✅ Mock draft successfully staged!\n"
        f"   To: {recipient}\n"
        f"   Subject: '{subject}'\n"
        f"   (Note: This is a simulation — Google Workspace credentials are not configured. "
        f"In production, this email would be saved to your Gmail Drafts folder.)"
    )
