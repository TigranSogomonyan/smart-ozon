# Smart Ozon — Умный маркетплейс

Дипломный проект: полнофункциональный маркетплейс на React + Express + PostgreSQL.

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Zustand, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Sequelize ORM
- **Auth**: JWT (access token в памяти, refresh token в httpOnly cookie)
- **Payments**: Stripe Checkout (test mode)
- **Uploads**: Multer (local /uploads)

## Быстрый старт

### 1. Запуск через Docker Compose

```bash
docker-compose up --build
```

Приложение будет доступно:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

### 2. Локальный запуск (разработка)

**Требования:** Node.js 18+, PostgreSQL 15+

**Backend:**
```bash
cd server
npm install
# При необходимости отредактируйте server/.env
npm run db:migrate
npm run db:seed
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Переменные окружения

Скопируйте `.env.example` в `server/.env` и настройте:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_ozon
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
STRIPE_SECRET_KEY=sk_test_...    # из Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...  # из Stripe Dashboard
```

## Тестовые аккаунты (после seed)

| Роль  | Email                     | Пароль    |
|-------|---------------------------|-----------|
| Admin | admin@smart-ozon.ru       | admin123  |
| Seller| seller1@smart-ozon.ru     | seller123 |
| Seller| seller2@smart-ozon.ru     | seller123 |

## Команды БД

```bash
cd server
npm run db:migrate          # Применить миграции
npm run db:seed             # Заполнить начальными данными
npm run db:reset            # Сбросить и применить заново
```

## Stripe (опционально)

1. Создайте аккаунт на [stripe.com](https://stripe.com) (test mode)
2. Скопируйте `sk_test_...` в `STRIPE_SECRET_KEY`
3. Для webhook: `stripe listen --forward-to localhost:3001/api/payments/webhook`
4. Скопируйте `whsec_...` в `STRIPE_WEBHOOK_SECRET`

Без настройки Stripe заказы создаются и сразу считаются успешными (демо-режим).

## Структура проекта

```
smart-ozon/
├── client/           # React Frontend (Vite)
│   ├── src/
│   │   ├── api/      # Axios instance
│   │   ├── stores/   # Zustand stores (auth, cart, favorites)
│   │   ├── components/
│   │   └── pages/
│   └── ...
├── server/           # Express Backend
│   ├── config/
│   ├── models/       # Sequelize models
│   ├── migrations/
│   ├── seeders/
│   ├── middleware/
│   ├── routes/
│   └── server.js
├── docker-compose.yml
└── .env.example
```

## Функциональность

- Регистрация и авторизация (JWT + refresh tokens)
- Каталог товаров с поиском, фильтрацией и сортировкой
- Карточки товаров с корзиной и избранным
- Профиль пользователя с изменением данных и паролем
- Заявка на роль продавца (одобрение/отклонение администратором)
- Кабинет продавца: управление магазином, товарами, просмотр заказов
- Оформление заказа через Stripe Checkout
- Административная панель: заявки, пользователи, категории, заказы, товары
- Загрузка изображений (Multer)
- Темная дизайн-система (Deep Navy + Coral accent)
