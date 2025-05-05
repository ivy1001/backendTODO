#!/bin/sh

echo "⏳ Waiting for Postgres..."
./wait-for.sh todo_postgres:5432 -- echo "✅ Postgres is up"

echo "⏳ Waiting for Redis..."
./wait-for.sh redis:6379 -- echo "✅ Redis is up"

echo "⚙️ Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting application..."
exec npm run start:prod
