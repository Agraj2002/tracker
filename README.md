# 📊 Expense Tracker

**Live Demo:**  
- 🌐 [Frontend App](https://tracker-sigma-henna.vercel.app)  
- ⚙️ [Backend API](https://tracker-8lko.onrender.com)  

A full-stack **personal finance tracker** with authentication, categories, transactions, analytics, and admin dashboard.  
Built with **Node.js + Express + PostgreSQL + Redis** (backend) and **React + Vite + Redux + Tailwind** (frontend).  

---

## 🚀 Features
- 🔐 JWT Authentication & Role-based Access  
- 💸 Transactions CRUD + CSV/PDF Export  
- 🏷️ Category Management (Income/Expense)  
- 📈 Analytics Dashboard (Trends & Reports)  
- 👨‍💼 Admin Panel (User Roles & Stats)  
- ⚡ Redis Caching for Analytics  
- 🌙 Modern Dark UI (Tailwind + Redux)  

---

## ⚙️ Setup

Backend
cd backend
npm install
cp .env.example .env   # Update DATABASE_URL, REDIS_URL, JWT_SECRET
npm run migrate
npm start
Runs at: http://localhost:5000

Frontend
cd frontend
npm install
cp .env.example .env   # Set VITE_API_URL=http://localhost:5000
npm run dev
Runs at: http://localhost:5173

📌 API Docs
Swagger: http://localhost:5000/api/docs

🧪 Demo Credentials
Admin → admin@financetracker.com / admin123

User → user@financetracker.com / user123

Read-Only → readonly@financetracker.com / readonly123




