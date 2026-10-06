# NORD Market — React + PHP

Адрес магазина: **https://b-m.work/e-commerce-react/**.
Все запросы production-сборки используют **/e-commerce-react/backend/public/api** на том же домене: регистрация, вход, категории, товары, избранное, заказы и админка.

## Загрузка на сервер

```powershell
npm install
npm run build:deploy
```

Загрузите **содержимое `deploy/`** в серверную папку `e-commerce-react` (не в подпапку dist):

```text
e-commerce-react/
  index.html
  .htaccess
  assets/
  placeholder.svg
  backend/
    .htaccess
    .env              ← настройка на сервере
    src/bootstrap.php
    public/
      .htaccess
      index.php
      api/
        .htaccess
        index.php
```

На сервере скопируйте `backend/.env` из уже работающего первого магазина в новый `backend/.env`, чтобы DB_HOST, DB_PORT, DB_NAME, DB_USER и DB_PASSWORD указывали на **ту же MySQL-базу**. Не запускайте повторно schema.sql и seed.sql. Для production задайте APP_ENV=production, APP_URL=https://b-m.work/e-commerce-react/backend/public и FRONTEND_URL=https://b-m.work.

PHP backend скопирован из `D:\work\e-commerce\backend` без изменения маршрутов и SQL-логики. Локальная конфигурация .env также скопирована и исключена из Git. В deploy секреты и SQL-файлы не включаются; конфигурацию .env разместите на сервере отдельно.

Готовые .htaccess рассчитаны на Apache 2.4 с mod_rewrite и разрешённым AllowOverride: маршруты React возвращают index.html, API обрабатывает PHP, Authorization передаётся backend. Служебные каталоги backend и .env закрыты от HTTP-доступа. Для Nginx/IIS нужны эквивалентные серверные правила: .htaccess там не применяется.

## Локальная разработка

```powershell
# Первый терминал — PHP 8.1+ с pdo_mysql и существующая MySQL
php -S localhost:8080 -t backend/public backend/router.php

# Второй терминал
npm run dev
```

Откройте **http://localhost:5174/e-commerce-react/**. В dev запросы /api проксируются на localhost:8080. Для другого локального адреса измените API_PROXY_TARGET в .env.local. Production по умолчанию использует собственную копию PHP backend без прокси. Не задавайте VITE_API_URL=/api в .env.local при сборке для сервера: это перекроет production-адрес. Для ручного переопределения используйте VITE_API_URL=/e-commerce-react/backend/public/api.

## Проверки

```powershell
npm test
npm run build:deploy
node scripts/check-api.js
```

check-api.js выполняет только GET и по умолчанию проверяет https://b-m.work/e-commerce-react/backend/public/api. Можно задать API_URL для другого адреса и API_TOKEN для проверки сессии, избранного и заказов. Скрипт не изменяет данные и не печатает токен.

Админка: /e-commerce-react/admin, доступна существующему пользователю с ролью admin.

Подробности общей базы и ограничений сервера: [DATABASE_COMPATIBILITY.md](DATABASE_COMPATIBILITY.md).

## Языки интерфейса

Доступны украинский (по умолчанию), русский и английский. Переключатель находится в шапке, выбранный язык сохраняется в браузере (`nord-language`). Переведены страницы магазина и админки, уведомления, основные ошибки PHP API; цены и даты форматируются по выбранной локали, валюта остаётся USD. Названия товаров, категории и описания берутся из общей БД без автоматического перевода: существующая схема содержит одно значение для каждого поля. Язык интерфейса не меняет записи в базе и формат PHP-запросов.

## Структура кода

- `src/main.jsx` — точка входа React; `src/App.jsx` — маршруты магазина.
- `src/pages/` — отдельные страницы: каталог, товар, авторизация, избранное, корзина, заказ и админка.
- `src/components/storefront.jsx` — общие элементы интерфейса и защита страниц.
- `src/store/StoreProvider.jsx` — состояние пользователя, избранного, корзины и уведомлений.
- `src/hooks/useLoad.js` — загрузка данных с повторным запросом и игнорированием устаревших ответов.
- `src/services/client.js` и `src/api.js` — адрес PHP API, Bearer-сессия и обработка ответов.
- `src/domain.js` — проверка и подготовка товара для существующего PHP-контракта.
- `src/i18n.jsx` и `src/translations.js` — выбор языка, форматирование и словари.
- `backend/src/bootstrap.php` — подключение общей базы, авторизация и вспомогательные функции.
- `backend/public/index.php` — маршруты PHP API, серверные права и транзакции заказов.

`npm run format` форматирует исходники JavaScript/React, CSS, HTML и PHP. `npm run format:check` проверяет форматирование. Секреты `.env`, зависимости и сгенерированные папки `dist`/`deploy` исключены.
