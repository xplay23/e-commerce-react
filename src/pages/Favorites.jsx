import React, { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store/StoreProvider'
import { ErrorBox, Grid } from '../components/storefront'
export default function Favorites() {
  const { t } = useI18n()
  const { favorites, refreshFavorites } = useStore()
  const [error, setError] = useState('')
  useEffect(() => {
    refreshFavorites().catch((e) => setError(e.message))
  }, [])
  return (
    <section className="section">
      <div className="eyebrow">{t('ВАША ЛИЧНАЯ КОЛЛЕКЦИЯ')}</div>
      <h1 className="page-title">{t('Избранное')}</h1>
      {error ? (
        <ErrorBox
          error={error}
          retry={() => {
            setError('')
            refreshFavorites().catch((e) => setError(e.message))
          }}
        />
      ) : (
        <Grid products={favorites.map((f) => f.product).filter(Boolean)} />
      )}
    </section>
  )
}
