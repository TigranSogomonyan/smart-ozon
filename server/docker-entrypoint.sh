#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until npx sequelize-cli db:migrate --env production 2>/dev/null; do
  echo "  DB not ready, retrying in 3s..."
  sleep 3
done

echo "🌱 Running database seeders..."
npx sequelize-cli db:seed:all --env production 2>/dev/null || true

echo "🚀 Starting server..."
exec node server.js
