import test from 'node:test'
import assert from 'node:assert/strict'
import { writeFile, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import { renderToString } from 'react-dom/server'

// Use the real pages with an in-memory router: this tests rendering without a browser or PHP writes.
test('storefront, registration and cart render in all three languages', async () => {
  const filename = resolve('scripts/.i18n-render.mjs')
  const source = `
    import React from 'react'
    import { MemoryRouter } from 'react-router-dom'
    import App from './src/App'
    import { LanguageProvider } from './src/i18n'
    export function TestApp() {
      return <LanguageProvider><App Router={MemoryRouter} routerProps={{ initialEntries: [globalThis.testRoute] }} /></LanguageProvider>
    }
  `
  const result = await build({
    stdin: { contents: source, loader: 'jsx', resolveDir: resolve('.') },
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    write: false,
    define: {
      'import.meta.env.BASE_URL': '"/e-commerce-react/"',
      'import.meta.env.DEV': 'false',
      'import.meta.env.VITE_API_URL': 'undefined',
    },
  })
  try {
    await writeFile(filename, result.outputFiles[0].text)
    const { TestApp } = await import(pathToFileURL(filename).href)
    for (const [language, catalog, registration, emptyCart] of [
      ['uk', 'Каталог', 'Створити обліковий запис', 'Ваш кошик поки порожній'],
      ['ru', 'Каталог', 'Создать аккаунт', 'Ваша корзина пока пуста'],
      ['en', 'Catalog', 'Create an account', 'Your cart is empty'],
    ]) {
      globalThis.localStorage = {
        getItem: (key) => (key === 'nord-language' ? language : null),
        setItem: () => {},
        removeItem: () => {},
      }
      globalThis.testRoute = '/register'
      let html = renderToString(React.createElement(TestApp))
      assert.ok(html.includes(catalog))
      assert.ok(html.includes(registration))
      assert.ok(html.includes(`value="${language}" selected=""`))
      globalThis.testRoute = '/cart'
      html = renderToString(React.createElement(TestApp))
      assert.ok(html.includes(emptyCart))
    }
  } finally {
    // Remove the temporary bundle even when an assertion fails.
    await unlink(filename).catch(() => {})
    delete globalThis.localStorage
    delete globalThis.testRoute
  }
})
