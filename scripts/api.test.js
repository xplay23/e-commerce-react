import test from 'node:test'
import assert from 'node:assert/strict'
import { createApi, ApiError } from '../src/api.js'
import { productPayload } from '../src/domain.js'
function storage() {
  const values = new Map()
  return {
    getItem: (k) => values.get(k) || null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k),
  }
}
test('API uses existing PHP Bearer authentication and favorite contract', async () => {
  let called
  const client = createApi({
    base: 'https://b-m.work/e-commerce-react/backend/public/api/',
    storage: storage(),
    fetcher: async (url, options) => {
      called = { url, options }
      return new Response(JSON.stringify({ message: 'Favorite added' }), { status: 201 })
    },
  })
  client.tokens.set('session-token')
  await client.request('favorites', { method: 'POST', body: { product_id: '42' } })
  assert.equal(called.url, 'https://b-m.work/e-commerce-react/backend/public/api/favorites')
  assert.equal(called.options.headers.get('Authorization'), 'Bearer session-token')
  assert.deepEqual(JSON.parse(called.options.body), { product_id: '42' })
})
test('expired session clears token and signals React state', async () => {
  let expired = false
  const client = createApi({
    storage: storage(),
    onUnauthorized: () => {
      expired = true
    },
    fetcher: async () =>
      new Response(JSON.stringify({ message: 'Session expired' }), { status: 401 }),
  })
  client.tokens.set('expired')
  await assert.rejects(client.request('auth/me'), (e) => e instanceof ApiError && e.status === 401)
  assert.equal(client.tokens.get(), null)
  assert.equal(expired, true)
})
test('admin payload matches existing nullable fields and flags', () => {
  const result = productPayload({
    name: ' Product ',
    slug: 'product-1',
    description: 'Description',
    category_id: '',
    price: '12.50',
    old_price: '',
    stock: '0',
    is_active: false,
    is_featured: true,
  })
  assert.equal(result.price, 12.5)
  assert.equal(result.old_price, null)
  assert.equal(result.stock, 0)
  assert.equal(result.category_id, '')
  assert.equal(result.image_url, '')
  assert.equal(result.is_active, false)
  assert.equal(result.name, 'Product')
})
test('invalid prices, stock and slug cannot be submitted', () => {
  const form = { name: 'Test', slug: 'test', description: 'Description', price: '1', stock: '2' }
  for (const invalid of [
    { price: '-1' },
    { price: 'bad' },
    { stock: '1.5' },
    { slug: 'wrong slug' },
    { old_price: '-2' },
  ])
    assert.throws(() => productPayload({ ...form, ...invalid }))
})
