import { useState } from 'react'
import type { NegotiateResponse } from './api'
import { runNegotiation } from './api'
import './App.css'

// ── Sub-components ────────────────────────────────────────────────────────

function GeminiThinking({ step }: { step: number }) {
  const messages = [
    'Parsing your subscription data…',
    'Researching vendor cancellation policies…',
    'Drafting negotiation strategies…',
  ]
  return (
    <div className="gemini-thinking">
      <div className="gemini-orb-ring">
        <div className="gemini-orb" />
        <div className="gemini-orb" />
        <div className="gemini-orb" />
        <div className="gemini-orb" />
      </div>
      <p className="gemini-thinking-text">
        {messages[step] ?? 'AI agents at work…'}
      </p>
      <div className="gemini-shimmer-bar">
        <div className="gemini-shimmer-fill" />
      </div>
    </div>
  )
}


function AgentStep({ index, label, active, done }: { index: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`agent-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
      <div className="agent-step-icon">
        {done
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          : active
            ? <div className="spinner" style={{ width: 16, height: 16 }} />
            : <span>{index}</span>
        }
      </div>
      <span className="agent-step-label">{label}</span>
    </div>
  )
}

function SavingsSummary({ data }: { data: NegotiateResponse }) {
  const annualSaving = data.potential_monthly_savings * 12
  return (
    <div className="savings-banner animate-fade-up">
      <div className="savings-banner-inner">
        <div className="savings-stat">
          <span className="savings-label">Monthly Spend</span>
          <span className="savings-value red">${data.total_monthly_cost.toFixed(2)}</span>
        </div>
        <div className="savings-arrow">→</div>
        <div className="savings-stat">
          <span className="savings-label">Target Spend</span>
          <span className="savings-value green">${data.total_target_cost.toFixed(2)}</span>
        </div>
        <div className="savings-divider" />
        <div className="savings-highlight">
          <span className="savings-big">${annualSaving.toFixed(0)}</span>
          <span className="savings-sublabel">potential annual savings</span>
        </div>
      </div>
    </div>
  )
}

function SubscriptionCard({ sub, policy, strategy }: {
  sub: { vendor: string; monthly_cost: number; cadence: string; last_billing_date: string }
  policy?: { cancel_terms: string; retention_offers: string[]; support_email: string }
  strategy?: { target_price: number; leverage_points: string[]; draft_email_body: string }
}) {
  const [expanded, setExpanded] = useState(false)
  const saving = strategy ? sub.monthly_cost - strategy.target_price : 0

  const vendorColors: Record<string, string> = {
    Netflix: '#e50914',
    'Adobe Creative Cloud': '#fa0f00',
    Spotify: '#1db954',
  }
  const accentColor = vendorColors[sub.vendor] ?? '#7c5cfc'

  return (
    <div className="sub-card card animate-fade-up" style={{ '--vendor-color': accentColor } as React.CSSProperties}>
      <div className="sub-card-header">
        <div className="vendor-avatar" style={{ background: `${accentColor}22`, borderColor: `${accentColor}44` }}>
          <span style={{ color: accentColor }}>{sub.vendor[0]}</span>
        </div>
        <div className="sub-card-info">
          <h3>{sub.vendor}</h3>
          <p style={{ fontSize: '0.82rem', margin: 0 }}>
            {sub.cadence} · last billed {sub.last_billing_date}
          </p>
        </div>
        <div className="sub-card-cost">
          <span className="cost-current">${sub.monthly_cost.toFixed(2)}<small>/mo</small></span>
          {strategy && (
            <span className="cost-target" style={{ color: 'var(--accent-teal)' }}>
              → ${strategy.target_price.toFixed(2)}/mo
            </span>
          )}
        </div>
      </div>

      {saving > 0 && (
        <div className="saving-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          Save ${saving.toFixed(2)}/month · ${(saving * 12).toFixed(0)}/year
        </div>
      )}

      {policy && (
        <div className="sub-card-policy">
          <div className="policy-row">
            <span className="policy-label">Cancel Terms</span>
            <span className="policy-value">{policy.cancel_terms}</span>
          </div>
          {policy.retention_offers.length > 0 && (
            <div className="policy-row">
              <span className="policy-label">Retention Offers</span>
              <ul className="policy-offers">
                {policy.retention_offers.map((offer, i) => (
                  <li key={i}>✦ {offer}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {strategy && (
        <>
          <div className="divider" style={{ margin: '12px 0' }} />
          <div className="leverage-section">
            <span className="policy-label">Leverage Points</span>
            <ul className="leverage-list">
              {strategy.leverage_points.map((pt, i) => (
                <li key={i}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          <button className="btn btn-secondary draft-toggle" onClick={() => setExpanded(!expanded)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {expanded ? 'Hide Draft Email' : 'View Draft Email'}
          </button>

          {expanded && (
            <div className="draft-email-block">
              <pre>{strategy.draft_email_body}</pre>
              <button className="btn btn-secondary copy-btn" onClick={() => navigator.clipboard.writeText(strategy!.draft_email_body)}>
                Copy Email
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────

type AppState = 'idle' | 'loading' | 'done' | 'error'

const AGENT_STEPS = [
  'Subscription Parser Agent',
  'Policy Research Agent',
  'Outreach Strategist Agent',
]

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [result, setResult] = useState<NegotiateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(-1)

  const handleAnalyze = async (useMock: boolean) => {
    setAppState('loading')
    setResult(null)
    setError(null)
    setActiveStep(0)

    // Minimum animation duration: 3 s for demo, 5 s for live
    const minDelay = useMock ? 3000 : 5000
    const stepInterval = useMock ? 900 : 12000

    // Simulate step progression visually while waiting for the API
    const stepTimer = setInterval(() => {
      setActiveStep(prev => {
        if (prev < AGENT_STEPS.length - 1) return prev + 1
        clearInterval(stepTimer)
        return prev
      })
    }, stepInterval)

    // Run the API call AND a minimum timer in parallel — wait for both
    const [data] = await Promise.all([
      runNegotiation(
        'Analyze my subscriptions and negotiate better deals',
        useMock,
      ).catch((err: unknown) => { throw err }),
      new Promise<void>(resolve => setTimeout(resolve, minDelay)),
    ]).catch((err: unknown) => {
      clearInterval(stepTimer)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setAppState('error')
      return [null] as [null]
    })

    if (data) {
      clearInterval(stepTimer)
      setActiveStep(AGENT_STEPS.length)
      setResult(data)
      setAppState('done')
    }
  }

  const reset = () => {
    setAppState('idle')
    setResult(null)
    setError(null)
    setActiveStep(-1)
  }

  return (
    <div className="app">
      {/* ── Hero ── */}
      <header className="hero">
        <div className="container">
          <div className="hero-badge badge badge-purple animate-fade-up">
            <div className="pulse-dot" />
            AI-Powered · Multi-Agent Workflow
          </div>
          <h1 className="animate-fade-up delay-100">
            Stop Overpaying for<br />
            <span className="gradient-text">Subscriptions</span>
          </h1>
          <p className="hero-sub animate-fade-up delay-200">
            Our three-agent AI pipeline analyzes your subscriptions, researches vendor
            cancellation policies, and drafts personalized negotiation emails — automatically.
          </p>

          {appState === 'idle' && (
            <div className="hero-actions animate-fade-up delay-300">
              <button className="btn btn-primary" onClick={() => handleAnalyze(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Analyze Live (Gemini AI)
              </button>
              <button className="btn btn-secondary" onClick={() => handleAnalyze(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                Demo Mode (Instant)
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container main-content">

        {/* ── Pipeline Progress ── */}
        {(appState === 'loading' || appState === 'done') && (
          <div className="pipeline-section animate-fade-up">
            <h2>Agent Pipeline</h2>
            <div className="pipeline-steps">
              {AGENT_STEPS.map((step, i) => (
                <AgentStep
                  key={step}
                  index={i + 1}
                  label={step}
                  active={activeStep === i && appState === 'loading'}
                  done={activeStep > i || appState === 'done'}
                />
              ))}
            </div>
            {appState === 'loading' && (
              <GeminiThinking step={activeStep} />
            )}
          </div>
        )}

        {/* ── Error ── */}
        {appState === 'error' && (
          <div className="error-card card animate-fade-up">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink)" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <h3 style={{ color: 'var(--accent-pink)', marginBottom: 4 }}>Workflow Error</h3>
                <p style={{ fontSize: '0.9rem' }}>{error}</p>
                <p style={{ fontSize: '0.82rem', marginTop: 8 }}>
                  Tip: Make sure the FastAPI backend is running on port 8000. Try <strong>Demo Mode</strong> to test without the backend.
                </p>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={reset} style={{ marginTop: 16 }}>Try Again</button>
          </div>
        )}

        {/* ── Results ── */}
        {appState === 'done' && result && (
          <>
            <SavingsSummary data={result} />

            {result.is_mock_fallback && (
              <div className="fallback-notice animate-fade-up">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Live AI workflow ran but returned empty state — showing demo data. Check that your <strong>GOOGLE_API_KEY</strong> is valid and the backend server is restarted after the <code>.env</code> fix.
              </div>
            )}

            <div className="results-header">
              <h2 className="animate-fade-up">Subscription Analysis</h2>
              <button className="btn btn-secondary" onClick={reset}>New Analysis</button>
            </div>

            {result.subscriptions.length === 0 ? (
              <div className="empty-state card animate-fade-up">
                <span style={{ fontSize: '2.5rem' }}>🔍</span>
                <h3>No subscriptions found</h3>
                <p>The workflow completed but found no subscription data. Try <strong>Demo Mode</strong> to see how the dashboard looks with data.</p>
                <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => handleAnalyze(true)}>Run Demo Mode</button>
              </div>
            ) : (
              <div className="cards-grid">
                {result.subscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.vendor}
                    sub={sub}
                    policy={result.vendor_policies[sub.vendor]}
                    strategy={result.negotiation_strategies[sub.vendor]}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── How it works ── */}
        {appState === 'idle' && (
          <div className="how-it-works animate-fade-up delay-200">
            <h2>How it works</h2>
            <div className="steps-grid">
              {[
                { icon: '🔍', title: 'Parse Subscriptions', desc: 'Agent 1 connects to your financial data and identifies all active recurring charges.' },
                { icon: '📋', title: 'Research Policies', desc: 'Agent 2 looks up cancellation terms, retention offers, and support contacts for each vendor.' },
                { icon: '✉️', title: 'Draft Negotiations', desc: 'Agent 3 crafts persuasive, personalized emails leveraging competitor pricing and loyalty data.' },
              ].map((step, i) => (
                <div key={i} className={`step-card card delay-${(i + 1) * 100}`}>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>SubNegotiator · Built with Google ADK 2.0 + Gemini · All email drafts require manual review before sending.</p>
        </div>
      </footer>
    </div>
  )
}
