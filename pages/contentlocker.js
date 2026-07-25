import { readFileSync } from 'fs'
import { join } from 'path'

const MAX_READS = 3
const EXPIRES_AT = new Date('2026-07-07T00:00:00Z')

let readCount = 0

export async function getServerSideProps() {
  if (new Date() >= EXPIRES_AT || readCount >= MAX_READS) {
    return { props: { expired: true, html: null, reads: readCount } }
  }

  readCount++

  const filePath = join(process.cwd(), 'public', 'internal', 'settlement-schematic.html')
  const html = readFileSync(filePath, 'utf-8')

  return {
    props: {
      expired: false,
      html,
      reads: readCount,
    },
  }
}

export default function ContentLocker({ expired, html, reads }) {
  if (expired) {
    return (
      <div style={{
        fontFamily: '"IBM Plex Mono", monospace',
        padding: '80px 20px',
        textAlign: 'center',
        color: '#5D6A75',
        background: '#DFE4E8',
        minHeight: '100vh',
      }}>
        <h1 style={{ fontSize: '48px', color: '#141C24', marginBottom: '16px' }}>410</h1>
        <p>This document has self-destructed.</p>
        <p style={{ fontSize: '13px', marginTop: '8px' }}>
          Expired after {reads >= MAX_READS ? `${MAX_READS} reads` : 'scheduled deadline'}.
        </p>
      </div>
    )
  }

  return (
    <>
      <div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#141C24', color: '#DFE4E8', padding: '6px 16px', fontSize: '11px', fontFamily: '"IBM Plex Mono", monospace', display: 'flex', justifyContent: 'space-between' }}
      >
        <span>CONFIDENTIAL — read {reads}/{MAX_READS}</span>
        <span>expires Monday Jul 7</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} style={{ paddingTop: '28px' }} />
    </>
  )
}
