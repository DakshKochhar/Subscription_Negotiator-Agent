// ── API Types ─────────────────────────────────────────────────────────────

export interface Subscription {
  vendor: string
  monthly_cost: number
  cadence: string
  last_billing_date: string
}

export interface VendorPolicy {
  cancel_terms: string
  retention_offers: string[]
  support_email: string
}

export interface NegotiationStrategy {
  target_price: number
  leverage_points: string[]
  draft_email_body: string
}

export interface NegotiateResponse {
  session_id: string
  subscriptions: Subscription[]
  vendor_policies: Record<string, VendorPolicy>
  negotiation_strategies: Record<string, NegotiationStrategy>
  execution_status: string
  total_monthly_cost: number
  total_target_cost: number
  potential_monthly_savings: number
  is_mock_fallback: boolean
}

// ── API Client ────────────────────────────────────────────────────────────

export async function runNegotiation(
  userInput: string = 'Analyze my subscriptions and negotiate better deals',
  useMock: boolean = false,
): Promise<NegotiateResponse> {
  const res = await fetch('/api/negotiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_input: userInput, use_mock: useMock }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health')
    return res.ok
  } catch {
    return false
  }
}

export interface KeyStatus {
  GOOGLE_API_KEY: boolean
  WORKSPACE_JSON_KEY: boolean
  PLAID_CLIENT_ID: boolean
  PLAID_SECRET: boolean
}

export async function checkKeyStatus(): Promise<KeyStatus | null> {
  try {
    const res = await fetch('/api/key-status')
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
