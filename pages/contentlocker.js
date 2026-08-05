import { useState } from 'react'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { parse } from 'cookie'

const EXPIRES_AT = new Date('2026-08-15T06:00:00Z')

const DOCS = {
  schematic: 'settlement-schematic.html',
  simulator: 'simulator.html'
}

let readCount = 0

export async function getServerSideProps({ req, query }) {
  const expired = new Date() >= EXPIRES_AT
  if (expired) {
    return { props: { state: 'expired', html: null, reads: readCount } }
  }

  const cookies = parse(req.headers.cookie || '')
  const token = cookies.cl_token
  const expected = process.env.DOC_PASS
  const secret = process.env.ADMIN_COOKIE_SECRET || 'cl-salt'
  const validToken = createHash('sha256').update(expected + secret).digest('hex')

  if (!token || token !== validToken) {
    return { props: { state: 'locked', html: null, reads: readCount } }
  }

  readCount++

  const docKey = query.doc || 'schematic'
  const docFile = DOCS[docKey] || DOCS.schematic
  const filePath = join(process.cwd(), 'public', 'internal', docFile)
  const html = readFileSync(filePath, 'utf-8')

  return { props: { state: 'unlocked', html, reads: readCount } }
}

export default function ContentLocker({ state, html, reads }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (state === 'expired') {
    return (
      <div style={styles.container}>
        <h1 style={styles.code}>410</h1>
        <p style={styles.msg}>This document has self-destructed.</p>
        <p style={styles.sub}>Expired after scheduled deadline.</p>
      </div>
    )
  }

  if (state === 'locked') {
    async function handleSubmit(e) {
      e.preventDefault()
      setError(null)
      setLoading(true)
      try {
        const res = await fetch('/api/contentlocker-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        if (res.ok) {
          window.location.reload()
        } else {
          setError('Wrong password')
        }
      } catch {
        setError('Something went wrong')
      }
      setLoading(false)
    }

    return (
      <div style={styles.container}>
        <div style={styles.lock}>
          <p style={styles.eyebrow}>CONFIDENTIAL DOCUMENT</p>
          <h1 style={styles.title}>Enter password</h1>
          <p style={styles.sub}>This document is password-protected.</p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              style={styles.input}
            />
            <button type="submit" disabled={loading || !password} style={styles.btn}>
              {loading ? '...' : 'Unlock'}
            </button>
          </form>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={styles.banner}>
        <span>CONFIDENTIAL</span>
        <span>expires Friday Aug 15</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} style={{ paddingTop: '28px' }} />
    </>
  )
}

const styles = {
  container: {
    fontFamily: '"IBM Plex Mono", monospace',
    padding: '80px 20px',
    textAlign: 'center',
    color: '#5D6A75',
    background: '#DFE4E8',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: { maxWidth: '380px', width: '100%' },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#5D6A75',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#141C24',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  code: { fontSize: '48px', color: '#141C24', marginBottom: '16px' },
  msg: { color: '#5D6A75', fontSize: '15px' },
  sub: { fontSize: '13px', color: '#5D6A75', marginBottom: '24px', lineHeight: '1.5' },
  form: { display: 'flex', gap: '8px' },
  input: {
    flex: 1,
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: '"IBM Plex Mono", monospace',
    border: '1px solid #B2BCC5',
    background: '#fff',
    color: '#141C24',
    outline: 'none',
  },
  btn: {
    padding: '12px 20px',
    fontSize: '13px',
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 600,
    background: '#141C24',
    color: '#DFE4E8',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
  error: { color: '#C4590B', fontSize: '13px', marginTop: '12px' },
  banner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: '#141C24',
    color: '#DFE4E8',
    padding: '6px 16px',
    fontSize: '11px',
    fontFamily: '"IBM Plex Mono", monospace',
    display: 'flex',
    justifyContent: 'space-between',
  },
}
