# AI Social Wingman Telegram Mini App

Проект Telegram Mini App для генерации ответов в переписках с помощью ИИ.

## Стек технологий

- **Frontend**: React (Vite), Tailwind CSS, Telegram Web Apps SDK
- **Backend**: Node.js (Express), MongoDB
- **AI**: Google Gemini 2.0 Flash
- **Платежи**: Telegram Stars

## Структура проекта

```
/client - React frontend
/server - Node.js backend
```

## Настройка

1. Клонируйте репозиторий.
2. Установите зависимости для backend: `cd server && npm install`
3. Установите зависимости для frontend: `cd client && npm install`

## Переменные окружения

Создайте `.env` файл в папке `server` со следующими переменными:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_social_wingman
GEMINI_API_KEY=ваш_gemini_api_key
BOT_TOKEN=ваш_bot_token
TELEGRAM_SECRET=ваш_telegram_secret
```

## Запуск

### Backend

```
cd server
npm run dev
```

### Frontend

```
cd client
npm run dev
```

## Деплой

### Backend на Render

1. Создайте сервис на Render, выберите Docker.
2. Укажите Dockerfile из папки server.
3. Добавьте переменные окружения.

### Frontend

Соберите и разместите на хостинге (например, Vercel или Netlify).

## Настройка Telegram Bot

1. Создайте бота через BotFather.
2. Включите платежи и Mini Apps.
3. Установите webhook для платежей.

## Функционал

- Загрузка скриншота переписки
- Выбор стиля ответа (Смешной, Романтичный, Дерзкий)
- Генерация 3 вариантов ответа через Gemini AI
- Монетизация: 3 бесплатных генерации, далее 10 за 50 Stars
