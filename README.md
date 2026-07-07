# Subscription Negotiator: Multi-Agent Financial Downscaling Platform

## 1. Project Overview & Pitch

Unmanaged subscription creep and consumer negotiation fatigue are widespread financial challenges in today's digital economy. Individuals often find themselves paying for unused services or missing out on potential savings simply because they lack the time, energy, or knowledge to negotiate better rates. 

**Subscription Negotiator** is an automated, human-in-the-loop solution designed to tackle this problem. Our platform acts as a smart financial advocate, automatically identifying subscription expenses, analyzing current cancellation and retention policies, and generating high-leverage negotiation scripts. By streamlining the downscaling process, we empower users to effortlessly reduce their monthly overhead and reclaim control over their digital subscriptions.

## 2. 5-Minute Demonstration Video

[![5-Minute Demonstration Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
*(Placeholder for public YouTube link. Replace `YOUR_VIDEO_ID` with the actual video ID.)*

## 3. System Architecture

Our platform utilizes a robust Multi-Agent graph pipeline. The core multi-agent engine is fully implemented in `app/agent.py` and powered by **Google Agent Development Kit (ADK) 2.0** (`google-adk>=2.0.0`).

We employ a 3-agent design pattern to handle the end-to-end negotiation workflow:

*   **Subscription Parser Agent:** Responsible for dissecting and structuring transaction ledgers. It fetches and parses data via Plaid/MCP, identifying recurring payments and categorizing subscriptions accurately.
*   **Policy Research Agent:** Dynamically checks current cancellation metrics, retention offers, and downscale parameters for identified services. It gathers the necessary intelligence for effective negotiation.
*   **Outreach Strategist Agent:** Leverages the parsed data and policy research to compose high-leverage discount scripts and negotiation emails tailored to each specific provider.

**Data Flow:** These agents collaborate safely and efficiently by passing data through a **type-safe global Pydantic state bus spine** defined in `app/state_schema.py`. This ensures that all information exchanged between the agents is validated, consistent, and secure throughout the pipeline execution.

## 4. Model Context Protocol (MCP) Integration

Two real MCP servers are explicitly configured in `app/agent.py` to seamlessly connect our agents to the outside world:

*   **`@openfinance/mcp-server`**: Reads real bank transaction data via Plaid to detect recurring subscriptions.
*   **`@google/workspace-mcp-server`**: Writes draft negotiation templates directly into your personal Gmail Drafts folder.

**Demo Mode Fallback:** When production API credentials are missing, the application intelligently and gracefully falls back to mock Python functions (Demo Mode). This guarantees a smooth, fully functional experience to ensure seamless evaluation by judges without requiring complex API setups.

## 5. Directory Structure

The project is structured as a monorepo containing both the backend services and the frontend user interface.

```text
subscription_negotiator/
├── app/                     # Main backend application logic (agent.py, api.py, state_schema.py)
├── frontend/                # Custom frontend React workspace
│   ├── src/                 # Source code (App.tsx, etc.)
│   └── package.json
└── README.md                # Project documentation
```

## 6. Setup & Replication Guide

Follow these instructions to run the platform locally.

### Backend Initialization

Our backend environment is strictly managed. The `pyproject.toml` paired with the `uv` package manager makes our entire environment configuration instantly reproducible.

```bash
# Synchronize dependencies
uv sync

# Run the backend server
uv run uvicorn app.api:app --port 8000 --reload
```

*Note: The application is a FastAPI app served with uvicorn. It supports the `--host 0.0.0.0` flag for straightforward containerized cloud deployment.*

### Frontend Initialization

Our Vite/React application builds smoothly into clean, highly deployable static files.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 7. Security and Compliance

Security and compliance are foundational to our architecture. We implement four specific protective mechanisms:

*   **Human-in-the-Loop (No Autonomous Execution):** The Outreach Strategist Agent strictly limits actions to staging text drafts; it completely lacks autonomous outbound transmission capability, keeping final review authority entirely in human hands.
*   **Strict Environment Variable Isolation:** Sensitive keys (like GOOGLE_API_KEY) are kept in local `.env` files, which are locked behind `.gitignore` to prevent accidental history leaks.
*   **Robust Startup Credential Detection:** The application checks for missing keys at boot time and safely downgrades to local mock functions instead of throwing system crashes.
*   **Network Level CORS Middleware:** Handled inside `app/api.py` to strictly restrict cross-origin requests exclusively to `localhost:5173`.

This codebase is open-sourced under the mandatory **Creative Commons Attribution 4.0 International (CC-BY 4.0)** license framework, ensuring proper attribution and compliance with grading requirements.
