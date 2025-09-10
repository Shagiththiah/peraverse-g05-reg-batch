# 🚀 Project Setup Guide for Collaborators

## 📋 Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (or SQLite for development)
- Git

## 🔧 Backend Setup

1. **Navigate to Backend folder:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment file:**
   The `Backend/.env` file is already included with shared database configuration.
   If you need to modify the database connection, edit `Backend/.env`.

4. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

## 🎨 Frontend Setup

1. **Navigate to Frontend folder:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend server:**
   ```bash
   npm run dev
   ```

## 🌐 Access URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Admin Portal: http://localhost:5173/admin

## 📊 Database Schema
- Registration system with RFID tag management
- Lookup tables for provinces, districts, schools, universities
- Admin portal for managing registrations and RFID tags

## 🐛 Troubleshooting
- If you get database connection errors, check your `.env` file
- If Prisma errors occur, run `npx prisma generate`
- If frontend doesn't load, check if backend is running on port 4000

## 👥 Collaboration
- Always pull latest changes before starting work
- Test your changes locally before pushing
- Use meaningful commit messages
- Update this README if you add new setup steps
