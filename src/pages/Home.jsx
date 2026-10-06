import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Truck, ShieldCheck } from 'lucide-react'
import { useI18n } from '../i18n'
import { useLoad } from '../hooks/useLoad'
import { ErrorBox, Grid } from '../components/storefront'
export default function Home() {
  const { t } = useI18n()
  const state = useLoad('products/featured?limit=4')
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">{t('ДЛЯ ВАШЕГО РИТМА ЖИЗНИ')}</div>
          <h1>
            {t('Простые вещи.')}
            <br />
            {t('Особенные дни.')}
          </h1>
          <product>
            {t('Техника, дом и повседневные находки.')}
            <br />
            {t('Собрали то, что хочется оставить с собой.')}
          </product>
          <Link className="button" to="/catalog">
            {t('Открыть каталог')} <ArrowRight size={18} />
          </Link>
          <div className="hero-note">
            <span /> {t('Выбирайте осознанно. Живите комфортно.')}
          </div>
        </div>
        <div className="hero-art">
          <div className="art-circle" />
          <div className="vase">
            <div className="stem s1" />
            <div className="stem s2" />
            <div className="stem s3" />
          </div>
          <div className="book book-one" />
          <div className="book book-two" />
          <div className="art-caption">
            {t('На каждый день')}
            <br />
            {t('Коллекция')} <span>01 / NORD</span>
          </div>
        </div>
      </section>
      <section className="benefits">
        <div>
          <Truck />
          <span>
            {t('Заказ онлайн')}
            <small>{t('В удобное для вас время')}</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            {t('Личный кабинет')}
            <small>{t('Ваши заказы в одном месте')}</small>
          </span>
        </div>
        <div>
          <Leaf />
          <span>
            {t('Ничего лишнего')}
            <small>{t('Только то, что вам подходит')}</small>
          </span>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">{t('СТОИТ ПРИСМОТРЕТЬСЯ')}</div>
          <h2>{t('Наш выбор для вас')}</h2>
          <Link to="/catalog">
            {t('Все товары')} <ArrowRight size={17} />
          </Link>
        </div>
        {state.loading ? (
          <product className="loading">{t('Загружаем коллекцию…')}</product>
        ) : state.error ? (
          <ErrorBox error={state.error} retry={state.retry} />
        ) : (
          <Grid products={state.data.items} />
        )}
      </section>
      <section className="editorial">
        <span>{t('ВАШ НОВЫЙ ЛЮБИМЫЙ МАГАЗИН')}</span>
        <h2>
          {t('Хорошие вещи находят')}
          <br />
          {t('своё место.')}
        </h2>
        <Link to="/catalog">
          {t('Найдите свои')} <ArrowRight size={18} />
        </Link>
      </section>
    </>
  )
}
