import os
from dotenv import load_dotenv
from google.adk import Agent, Workflow
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
from .tools.mock_tools import get_mock_subscriptions, create_gmail_draft

# Force load environment variables from the .env file
load_dotenv()

# ─── Credential Detection ──────────────────────────────────────────────────────

_GOOGLE_API_KEY    = os.getenv("GOOGLE_API_KEY", "").strip()
_PLAID_CLIENT_ID   = os.getenv("PLAID_CLIENT_ID", "").strip()
_PLAID_SECRET      = os.getenv("PLAID_SECRET", "").strip()
_WORKSPACE_JSON    = os.getenv("WORKSPACE_JSON_KEY", "").strip()

_USE_MOCK_OPENFINANCE = not (_PLAID_CLIENT_ID and _PLAID_SECRET)
_USE_MOCK_WORKSPACE   = not bool(_WORKSPACE_JSON)

# Startup banner
print("\n" + "=" * 60)
print("  🤖 SUBSCRIPTION NEGOTIATOR — AGENT LOADING")
print("=" * 60)
print(f"  Gemini API key   : {'✅ Set' if _GOOGLE_API_KEY else '❌ Missing — agents will fail at inference'}")
print(f"  Plaid keys       : {'✅ Set' if not _USE_MOCK_OPENFINANCE else '⚠️  Missing — using mock subscription data'}")
print(f"  Workspace key    : {'✅ Set' if not _USE_MOCK_WORKSPACE else '⚠️  Missing — using mock Gmail draft tool'}")

if not _GOOGLE_API_KEY:
    print()
    print("  ⚠️  No GOOGLE_API_KEY found.")
    print("  ▶  For a full offline demo run:")
    print("       uv run python -m app.demo_runner")

print("=" * 60 + "\n")

# ─── Tool Configuration ───────────────────────────────────────────────────────

_NPX_COMMAND = "npx.cmd" if os.name == "nt" else "npx"

# OpenFinance: real MCP server OR mock Python function
if _USE_MOCK_OPENFINANCE:
    openfinance_tools = [get_mock_subscriptions]
else:
    openfinance_tools = [MCPToolset(
        connection_params=StdioServerParameters(
            command=_NPX_COMMAND,
            args=["-y", "@openfinance/mcp-server"]
        )
    )]

# Google Workspace: real MCP server OR mock Python function
if _USE_MOCK_WORKSPACE:
    workspace_tools = [create_gmail_draft]
else:
    workspace_tools = [MCPToolset(
        connection_params=StdioServerParameters(
            command=_NPX_COMMAND,
            args=["-y", "@google/workspace-mcp-server"]
        )
    )]

# ─── Agent Instruction Addenda ────────────────────────────────────────────────

_parser_note = (
    "\n\nNOTE — MOCK MODE: Plaid is not configured. "
    "Call the 'get_mock_subscriptions' tool to retrieve hardcoded subscription data. "
    "Parse the returned JSON and populate the 'subscriptions' list accordingly."
    if _USE_MOCK_OPENFINANCE else ""
)

_strategist_note = (
    "\n\nNOTE — MOCK MODE: Google Workspace is not configured. "
    "Use the 'create_gmail_draft' tool to stage draft emails locally instead of the Workspace MCP server. "
    "Provide recipient (vendor support email), subject, and body as arguments."
    if _USE_MOCK_WORKSPACE else ""
)

# ─── Agent Definitions ─────────────────────────────────────────────────────────

# 1. Subscription Parser Agent
subscription_parser_agent = Agent(
    name="Subscription_Parser_Agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are a financial parser agent. Retrieve subscription data using available tools "
        "and store it in the session state by outputting a JSON object.\n\n"
        "CRITICAL:\n"
        "Output ONLY a raw JSON object. "
        "DO NOT use markdown formatting blocks (do NOT use ```json ... ```).\n"
        "Do NOT output conversational intros or explanations.\n\n"
        "Your JSON must contain these two keys:\n"
        "1) 'subscriptions': a list of objects, each with keys: 'vendor' (str), 'monthly_cost' (float), 'cadence' (str), 'last_billing_date' (str).\n"
        "2) 'execution_status': 'analyzing'\n\n"
        "Example output:\n"
        "{\n"
        '    "subscriptions": [\n'
        '        {"vendor": "Netflix", "monthly_cost": 15.99, "cadence": "monthly", "last_billing_date": "2026-06-01"},\n'
        '        {"vendor": "Spotify", "monthly_cost": 9.99, "cadence": "monthly", "last_billing_date": "2026-06-10"}\n'
        "    ],\n"
        '    "execution_status": "analyzing"\n'
        "}"
        + _parser_note
    ),
    tools=openfinance_tools,
)

