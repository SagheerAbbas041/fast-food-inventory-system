# Fast Food Inventory & Restaurant Management System

A MERN full-stack starter for a fast-food restaurant admin/POS system.

## Stack
- Frontend: React + Vite + React Router + Axios + Lucide React
- Backend: Node.js + Express + MongoDB/Mongoose + JWT + bcryptjs
- PDF invoice: jsPDF
- Charts: Recharts

## Features
- Login with Admin / Cashier / Kitchen Staff roles
- Dashboard
- Tables and table status
- POS order creation
- Kitchen order workflow
- Invoice/payment flow
- Customers
- Menu management
- Inventory and stock
- Purchases
- Reports
- User management
- Backup/restore JSON
- Profile and restaurant settings

## Run

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Default seeded accounts:
- Admin: `admin` / `admin123`
- Cashier: `cashier` / `cashier123`
- Kitchen: `kitchen` / `kitchen123`

Change passwords before production use.

## MongoDB
Set `MONGO_URI` in `backend/.env`.
