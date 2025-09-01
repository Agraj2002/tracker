# 📊 Expense Tracker (MERN + Vite + Redux + Tailwind)

A full-stack **personal finance tracker** application with authentication, categories, transactions, analytics, and an admin dashboard.  
Built with **Node.js + Express + PostgreSQL + Redis** on the backend, and **React + Vite + Redux + Tailwind CSS** on the frontend.  

---

## 🚀 Features
- 🔐 **Authentication & Authorization** (JWT-based login, register, role-based access)  
- 💸 **Transactions** (CRUD, search, and export to CSV/PDF)  
- 🏷️ **Categories** (create, update, delete, manage income/expense categories)  
- 📈 **Analytics** (dashboard, monthly/yearly reports, category breakdowns, trends)  
- 👨‍💼 **Admin Panel** (user management, update roles, view stats)  
- ⚡ **Caching with Redis** for faster analytics queries  
- 🌙 **Modern UI** with dark theme (Vite + Tailwind + Redux)  

---

## 📂 Project Structure
tracker-main/
│── backend/ # Express API + Postgres + Redis
│── frontend/ # React + Vite + Redux + Tailwind
│── README.md # Root documentation (this file)

markdown
Copy code

---

## 🛠️ Tech Stack
### Backend
- **Node.js + Express**
- **PostgreSQL** (via Sequelize/pg)
- **Redis** (for caching)
- **JWT Authentication**
- **Swagger API Docs**

### Frontend
- **React (Vite)**
- **Redux Toolkit**
- **Tailwind CSS**
- **Axios** (API client with interceptors)

---

## ⚙️ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/your-username/tracker-main.git
cd tracker-main
2. Backend Setup
bash
Copy code
cd backend
npm install
Copy .env.example → .env

Update values for:

DATABASE_URL → Postgres connection string

REDIS_URL → Redis connection string

JWT_SECRET → secure random key

Run migrations and start server:

bash
Copy code
npm run migrate
npm start
Server runs on http://localhost:5000

3. Frontend Setup
bash
Copy code
cd frontend
npm install
Copy .env.example → .env

Update:

env
Copy code
VITE_API_URL=http://localhost:5000
Run dev server:

bash
Copy code
npm run dev
Frontend runs on http://localhost:5173

🚀 Deployment
Backend (Render)
Repo: Backend Repo Link

Live API: [https://tracker-8lko.onrender.com](https://tracker-8lko.onrender.com)

Frontend (Vercel/Netlify)
Repo: Frontend Repo Link

Live App: [https://tracker-uwzt.vercel.app/](https://tracker-uwzt.vercel.app/)

📌 API Documentation
Swagger docs available at:
👉 http://localhost:5000/api/docs

### Demo Credentials

The application includes demo credentials for testing:

- **Admin**: admin@financetracker.com / admin123
- **User**: user@financetracker.com / user123  
- **Read-Only**: readonly@financetracker.com / readonly123



