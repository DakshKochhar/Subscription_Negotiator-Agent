"""
FastAPI backend for the Subscription Negotiator.
Wraps the ADK multi-agent workflow and exposes it via REST API.

Usage:
    uv run uvicorn app.api:app --host 0.0.0.0 --port 8000 --reload
"""
import json
import time
import uuid
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

load_dotenv()

# ─── ADK Imports ─────────────────────────────────────────────────────────────

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.agents.run_config import RunConfig
from google.genai.types import Content, Part

from .agent import subscription_negotiator_workflow
from .demo_runner import (
    MOCK_SUBSCRIPTIONS,
    MOCK_VENDOR_POLICIES,
    MOCK_STRATEGIES,
)

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Subscription Negotiator API",
    description="AI-powered subscription analysis and negotiation workflow",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ──────────────────────────────────────────────────────────────────

class NegotiateRequest(BaseModel):
    user_input: str = "Analyze my subscriptions and negotiate better deals"
    use_mock: bool = False


class NegotiateResponse(BaseModel):
    session_id: str
    subscriptions: list
    vendor_policies: dict
    negotiation_strategies: dict
    execution_status: str
    total_monthly_cost: float
    total_target_cost: float
    potential_monthly_savings: float
    is_mock_fallback: bool = False   # True when live workflow returned empty state


# ─── Session Service ─────────────────────────────────────────────────────────

_session_service = InMemorySessionService()
APP_NAME = "subscription_negotiator"


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _get_mock_state() -> dict:
    """Build the canonical mock state dict from demo_runner data."""
    mock_strategies = {
        vendor: {
            "target_price": s["target_price"],
            "leverage_points": s["leverage_points"],
            "draft_email_body": s["draft_email"],
        }
        for vendor, s in MOCK_STRATEGIES.items()
    }
    return {
        "subscriptions": list(MOCK_SUBSCRIPTIONS),
        "vendor_policies": dict(MOCK_VENDOR_POLICIES),
        "negotiation_strategies": mock_strategies,
        "execution_status": "completed",
    }


def _build_response_from_state(
    session_id: str,
    state: dict,
    is_mock_fallback: bool = False,
) -> NegotiateResponse:
    subscriptions = state.get("subscriptions") or []
    policies = state.get("vendor_policies") or {}
    strategies = state.get("negotiation_strategies") or {}
    status = state.get("execution_status", "completed")

    total_current = sum(s.get("monthly_cost", 0) for s in subscriptions)
    total_target = (
        sum(v.get("target_price", 0) for v in strategies.values())
        if strategies else total_current
    )

    return NegotiateResponse(
        session_id=session_id,
        subscriptions=subscriptions,
        vendor_policies=policies,
        negotiation_strategies=strategies,
        execution_status=status,
        total_monthly_cost=round(total_current, 2),
        total_target_cost=round(total_target, 2),
        potential_monthly_savings=round(total_current - total_target, 2),
        is_mock_fallback=is_mock_fallback,
    )


_DEBUG_LOG_PATH = Path(__file__).resolve().parent.parent.parent / "debug-f25879.log"


def _debug_log(location: str, message: str, data: dict, hypothesis_id: str) -> None:
    # #region agent log
    try:
        payload = {
            "sessionId": "f25879",
            "runId": "pre-fix",
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(time.time() * 1000),
        }
        with open(_DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except Exception:
        pass
    # #endregion


def _read_session_state(session) -> dict:
    """Safely read state from an ADK session object, which can be a State
    instance, a plain dict, or None."""
    if session is None:
        _debug_log("api.py:_read_session_state", "session is None", {}, "C")
        return {}
    raw = getattr(session, "state", None)
    if raw is None:
        _debug_log("api.py:_read_session_state", "session.state is None", {}, "C")
        return {}
    raw_type = type(raw).__name__
    dict_error = None
    dict_result_keys: list[str] = []
    try:
        converted = dict(raw)
        dict_result_keys = list(converted.keys())
    except Exception as exc:
        dict_error = f"{type(exc).__name__}: {exc}"

    to_dict_keys: list[str] = []
    to_dict_sub_count = 0
    if hasattr(raw, "to_dict"):
        try:
            to_dict_state = raw.to_dict()
            to_dict_keys = list(to_dict_state.keys())
            subs = to_dict_state.get("subscriptions")
            to_dict_sub_count = len(subs) if isinstance(subs, list) else 0
        except Exception as exc:
            to_dict_keys = [f"error:{type(exc).__name__}"]

    _debug_log(
        "api.py:_read_session_state",
        "state conversion probe",
        {
            "raw_type": raw_type,
            "dict_error": dict_error,
            "dict_result_keys": dict_result_keys,
            "to_dict_keys": to_dict_keys,
            "to_dict_subscriptions_count": to_dict_sub_count,
        },
        "A",
    )

    if hasattr(raw, "to_dict"):
        try:
            return raw.to_dict()
        except Exception:
            pass

    # ADK State objects expose dict-like interface; convert to plain dict
    try:
        return dict(raw)
    except Exception:
        return {}


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "Subscription Negotiator API"}


