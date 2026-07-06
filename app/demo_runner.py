"""
Full offline demo runner — simulates the complete Subscription Negotiator
workflow using 100% mock/hardcoded data. No API keys required.

Usage:
    uv run python -m app.demo_runner
    python -m app.demo_runner
"""
import time
from datetime import date
from typing import TypedDict


# ─── TypedDict Schemas ─────────────────────────────────────────────────────────

class MockSubscription(TypedDict):
    vendor: str
    monthly_cost: float
    cadence: str
    last_billing_date: str


class MockPolicy(TypedDict):
    retention_offers: list[str]
    cancel_terms: str
    support_email: str


class MockStrategy(TypedDict):
    target_price: float
    leverage_points: list[str]
    draft_email: str


# ─── Mock Data ──────────────────────────────────────────────────────────────────

MOCK_SUBSCRIPTIONS: list[MockSubscription] = [
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
    },
]

MOCK_VENDOR_POLICIES: dict[str, MockPolicy] = {
    "Netflix": {
        "retention_offers": [
            "20% loyalty discount for subscribers over 2 years",
            "1-month free pause (no charge)"
        ],
        "cancel_terms": "Cancel anytime. No long-term contracts or exit fees.",
        "support_email": "support@netflix.com"
    },
    "Adobe Creative Cloud": {
        "retention_offers": [
            "Education/student pricing at $19.99/month",
            "Annual prepaid plan at $29.99/month (down from $54.99)"
        ],
        "cancel_terms": "Annual plan: 50% early termination fee. Monthly plan: cancel anytime.",
        "support_email": "support@adobe.com"
    },
    "Spotify": {
        "retention_offers": [
            "Family plan for $15.99/month covering up to 6 accounts",
            "3 months free trial on switch to annual plan"
        ],
        "cancel_terms": "Cancel anytime. No refunds for partial billing periods.",
        "support_email": "support@spotify.com"
    },
}

MOCK_STRATEGIES: dict[str, MockStrategy] = {
    "Netflix": {
        "target_price": 12.79,
        "leverage_points": [
            "Disney+ offers comparable streaming at $10.99/month",
            "Subscriber loyalty of 3+ years",
            "Price increased 3 times in last 2 years"
        ],
        "draft_email": (
            "Subject: Request for Loyalty Discount — Long-Term Subscriber\n\n"
            "Hi Netflix Support Team,\n\n"
            "I have been a loyal Netflix subscriber for over 3 years and greatly enjoy your content library. "
            "However, with recent price increases and comparable alternatives like Disney+ at $10.99/month, "
            "I am reassessing my subscription expenses.\n\n"
            "I would love to continue with Netflix. Could you offer a loyalty discount or a promotional "
            "rate to help me stay subscribed?\n\n"
            "Thank you for your time and consideration.\n\nBest regards"
        ),
    },
    "Adobe Creative Cloud": {
        "target_price": 29.99,
        "leverage_points": [
            "Canva Pro: $12.99/month with similar design tools",
            "Affinity Suite: one-time $169 purchase (no subscription)",
            "Figma: $12/month for professional use"
        ],
        "draft_email": (
            "Subject: Pricing Review — Exploring Cost-Effective Subscription Options\n\n"
            "Hi Adobe Support Team,\n\n"
            "I am currently subscribed to Adobe Creative Cloud at $54.99/month. While I rely on Adobe's "
            "tools for my workflow, alternatives like Canva Pro ($12.99/month), Figma ($12/month), and "
            "the Affinity Suite (one-time purchase) are becoming difficult to ignore.\n\n"
            "Could you offer a reduced rate, switch me to annual pricing at a discount, or apply any "
            "promotional offer to make continuing my subscription more feasible?\n\n"
            "Thank you.\n\nBest regards"
        ),
    },
    "Spotify": {
        "target_price": 9.99,
        "leverage_points": [
            "YouTube Music included free with YouTube Premium ($13.99/month)",
            "Apple Music offers lossless audio at the same price",
            "Amazon Music included with Prime membership"
        ],
        "draft_email": (
            "Subject: Subscription Review — Exploring Retention Options\n\n"
            "Hi Spotify Team,\n\n"
            "I am a long-time Spotify subscriber, but I am reviewing all of my recurring expenses. "
            "Services like YouTube Music are now bundled with YouTube Premium, and Apple Music offers "
            "lossless audio at the same price point.\n\n"
            "Could you offer a loyalty discount, a promotional rate, or an extended trial on the "
            "Spotify Family Plan to help me continue my subscription?\n\n"
            "Thank you.\n\nBest regards"
        ),
    },
}


# ─── Display Helpers ─────────────────────────────────────────────────────────────

def _header(title: str):
    bar = "━" * 70
    print(f"\n{bar}")
    print(f"  {title}")
    print(f"{bar}")


def _step(label: str, delay: float = 0.5):
    print(f"  ⏳ {label}...", end="", flush=True)
    time.sleep(delay)
    print(" ✓")


# ─── Simulated Agent Runs ────────────────────────────────────────────────────────