# 2. Policy Research Agent
policy_research_agent = Agent(
    name="Policy_Research_Agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are a policy researcher agent. Use your internal knowledge about Netflix, "
        "Adobe Creative Cloud, and Spotify to find their cancellation terms, retention offers, "
        "and support email addresses.\n\n"
        "Store results by outputting a JSON object containing the 'vendor_policies' key.\n\n"
        "CRITICAL:\n"
        "Output ONLY a raw JSON object. "
        "DO NOT wrap your output in markdown code blocks like ```json ... ```.\n"
        "DO NOT include conversational text, notes, or introductions.\n\n"
        "COPY THIS EXACT JSON STRUCTURE — replace only the string values with accurate information:\n"
        "{\n"
        '    "vendor_policies": {\n'
        '        "Netflix": {\n'
        '            "cancel_terms": "Cancel anytime, no exit fees.",\n'
        '            "retention_offers": ["20% loyalty discount for 2+ year subscribers", "1-month free pause"],\n'
        '            "support_email": "support@netflix.com"\n'
        "        },\n"
        '        "Adobe Creative Cloud": {\n'
        '            "cancel_terms": "Annual plan: 50% early termination fee. Monthly: cancel anytime.",\n'
        '            "retention_offers": ["Student pricing at $19.99/mo", "Annual prepaid at $29.99/mo"],\n'
        '            "support_email": "support@adobe.com"\n'
        "        },\n"
        '        "Spotify": {\n'
        '            "cancel_terms": "Cancel anytime. No refunds for partial billing periods.",\n'
        '            "retention_offers": ["Family plan for $15.99/mo", "3 months free on annual switch"],\n'
        '            "support_email": "support@spotify.com"\n'
        "        }\n"
        "    },\n"
        '    "execution_status": "negotiating"\n'
        "}"
    ),
    tools=[],
)

# 3. Outreach Strategist Agent
outreach_strategist_agent = Agent(
    name="Outreach_Strategist_Agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are a negotiation strategist agent. Your job has 3 steps.\n\n"
        "CRITICAL:\n"
        "You must output ONLY a valid JSON object. "
        "DO NOT use markdown formatting blocks (do NOT use ```json ... ```).\n"
        "Do NOT output conversational intros or explanations.\n\n"
        "STEP 1 — Output a JSON object with 'negotiation_strategies' and 'execution_status' keys:\n"
        "{\n"
        '    "negotiation_strategies": {\n'
        '        "Netflix": {\n'
        '            "target_price": 12.79,\n'
        '            "leverage_points": ["Disney+ at $10.99/mo", "3+ years loyalty", "Price raised 3x"],\n'
        '            "draft_email_body": "Dear Netflix Support, I have been a loyal subscriber for over 3 years..."\n'
        "        },\n"
        '        "Adobe Creative Cloud": {\n'
        '            "target_price": 34.99,\n'
        '            "leverage_points": ["Canva Pro at $12.99/mo", "Figma at $12/mo"],\n'
        '            "draft_email_body": "Dear Adobe Support, I am reviewing my Creative Cloud subscription..."\n'
        "        },\n"
        '        "Spotify": {\n'
        '            "target_price": 7.99,\n'
        '            "leverage_points": ["YouTube Music free with Premium", "Apple Music same price"],\n'
        '            "draft_email_body": "Dear Spotify Support, I am a long-time subscriber considering alternatives..."\n'
        "        }\n"
        "    },\n"
        '    "execution_status": "completed"\n'
        "}\n\n"
        "STEP 2 — Use your available function calling tools to call create_gmail_draft THREE times, once per vendor. "
        "The tool accepts EXACTLY these three parameters:\n"
        "  - recipient: str  (the vendor support email)\n"
        "  - subject: str    (the email subject line)\n"
        "  - body: str       (the full email body)\n\n"
        "NEVER call create_gmail_draft with any other parameter names.\n"
        "NEVER call any email sending tool — only create_gmail_draft for drafts only.\n\n"
        "STEP 3 — Ensure your JSON output contains exactly the structure requested above."
        + _strategist_note
    ),
    tools=workspace_tools,
)

# ─── Workflow ─────────────────────────────────────────────────────────────────

# Configure the sequential multi-agent workflow matching your runtime design.
# NOTE: state_schema is intentionally omitted — ADK LLM agents write plain
# JSON-serialisable dicts to state. Pydantic state_schema causes the LLM to
# attempt class definitions in generated code blocks, which ADK rejects.
subscription_negotiator_workflow = Workflow(
    name="Subscription_Negotiator_Workflow",
    edges=[
        ("START", subscription_parser_agent),
        (subscription_parser_agent, policy_research_agent),
        (policy_research_agent, outreach_strategist_agent)
    ]
)


# This exposes the workflow layout specifically for the 'adk web' command line interface
agent = subscription_negotiator_workflow
root_agent = subscription_negotiator_workflow