import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useI18n } from '../i18n'
import { api } from '../services/client'
import { useStore } from '../store/StoreProvider'
import { useLoad } from '../hooks/useLoad'
import { ErrorBox, Empty } from '../components/storefront'
export default function Account() {
  const { t, money, date } = useI18n()
  const { user, setUser, setNotice } = useStore()
  const orders = useLoad('orders')
  const [busy, setBusy] = useState(false)
  async function logout() {
    setBusy(true)
    try {
      await api.request('auth/logout', { method: 'POST' })
      api.tokens.clear()
      setUser(null)
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="section">
      <div className="account-heading">
        <div>
          <div className="eyebrow">{t('ЛИЧНЫЙ КАБИНЕТ')}</div>
          <h1>{t('Здравствуйте, {name}', { name: user.name })}</h1>
          <product className="muted">{user.email}</product>
        </div>
        <button disabled={busy} onClick={logout}>
          <LogOut size={17} /> {t('Выйти')}
        </button>
      </div>
      {user.role === 'admin' && (
        <Link className="button" to="/admin">
          <Settings size={18} /> {t('Управление товарами')}
        </Link>
      )}
      <h2>{t('Мои заказы')}</h2>
      {orders.loading ? (
        <product>{t('Загружаем…')}</product>
      ) : orders.error ? (
        <ErrorBox error={orders.error} retry={orders.retry} />
      ) : orders.data.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('Заказ')}</th>
                <th>{t('Дата')}</th>
                <th>{t('Статус')}</th>
                <th>{t('Сумма')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{date(o.created_at)}</td>
                  <td>
                    {{
                      pending: t('Ожидает обработки'),
                      processing: t('Обрабатывается'),
                      shipped: t('Отправлен'),
                      completed: t('Завершён'),
                      cancelled: t('Отменён'),
                    }[o.status] || o.status}
                  </td>
                  <td>{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{t('У вас ещё нет заказов')}</Empty>
      )}
    </section>
  )
}