def run_subscription_parser() -> list:
    _header("🔍  AGENT 1 — Subscription Parser Agent  [MOCK MODE]")
    _step("Connecting to OpenFinance MCP server (mock)")
    _step("Querying linked bank account transaction history")
    _step("Identifying recurring subscription charges")
    _step("Normalising billing cadences to monthly rate")

    total = sum(s["monthly_cost"] for s in MOCK_SUBSCRIPTIONS)
    print(f"\n  📋 Active Subscriptions Found: {len(MOCK_SUBSCRIPTIONS)}\n")
    for s in MOCK_SUBSCRIPTIONS:
        print(f"     • {s['vendor']:<30} ${s['monthly_cost']:>6.2f}/month   (last billed: {s['last_billing_date']})")
    print(f"\n  💰 Total Monthly Spend : ${total:.2f}")
    print(f"  💸 Total Annual Spend  : ${total * 12:.2f}")
    print(f"\n  📌 Execution Status → ANALYZING")
    return MOCK_SUBSCRIPTIONS


def run_policy_research(subscriptions: list) -> dict:
    _header("📋  AGENT 2 — Policy Research Agent  [MOCK MODE]")
    _step("Looking up cancellation policies for each vendor")
    _step("Fetching known retention offers and discount programmes")
    _step("Compiling vendor support contact details")

    print(f"\n  📖 Vendor Policies Retrieved:\n")
    for vendor, policy in MOCK_VENDOR_POLICIES.items():
        print(f"     ┌── {vendor} {'─' * max(0, 52 - len(vendor))}")
        print(f"     │  Cancel Terms  : {policy['cancel_terms']}")
        print(f"     │  Retention     : {' | '.join(policy['retention_offers'])}")
        print(f"     │  Support Email : {policy['support_email']}")
        print(f"     └{'─' * 60}")

    print(f"\n  📌 Execution Status → NEGOTIATING")
    return MOCK_VENDOR_POLICIES


def run_outreach_strategist(subscriptions: list, policies: dict) -> dict:
    _header("✉️   AGENT 3 — Outreach Strategist Agent  [MOCK MODE]")
    _step("Analysing subscription value vs. market alternatives")
    _step("Identifying leverage points per vendor")
    _step("Drafting persuasive negotiation emails")
    _step("Staging emails in Gmail Drafts folder (mock)")

    print(f"\n  📨 Draft Emails Staged:\n")
    for vendor, strategy in MOCK_STRATEGIES.items():
        sub = next(s for s in subscriptions if s["vendor"] == vendor)
        saving = sub["monthly_cost"] - strategy["target_price"]
        print(f"     ┌── {vendor} {'─' * max(0, 52 - len(vendor))}")
        print(f"     │  Current   : ${sub['monthly_cost']:.2f}/month")
        print(f"     │  Target    : ${strategy['target_price']:.2f}/month  (save ${saving:.2f}/month)")
        print(f"     │  Leverage  :")
        for pt in strategy["leverage_points"]:
            print(f"     │    – {pt}")
        print(f"     │  Draft     : ✅ Staged in Gmail Drafts")
        print(f"     └{'─' * 60}")

    print(f"\n  📌 Execution Status → COMPLETED")
    return MOCK_STRATEGIES


def print_summary(subscriptions: list, strategies: dict):
    _header("📊  WORKFLOW COMPLETE — SUMMARY")

    total_current = sum(s["monthly_cost"] for s in subscriptions)
    total_target = sum(v["target_price"] for v in strategies.values())
    monthly_saving = total_current - total_target
    annual_saving = monthly_saving * 12

    print(f"\n  Subscriptions analysed   : {len(subscriptions)}")
    print(f"  Current monthly spend    : ${total_current:.2f}")
    print(f"  Target monthly spend     : ${total_target:.2f}")
    print(f"  Potential monthly saving : ${monthly_saving:.2f}")
    print(f"  Potential annual saving  : ${annual_saving:.2f}")
    print(f"\n  ✅  {len(strategies)} draft email(s) staged in Gmail Drafts (mock)")
    print()
    print("  ─────────────────────────────────────────────────────────────────")
    print("  ⚠️   NOTE: This was a FULL MOCK / OFFLINE RUN.")
    print("       No real API calls were made to Gemini, Plaid, or Google.")
    print()
    print("  ▶  To run the live agent, add your GOOGLE_API_KEY to .env and run:")
    print("       uv run adk web app/")
    print("  ─────────────────────────────────────────────────────────────────\n")


# ─── Entry Point ─────────────────────────────────────────────────────────────────

def main():
    print("\n" + "=" * 70)
    print("  🤖  SUBSCRIPTION NEGOTIATOR — OFFLINE DEMO MODE")
    print("  All .env keys are empty → running with 100% mock data")
    print("=" * 70)

    subs = run_subscription_parser()
    policies = run_policy_research(subs)
    strategies = run_outreach_strategist(subs, policies)
    print_summary(subs, strategies)


if __name__ == "__main__":
    main()
