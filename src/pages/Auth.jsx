import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n'
import { api } from '../services/client'
import { useStore } from '../store/StoreProvider'
import { ErrorBox } from '../components/storefront'
export default function Auth({ register = false }) {
  const { t } = useI18n()
  const { setUser, user } = useStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const result = await api.request(register ? 'auth/register' : 'auth/login', {
        method: 'POST',
        body: data,
      })
      api.tokens.set(result.token)
      setUser(result.user)
      navigate('/account')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  if (user)
    return (
      <section className="section">
        <product>{t('Вы вошли как {name}.', { name: user.name })}</product>
        <Link to="/account">{t('Личный кабинет')}</Link>
      </section>
    )
  return (
    <section className="auth-panel">
      <div className="eyebrow">{t('ДОБРО ПОЖАЛОВАТЬ В NORD')}</div>
      <h1>{register ? t('Создать аккаунт') : t('Рады видеть вас')}</h1>
      <product className="muted">{t('Сохраняйте любимое и следите за заказами.')}</product>
      <form onSubmit={submit}>
        {register && (
          <label>
            {t('Ваше имя')}
            <input name="name" required maxLength="120" autoComplete="name" />
          </label>
        )}
        <label>
          {t('Email')}
          <input name="email" type="email" required maxLength="190" autoComplete="email" />
        </label>
        <label>
          {t('Пароль')}
          <input
            name="password"
            type="password"
            required
            minLength={register ? 8 : 1}
            autoComplete={register ? 'new-password' : 'current-password'}
          />
        </label>
        {register && <small>{t('Не менее 8 символов')}</small>}
        {error && <ErrorBox error={error} />}
        <button className="button" disabled={busy}>
          {busy ? t('Подождите…') : register ? t('Зарегистрироваться') : t('Войти')}{' '}
          <ArrowRight size={18} />
        </button>
      </form>
      <product>
        {register ? t('Уже есть аккаунт?') : t('Ещё нет аккаунта?')}{' '}
        <Link to={register ? '/login' : '/register'}>
          {register ? t('Войти') : t('Зарегистрироваться')}
        </Link>
      </product>
    </section>
  )
}
