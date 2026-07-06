# Subscription Negotiator: Multi-Agent Financial Downscaling Platform

## 1. Project Overview & Pitch

Unmanaged subscription creep and consumer negotiation fatigue are widespread financial challenges in today's digital economy. Individuals often find themselves paying for unused services or missing out on potential savings simply because they lack the time, energy, or knowledge to negotiate better rates. 

**Subscription Negotiator** is an automated, human-in-the-loop solution designed to tackle this problem. Our platform acts as a smart financial advocate, automatically identifying subscription expenses, analyzing current cancellation and retention policies, and generating high-leverage negotiation scripts. By streamlining the downscaling process, we empower users to effortlessly reduce their monthly overhead and reclaim control over their digital subscriptions.

## 2. 5-Minute Demonstration Video

[![5-Minute Demonstration Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
*(Placeholder for public YouTube link. Replace `YOUR_VIDEO_ID` with the actual video ID.)*

## 3. System Architecture

Our platform utilizes a robust Multi-Agent graph pipeline built with the **Google Agent Development Kit (ADK)** and the **Model Context Protocol (MCP)**. This architecture ensures specialized processing, scalability, and seamless data flow.

We employ a 3-agent design pattern to handle the end-to-end negotiation workflow:

*   **Subscription Parser Agent:** Responsible for dissecting and structuring localized transaction ledgers (e.g., from `data/local_ledger.json`). It identifies recurring payments and categorizes subscriptions accurately.
*   **Policy Research Agent:** Dynamically checks current cancellation metrics, retention offers, and downscale parameters for identified services. It gathers the necessary intelligence for effective negotiation.
*   **Outreach Strategist Agent:** Leverages the parsed data and policy research to compose high-leverage discount scripts and negotiation emails tailored to each specific provider.

**Data Flow:** These agents collaborate safely and efficiently by passing data through a **type-safe global Pydantic state bus spine**. This ensures that all information exchanged between the agents is validated, consistent, and secure throughout the pipeline execution.

## 4. Directory Structure

The project is structured as a monorepo containing both the backend services and the frontend user interface.

```text
subscription_negotiator/
├── backend/
│   ├── app/                 # Main application logic and agent definitions
│   └── data/                # Local data storage (e.g., local_ledger.json)
├── frontend/                # Custom frontend workspace
│   ├── src/                 # Source code (App.tsx, etc.)
│   └── package.json
└── README.md                # Project documentation
```

## 5. Setup & Replication Guide

Follow these instructions to run the platform locally.

### Backend Initialization

The backend requires `uv` for dependency management and running the ADK application.

```bash
# Navigate to the backend directory
cd backend

# Synchronize dependencies
uv sync

# Run the ADK web application
uv run adk web app/
```

### Frontend Initialization

The frontend is a standard Node.js application.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 6. Security and Compliance

Security and compliance are foundational to our architecture.

*   **Credential Security:** All production credentials, API keys, and sensitive configuration variables are securely isolated via environment configurations (`.env` files) and are never committed to the version control system.
*   **Open Source License:** This codebase is open-sourced under the mandatory **Creative Commons Attribution 4.0 International (CC-BY 4.0)** license framework, ensuring proper attribution and compliance with grading requirements.
