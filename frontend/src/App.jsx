import React, { useMemo, useState } from 'react'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App() {
  const [name, setName] = useState('')
  const [university, setUniversity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const scoreColor = useMemo(() => {
    if (!result) return '#888'
    const s = result.confidence_score
    if (s >= 80) return '#16a34a' // green
    if (s >= 60) return '#ca8a04' // amber
    return '#dc2626' // red
  }, [result])

  async function onVerify() {
    setError('')
    setResult(null)
    if (!name.trim() || !university.trim()) {
      setError('Please enter both name and university.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/verify-professor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, university })
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      padding: '24px',
      maxWidth: 860,
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: 8 }}>Trust & Transparency with AI</h1>
      <p style={{ color: '#555', marginTop: 0 }}>Verify if a professor profile is real and active.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#333', marginBottom: 6 }}>Professor Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Andrew Ng"
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#333', marginBottom: 6 }}>University</label>
          <input
            value={university}
            onChange={e => setUniversity(e.target.value)}
            placeholder="e.g., Stanford University"
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
        </div>
        <button
          onClick={onVerify}
          disabled={loading}
          style={{
            padding: '12px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: 'white',
            cursor: 'pointer',
            height: 44,
            alignSelf: 'end'
          }}
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: '#b91c1c' }}>{error}</div>
      )}

      {result && (
        <div style={{ marginTop: 24, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>Verification</div>
              <div style={{ color: '#555' }}>{result.verified ? 'Verified' : 'Unverified'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#555' }}>Confidence</div>
              <div style={{ fontWeight: 700, fontSize: 22, color: scoreColor }}>{result.confidence_score}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, color: '#333' }}>{result.summary}</div>
          {Array.isArray(result.evidence_links) && result.evidence_links.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Evidence</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {result.evidence_links.map((href, idx) => (
                  <a key={idx} href={href} target="_blank" rel="noreferrer" style={{
                    padding: 10,
                    border: '1px solid #eee',
                    borderRadius: 8,
                    color: '#1d4ed8',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{href}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


