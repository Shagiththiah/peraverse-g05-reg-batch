# Backend (Express + PostgreSQL + Prisma)

- API for minimal registration.
- Endpoints:
  - GET /api/meta/types
  - GET /api/meta/provinces
  - GET /api/meta/districts?province=Northern
  - GET /api/meta/organizations?type=School&province=Northern&district=Jaffna&q=mo
  - POST /api/register { type, province?, district?, organization }

Setup
1) Install Node.js LTS and PostgreSQL.
2) Create database and .env:
   DATABASE_URL="postgresql://user:password@localhost:5432/registration?schema=public"
3) npm i
4) npm run db:push
5) npm run seed
6) npm run dev