@app.post("/api/negotiate", response_model=NegotiateResponse)
async def run_negotiation(request: NegotiateRequest):
    """
    Runs the full multi-agent subscription negotiation workflow.
    Set use_mock=True to get instant results without calling the Gemini API.
    If the live workflow returns empty state, falls back to mock data automatically.
    """
    session_id = str(uuid.uuid4())

    # ── MOCK MODE ─────────────────────────────────────────────────────────────
    if request.use_mock:
        return _build_response_from_state(session_id, _get_mock_state())

    # ── LIVE MODE ─────────────────────────────────────────────────────────────
    try:
        runner = Runner(
            app_name=APP_NAME,
            node=subscription_negotiator_workflow,
            session_service=_session_service,
        )

        await _session_service.create_session(
            app_name=APP_NAME,
            user_id="api-user",
            session_id=session_id,
        )

        user_message = Content(
            role="user",
            parts=[Part(text=request.user_input)],
        )

        event_count = 0
        last_state_delta_keys: list[str] = []
        parsed_state_updates = {}
        # Drain the event stream until the workflow completes
        async for event in runner.run_async(
            user_id="api-user",
            session_id=session_id,
            new_message=user_message,
            run_config=RunConfig(),
        ):
            event_count += 1
            print(f"\n🔍 [ADK EVENT]: {event}")
            actions = getattr(event, "actions", None)
            state_delta = getattr(actions, "state_delta", None) if actions else None
            if state_delta:
                last_state_delta_keys = list(state_delta.keys())
            
            # Fallback: ADK LLM Agents without output_key/state_schema omit state_delta injection.
            # We manually parse JSON outputs from the LLM and merge them locally.
            if getattr(event, "is_final_response", lambda: False)():
                if hasattr(event, "content") and event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text and not getattr(part, "thought", False):
                            try:
                                import json
                                text_val = part.text.strip().removeprefix("```json").removesuffix("```").strip()
                                parsed = json.loads(text_val)
                                if isinstance(parsed, dict):
                                    parsed_state_updates.update(parsed)
                            except Exception:
                                pass

        _debug_log(
            "api.py:run_negotiation",
            "workflow events drained",
            {
                "app_name": APP_NAME,
                "session_id": session_id,
                "event_count": event_count,
                "last_state_delta_keys": last_state_delta_keys,
            },
            "D",
        )

        # Read final state from the session
        final_session = await _session_service.get_session(
            app_name=APP_NAME,
            user_id="api-user",
            session_id=session_id,
        )
        final_state = _read_session_state(final_session)
        final_state.update(parsed_state_updates)
        print(f"\n📊 [FINAL STATE]: {final_state}")

        _debug_log(
            "api.py:run_negotiation",
            "final state after _read_session_state",
            {
                "final_state_keys": list(final_state.keys()),
                "subscriptions_count": len(final_state.get("subscriptions") or []),
                "will_fallback": not bool(final_state.get("subscriptions")),
            },
            "A",
        )

        # If the workflow ran but returned no subscriptions, fall back to mock
        if not final_state.get("subscriptions"):
            print("⚠️ [FALLBACK]: 'subscriptions' is empty. Falling back to mock data.")
            _debug_log(
                "api.py:run_negotiation",
                "triggering mock fallback",
                {"reason": "subscriptions empty in final_state"},
                "A",
            )
            return _build_response_from_state(
                session_id, _get_mock_state(), is_mock_fallback=True
            )

        return _build_response_from_state(session_id, final_state)

    except Exception as exc:
        # Surface a descriptive error; client can retry in mock mode
        raise HTTPException(status_code=500, detail=str(exc))

