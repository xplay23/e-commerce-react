import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useI18n } from '../i18n'
import { useLoad } from '../hooks/useLoad'
import { ErrorBox, Grid } from '../components/storefront'
export default function Catalog() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const categories = useLoad('categories')
  const state = useLoad(`products?${params.toString()}`)
  const [search, setSearch] = useState(params.get('search') || '')
  useEffect(() => setSearch(params.get('search') || ''), [params.get('search')])
  // Фильтры сохраняются в URL; новый фильтр сбрасывает страницу, чтобы не показать пустой результат.
  const change = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }
  const page = Number(params.get('page') || 1)
  return (
    <section className="section">
      <div className="eyebrow">{t('КОЛЛЕКЦИЯ NORD')}</div>
      <h1 className="page-title">{t('Каталог товаров')}</h1>
      <div className="catalog-layout">
        <aside>
          <h3>{t('Категории')}</h3>
          <button
            className={!params.get('category') ? 'active' : ''}
            onClick={() => change('category', '')}
          >
            {t('Все товары')}
          </button>
          {categories.data?.map((category) => (
            <button
              className={params.get('category') === category.slug ? 'active' : ''}
              key={category.id}
              onClick={() => change('category', category.slug)}
            >
              {category.name}
            </button>
          ))}
          {categories.error && <ErrorBox error={categories.error} retry={categories.retry} />}
          <h3>{t('Цена, USD')}</h3>
          <label>
            {t('От')}
            <input
              type="number"
              min="0"
              value={params.get('minPrice') || ''}
              onChange={(e) => change('minPrice', e.target.value)}
            />
          </label>
          <label>
            {t('До')}
            <input
              type="number"
              min="0"
              value={params.get('maxPrice') || ''}
              onChange={(e) => change('maxPrice', e.target.value)}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={params.get('inStock') === 'true'}
              onChange={(e) => change('inStock', e.target.checked ? 'true' : '')}
            />{' '}
            {t('В наличии')}
          </label>
          <button onClick={() => setParams({})}>{t('Сбросить фильтры')}</button>
        </aside>
        <div>
          <div className="catalog-toolbar">
            <form
              className="search"
              onSubmit={(e) => {
                e.preventDefault()
                change('search', search)
              }}
            >
              <Search size={18} />
              <input
                aria-label={t('Поиск товаров')}
                placeholder={t('Найти свою вещь…')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button>{t('Найти')}</button>
            </form>
            <select
              aria-label={t('Сортировка')}
              value={params.get('sort') || 'newest'}
              onChange={(e) => change('sort', e.target.value)}
            >
              <option value="newest">{t('Сначала новые')}</option>
              <option value="price_asc">{t('Цена по возрастанию')}</option>
              <option value="price_desc">{t('Цена по убыванию')}</option>
              <option value="name_asc">{t('По названию')}</option>
            </select>
          </div>
          {state.loading ? (
            <product className="loading">{t('Загружаем товары…')}</product>
          ) : state.error ? (
            <ErrorBox error={state.error} retry={state.retry} />
          ) : (
            <>
              <product className="muted">
                {t('Найдено товаров:')} {state.data.count}
              </product>
              <Grid products={state.data.items} />
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => change('page', String(page - 1))}>
                  {t('Назад')}
                </button>
                <span>
                  {page} / {Math.max(1, Math.ceil(state.data.count / 12))}
                </span>
                <button
                  disabled={page * 12 >= state.data.count}
                  onClick={() => change('page', String(page + 1))}
                >
                  {t('Далее')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
