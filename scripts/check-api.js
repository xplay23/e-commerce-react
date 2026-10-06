const base = (
  process.env.API_URL || 'https://b-m.work/e-commerce-react/backend/public/api'
).replace(/\/$/, '')
const headers = { Accept: 'application/json' }
if (process.env.API_TOKEN) headers.Authorization = `Bearer ${process.env.API_TOKEN}`
const checks = [
  ['health', (d) => d.status === 'ok'],
  ['categories', (d) => Array.isArray(d) && d.every((c) => typeof c.id === 'string')],
  [
    'products',
    (d) =>
      Array.isArray(d.items) &&
      typeof d.count === 'number' &&
      d.items.every(
        (p) =>
          typeof p.id === 'string' &&
          typeof p.price === 'number' &&
          typeof p.is_active === 'boolean',
      ),
  ],
]
if (process.env.API_TOKEN)
  checks.push(
    ['auth/me', (d) => typeof d.id === 'string' && ['customer', 'admin'].includes(d.role)],
    ['favorites', (d) => Array.isArray(d)],
    ['orders', (d) => Array.isArray(d)],
  )
let failed = false
for (const [path, validate] of checks) {
  try {
    const response = await fetch(`${base}/${path}`, { headers, signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!validate(data)) throw new Error('Unexpected API response')
    console.log(`PASS ${path}`)
  } catch (e) {
    console.error(`FAIL ${path}: ${e.message}`)
    failed = true
  }
}
if (failed) process.exitCode = 1
