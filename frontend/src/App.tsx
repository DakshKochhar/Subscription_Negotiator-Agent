import { useState, useEffect, useRef } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
} from 'framer-motion'
import type { NegotiateResponse } from './api'
import { runNegotiation } from './api'
import './App.css'

// ── Animation Variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay },
  }),
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.25 } },
}

const slideLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

// ── Particle Canvas ────────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = []
    const colors = ['rgba(139,109,255,', 'rgba(0,229,184,', 'rgba(244,114,182,']

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

// ── Animated Counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, v => `${prefix}${v.toFixed(decimals)}${suffix}`)
  const [display, setDisplay] = useState(`${prefix}0.${'0'.repeat(decimals)}${suffix}`)

  useEffect(() => {
    const unsub = rounded.on('change', v => setDisplay(v))
    const ctrl = fmAnimate(motionVal, value, { duration: 1.4, ease: 'easeOut' })
    return () => { unsub(); ctrl.stop() }
  }, [value])

  return <span>{display}</span>
}

// ── GeminiThinking ──────────────────────────────────────────────────────────

function GeminiThinking({ step }: { step: number }) {
  const messages = [
    'Parsing your subscription data…',
    'Researching vendor cancellation policies…',
    'Drafting negotiation strategies…',
  ]
  return (
    <motion.div
      className="gemini-thinking"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="gemini-orb-ring">
        <div className="gemini-orb" />
        <div className="gemini-orb" />
        <div className="gemini-orb" />
        <div className="gemini-orb" />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className="gemini-thinking-text"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          {messages[step] ?? 'AI agents at work…'}
        </motion.p>
      </AnimatePresence>
      <div className="gemini-shimmer-bar">
        <div className="gemini-shimmer-fill" />
      </div>
    </motion.div>
  )
}

// ── AgentStep ───────────────────────────────────────────────────────────────

