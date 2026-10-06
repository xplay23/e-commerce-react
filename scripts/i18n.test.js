import test from 'node:test'
import assert from 'node:assert/strict'
import {
  messages,
  languages,
  normalizeLanguage,
  readLanguage,
  translate,
} from '../src/translations.js'
test('Ukrainian is the default; only supported saved choices are restored', () => {
  assert.equal(readLanguage({ getItem: () => null }), 'uk')
  assert.equal(readLanguage({ getItem: () => 'en' }), 'en')
  assert.equal(normalizeLanguage('de'), 'uk')
  assert.equal(
    readLanguage({
      getItem: () => {
        throw new Error('Blocked')
      },
    }),
    'uk',
  )
})
test('translations preserve dynamic values in all languages', () => {
  assert.equal(translate('Здравствуйте, {name}', 'uk', { name: 'Олена' }), 'Вітаємо, Олена')
  assert.equal(translate('Здравствуйте, {name}', 'en', { name: 'Alice' }), 'Hello, Alice')
  assert.equal(translate('Здравствуйте, {name}', 'ru', { name: 'Анна' }), 'Здравствуйте, Анна')
})
test('every translation has Ukrainian and English text with identical placeholders', () => {
  for (const [key, values] of Object.entries(messages)) {
    assert.equal(values.length, 2)
    for (const text of values) {
      assert.ok(text.trim())
      assert.deepEqual(
        [...text.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort(),
        [...key.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort(),
      )
    }
  }
})
test('PHP errors and dynamic validation errors are translated without changing API', () => {
  for (const lang of languages) {
    assert.ok(translate('Invalid email or password', lang))
    assert.equal(translate('Ошибка сервера (503)', lang).includes('503'), true)
  }
  assert.equal(
    translate('Invalid email or password', 'uk'),
    'Неправильна електронна пошта або пароль',
  )
  assert.equal(translate("Field 'city' is required", 'en'), 'Required field: city')
})
