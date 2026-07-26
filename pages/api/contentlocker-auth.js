import { serialize } from 'cookie'
import { createHash } from 'crypto'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { password } = req.body ?? {}
  const expected = process.env.DOC_PASS

  if (!password || !expected || password !== expected) {
    return res.status(401).json({ error: 'Wrong password' })
  }

  const token = createHash('sha256')
    .update(expected + (process.env.ADMIN_COOKIE_SECRET || 'cl-salt'))
    .digest('hex')

  res.setHeader(
    'Set-Cookie',
    serialize('cl_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/contentlocker',
      maxAge: 60 * 60 * 24,
    })
  )

  return res.status(200).json({ ok: true })
}