function AgentStep({ index, label, active, done }: {
  index: number; label: string; active: boolean; done: boolean
}) {
  return (
    <motion.div
      className={`agent-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}
      variants={slideLeft}
      initial="hidden"
      animate="visible"
      custom={index * 0.1}
      layout
    >
      <motion.div
        className="agent-step-icon"
        animate={done ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {done
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          : active
            ? <div className="spinner" style={{ width: 16, height: 16 }} />
            : <span>{index}</span>
        }
      </motion.div>
      <span className="agent-step-label">{label}</span>
    </motion.div>
  )
}

// ── SavingsSummary ──────────────────────────────────────────────────────────

function SavingsSummary({ data }: { data: NegotiateResponse }) {
  const annualSaving = data.potential_monthly_savings * 12
  return (
    <motion.div
      className="savings-banner"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="savings-banner-inner">
        <motion.div className="savings-stat" variants={staggerItem}>
          <span className="savings-label">Monthly Spend</span>
          <span className="savings-value red">
            $<AnimatedNumber value={data.total_monthly_cost} prefix="" decimals={2} />
          </span>
        </motion.div>
        <motion.div className="savings-arrow" variants={staggerItem} animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>→</motion.div>
        <motion.div className="savings-stat" variants={staggerItem}>
          <span className="savings-label">Target Spend</span>
          <span className="savings-value green">
            $<AnimatedNumber value={data.total_target_cost} prefix="" decimals={2} />
          </span>
        </motion.div>
        <div className="savings-divider" />
        <motion.div className="savings-highlight" variants={staggerItem}>
          <span className="savings-big">
            $<AnimatedNumber value={annualSaving} prefix="" decimals={0} />
          </span>
          <span className="savings-sublabel">potential annual savings</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── SubscriptionCard ────────────────────────────────────────────────────────

function SubscriptionCard({ sub, policy, strategy, index }: {
  sub: { vendor: string; monthly_cost: number; cadence: string; last_billing_date: string }
  policy?: { cancel_terms: string; retention_offers: string[]; support_email: string }
  strategy?: { target_price: number; leverage_points: string[]; draft_email_body: string }
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const saving = strategy ? sub.monthly_cost - strategy.target_price : 0

  const vendorColors: Record<string, string> = {
    Netflix: '#e50914',
    'Adobe Creative Cloud': '#fa0f00',
    Spotify: '#1db954',
  }
  const accentColor = vendorColors[sub.vendor] ?? '#8b6dff'

  return (
    <motion.div
      className="sub-card card"
      style={{ '--vendor-color': accentColor } as React.CSSProperties}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index * 0.1}
      whileHover={{
        y: -8,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}44, 0 0 40px ${accentColor}18`,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      }}
      layout
    >
      <div className="sub-card-header">
        <motion.div
          className="vendor-avatar"
          style={{ background: `${accentColor}18`, borderColor: `${accentColor}55` }}
          whileHover={{ scale: 1.1, rotate: [0, -4, 4, 0] }}
          transition={{ duration: 0.4 }}
        >
          <span style={{ color: accentColor }}>{sub.vendor[0]}</span>
        </motion.div>
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
        <motion.div
          className="saving-pill"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 300 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          Save ${saving.toFixed(2)}/month · ${(saving * 12).toFixed(0)}/year
        </motion.div>
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
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >✦ {offer}</motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {strategy && (
        <>
          <div className="divider" style={{ margin: '14px 0' }} />
          <div className="leverage-section">
            <span className="policy-label">Leverage Points</span>
            <ul className="leverage-list">
              {strategy.leverage_points.map((pt, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {pt}
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.button
            className="btn btn-secondary draft-toggle"
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {expanded ? 'Hide Draft Email' : 'View Draft Email'}
          </motion.button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                className="draft-email-block"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <pre>{strategy.draft_email_body}</pre>
                <motion.button
                  className="btn btn-secondary copy-btn"
                  onClick={() => navigator.clipboard.writeText(strategy!.draft_email_body)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Copy Email
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
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

    const minDelay = useMock ? 3000 : 5000
    const stepInterval = useMock ? 900 : 12000

    const stepTimer = setInterval(() => {
      setActiveStep(prev => {
        if (prev < AGENT_STEPS.length - 1) return prev + 1
        clearInterval(stepTimer)
        return prev
      })
    }, stepInterval)

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
      <ParticleCanvas />

      {/* ── Hero ── */}
      <header className="hero">
        <div className="container">
          <motion.div
            className="hero-badge badge badge-purple"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="pulse-dot" />
            AI-Powered · Multi-Agent Workflow
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            Stop Overpaying for<br />
            <motion.span
              className="gradient-text"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              Subscriptions
            </motion.span>
          </motion.h1>

          <motion.p
            className="hero-sub"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            Our three-agent AI pipeline analyzes your subscriptions, researches vendor
            cancellation policies, and drafts personalized negotiation emails — automatically.
          </motion.p>

          <AnimatePresence>
            {appState === 'idle' && (
              <motion.div
                className="hero-actions"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
                custom={0.3}
              >
                <motion.button
                  className="btn btn-primary"
                  onClick={() => handleAnalyze(false)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  Analyze Live (Gemini AI)
                </motion.button>
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => handleAnalyze(true)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                  Demo Mode (Instant)
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="container main-content">

        {/* ── Pipeline Progress ── */}
        <AnimatePresence>
          {(appState === 'loading' || appState === 'done') && (
            <motion.div
              className="pipeline-section"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
              custom={0}
            >
              <h2>Agent Pipeline</h2>
              <motion.div
                className="pipeline-steps"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {AGENT_STEPS.map((step, i) => (
                  <AgentStep
                    key={step}
                    index={i + 1}
                    label={step}
                    active={activeStep === i && appState === 'loading'}
                    done={activeStep > i || appState === 'done'}
                  />
                ))}
              </motion.div>
              <AnimatePresence>
                {appState === 'loading' && <GeminiThinking step={activeStep} />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {appState === 'error' && (
            <motion.div
              className="error-card card"
              initial={{ opacity: 0, scale: 0.9, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <motion.div
                  animate={{ rotate: [0, -6, 6, -6, 0] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink)" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </motion.div>
                <div>
                  <h3 style={{ color: 'var(--accent-pink)', marginBottom: 4 }}>Workflow Error</h3>
                  <p style={{ fontSize: '0.9rem' }}>{error}</p>
                  <p style={{ fontSize: '0.82rem', marginTop: 8 }}>
                    Tip: Make sure the FastAPI backend is running on port 8000. Try <strong>Demo Mode</strong> to test without the backend.
                  </p>
                </div>
              </div>
              <motion.button
                className="btn btn-secondary"
                onClick={reset}
                style={{ marginTop: 16 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        <AnimatePresence>
          {appState === 'done' && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.4 }}
            >
              <SavingsSummary data={result} />

              {result.is_mock_fallback && (
                <motion.div
                  className="fallback-notice"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  Live AI workflow ran but returned empty state — showing demo data. Check that your <strong>GOOGLE_API_KEY</strong> is valid and the backend server is restarted after the <code>.env</code> fix.
                </motion.div>
              )}

              <motion.div
                className="results-header"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.15}
              >
                <h2>Subscription Analysis</h2>
                <motion.button
                  className="btn btn-secondary"
                  onClick={reset}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  New Analysis
                </motion.button>
              </motion.div>

              {result.subscriptions.length === 0 ? (
                <motion.div
                  className="empty-state card"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  custom={0.2}
                >
                  <motion.span
                    style={{ fontSize: '2.8rem' }}
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
                  >🔍</motion.span>
                  <h3>No subscriptions found</h3>
                  <p>The workflow completed but found no subscription data. Try <strong>Demo Mode</strong> to see how the dashboard looks with data.</p>
                  <motion.button
                    className="btn btn-secondary"
                    style={{ marginTop: 16 }}
                    onClick={() => handleAnalyze(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Run Demo Mode
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  className="cards-grid"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {result.subscriptions.map((sub, i) => (
                    <SubscriptionCard
                      key={sub.vendor}
                      sub={sub}
                      policy={result.vendor_policies[sub.vendor]}
                      strategy={result.negotiation_strategies[sub.vendor]}
                      index={i}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── How it works ── */}
        <AnimatePresence>
          {appState === 'idle' && (
            <motion.div
              className="how-it-works"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
              custom={0.2}
            >
              <h2>How it works</h2>
              <motion.div
                className="steps-grid"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: '🔍', title: 'Parse Subscriptions', desc: 'Agent 1 connects to your financial data and identifies all active recurring charges.' },
                  { icon: '📋', title: 'Research Policies', desc: 'Agent 2 looks up cancellation terms, retention offers, and support contacts for each vendor.' },
                  { icon: '✉️', title: 'Draft Negotiations', desc: 'Agent 3 crafts persuasive, personalized emails leveraging competitor pricing and loyalty data.' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    className="step-card card"
                    variants={staggerItem}
                    whileHover={{
                      y: -8,
                      boxShadow: 'var(--shadow-card), var(--shadow-glow)',
                      borderColor: 'var(--border-bright)',
                      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                    }}
                  >
                    <motion.div
                      className="step-icon"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, repeatDelay: i * 0.8 + 1, duration: 1.2, ease: 'easeInOut' }}
                    >
                      {step.icon}
                    </motion.div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <motion.footer
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="container">
          <p>SubNegotiator · Built with Google ADK 2.0 + Gemini · All email drafts require manual review before sending.</p>
        </div>
      </motion.footer>
    </div>
  )
}
