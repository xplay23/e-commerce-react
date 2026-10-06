import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { api } from '../services/client'
import { useStore } from '../store/StoreProvider'
import { ErrorBox, Empty } from '../components/storefront'
export default function Checkout() {
  const { t, money } = useI18n()
  const { cart, setCart, user } = useStore()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null) // Передаём только ID и количество: PHP рассчитывает цены и списывает остатки в транзакции.
  // Блокировка кнопки предотвращает обычный повторный submit, но API не поддерживает idempotency-key.
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const fields = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const result = await api.request('orders', {
        method: 'POST',
        body: {
          ...fields,
          items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        },
      })
      setOrder(result.id)
      setCart([])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  if (order)
    return (
      <section className="auth-panel">
        <div className="eyebrow">{t('СПАСИБО ЗА ВАШ ВЫБОР')}</div>
        <h1>{t('Заказ #{id} оформлен', { id: order })}</h1>
        <product>{t('Заказ принят в обработку.')}</product>
        <Link className="button" to="/catalog">
          {t('Продолжить покупки')}
        </Link>
      </section>
    )
  if (!cart.length) return <Empty>{t('Добавьте товары для оформления заказа')}</Empty>
  return (
    <section className="auth-panel">
      <h1>{t('Оформление заказа')}</h1>
      <form onSubmit={submit}>
        {[
          ['customer_name', t('Имя'), 'text', user?.name],
          ['customer_email', t('Email'), 'email', user?.email],
          ['customer_phone', t('Телефон'), 'tel', ''],
          ['city', t('Город'), 'text', ''],
          ['address', t('Адрес доставки'), 'text', ''],
        ].map(([name, label, type, value]) => (
          <label key={name}>
            {label}
            <input
              name={name}
              type={type}
              defaultValue={value || ''}
              required
              maxLength={name === 'address' ? 500 : 120}
            />
          </label>
        ))}
        <label>
          {t('Комментарий')}
          <textarea name="comment" maxLength="2000" />
        </label>
        <product>
          {t('Сумма по текущим данным:')}{' '}
          {money(cart.reduce((n, item) => n + item.product.price * item.quantity, 0))}
        </product>
        {error && <ErrorBox error={error} />}
        <button className="button" disabled={busy}>
          {busy ? t('Оформляем…') : t('Подтвердить заказ')}
        </button>
      </form>
    </section>
  )
}
