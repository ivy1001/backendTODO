# 📝 Todo API (NestJS + Prisma + JWT + Redis)

A secure and modular TODO management API built using **NestJS**, **Prisma**, **JWT Authentication**, and **Redis** for caching.
The entire application is containerized with **Docker** for easy setup and deployment.

## 🚀 Features

- ✅ RESTful Todo API
- 🐘 PostgreSQL for data persistence
- ⚡ Redis for caching (e.g., task stats)
- 🐳 Docker-based development environment
- 🔐 JWT-based authentication
- 🧪 Unit-tested with Jest
- 📘 Swagger API documentation

- ---

## 🛠️ Tech Stack

- **Backend**: NestJS, Prisma, TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **DevOps**: Docker, Docker Compose
- **Testing**: Jest

---

## 📦 Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---
## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/todo-api.git
cd todo-api
```

### 2. Start the Services

### Option 1: Using Docker 🐳

```bash
# 1. Build and start all services
docker-compose up --build

Wait until you see:

```
✅ Postgres is up
✅ Redis is up
🚀 Starting application...
```
# 2. Access the API at:
http://localhost:3000/api

```
### Option 2: Local Development (Run Dev) 🧪

> Requires: Node.js 18+, PostgreSQL running on `localhost:5432`, Redis running on `localhost:6379`

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run database migrations
npx prisma migrate dev

# 4. Start development server
npm run start:dev

# API available at:
http://localhost:3000/api
```
---

## 📦 Environment Variables

In `.env` file:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/todo_db
REDIS_URL=redis://localhost:6379
REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=supersecret
JWT_EXPIRES_IN=1h

JWT_REFRESH_SECRET=superrefreshsecret
JWT_REFRESH_EXPIRES_IN=7d

JWT_RESET_SECRET=resetsecretkey
JWT_RESET_EXPIRES_IN=15m

```

For Docker:
```env
DATABASE_URL="postgresql://myuser:mypassword@todo_postgres:5432/todo_db"
REDIS_URL="redis://redis:6379/0"
```
---

## 📁 Project Structure

```
.
├── src/
│   ├── auth/
│   ├── users/
│   ├── todos/
│   ├── lists/
│   └── prisma/
├── prisma/
│   └── schema.prisma
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh
└── wait-for.sh
```
---

## 🧪 Run Tests

```bash
npm run test
npm run test:cov
```

### 🏃 Run Locally

```bash
docker-compose up -d
npm run start:dev
```

## 📚 API Documentation

Available at: `http://localhost:3000/api`

Includes:
- Auth routes (`/auth`)
- Users routes (`/users`)
- Todos routes (`/todos`)
- Lists routes (`/lists`)

## 🧱 Best Practices Applied

- Modular architecture with services, controllers, and DTOs
- Centralized exception handling
- Input validation with `class-validator`
- Caching and rate limiting
- Clean and tested codebase

---

Built with ❤️ by an intern passionate about backend development.
