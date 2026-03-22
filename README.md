# Smart Canteen 🍽️

> **Modern full-stack Canteen Management System featuring real-time stock locking, 15-minute auto-cancellation via cron jobs, and a sleek React Admin Dashboard.**

Smart Canteen is a robust web application designed to digitize cafeteria and canteen operations. It provides a seamless food ordering experience for students and staff, while offering powerful, real-time management tools for cafeteria administrators.

---

## ✨ Key Features

### 🛒 For Regular Users (Students & Staff)
- **Secure Authentication:** Register and log in securely using JSON Web Tokens (JWT) and Argon2 password hashing.
- **Live Menu Browsing:** Browse up-to-date food stock counts. Items are intuitively disabled the moment they run out of stock.
- **Instant Stock Locking:** Placing an order decrements the stock instantly, preventing race conditions and over-ordering.
- **Optimized UI/UX:** A snappy, modern, and responsive interface built with Framer Motion animations and Tailwind CSS, powered by React Query for instant data caching.
- **Order Tracking:** Monitor order statuses live, from "Pending" to "Confirmed" or "Cancelled".

### 🛠️ For Administrators
- **Role-Based Access Control (RBAC):** Exclusive access to an admin dashboard that gives full oversight over the system.
- **Menu Management (CRUD):** Complete control to Add, Edit, View, and Delete menu items.
- **Live Order Control:** View incoming orders as they arrive and manage their statuses in real-time.
- **Inventory Oversight:** Monitor global stock levels and rapidly restock items.

### ⏱️ Smart Automation
- **Auto-Cancellation Cron Job:** Stale orders (unpaid or unpicked) remaining in a "Pending" state are automatically cancelled after **15 minutes** by a scheduled Node-Cron job.
- **Inventory Restoration:** Whenever an order is cancelled (either manually by an admin or automatically by the system), the locked stock is instantly restored back to the global inventory.

---

## 💻 Tech Stack

| 🎨 Frontend (Client) | ⚙️ Backend (API) | 🗄️ Database & Tools |
| :--- | :--- | :--- |
| **React 19** | **Node.js** | **MongoDB** & **Mongoose** |
| **Vite** | **Express.js** | **Concurrently** (Root CLI) |
| **Tailwind CSS** | **JWT & Argon2** | **Winston & Morgan** (Logs) |
| **Framer Motion** | **Node-Cron** (Automation) | **ESLint** & **Prettier** |
| **React Query** | **Express Rate Limit** | **Git** |
| **Lucide React Icons** | **Helmet & CORS** | |

---

## 📸 Project Interface

![Smart Canteen Interface]
<img width="1920" height="964" alt="Screenshot (764)" src="https://github.com/user-attachments/assets/53f3f647-903d-4b5b-afd5-ff17ba6eac2e" />

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- **Node.js**: v18+ recommended
- **MongoDB**: Installed and running locally (or a MongoDB Atlas URI)
- **Git**

### 1. Installation

Clone the repository and install the dependencies. The project employs a monorepo-style structure, so you need to install packages in the root, API, and client directories:

```bash
git clone https://github.com/tfxpanda0p/smart-canteen-cron
cd "smart-canteen-cron"

# Install all workspace dependencies
npm install

# Install backend dependencies
cd api && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### 2. Environment Configuration

Create a `.env` file inside the `api/` directory to configure the backend:

```env
# /api/.env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/canteen-db
JWT_SECRET=your_super_secret_jwt_key
ADMIN_KEY=your_admin_registration_password
NODE_ENV=development
```

### 3. Running the Application

You can start both the Backend API and the Frontend Client simultaneously from the **root directory** using concurrently:

```bash
npm run dev
```

The system will be accessible at:
- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Architecture Overview

```text
smart-canteen/
├── api/                   # Express.js Backend
│   ├── src/
│   │   ├── config/        # Database & Logger Configuration
│   │   ├── controllers/   # Route Business Logic
│   │   ├── cron/          # Scheduled Automation Jobs (Auto-Cancel)
│   │   ├── middleware/    # Auth Guards, RBAC, Rate Limiting
│   │   ├── models/        # Mongoose Data Schemas (User, Menu, Order)
│   │   └── routers/       # Express API Endpoints
├── client/                # React.js Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI Blocks & Protected Routes
│   │   ├── context/       # Global Authentication State
│   │   ├── pages/         # View Configurations (Admin & User)
│   │   └── services/      # Axios API Network Calls
└── package.json           # Root settings & Concurrently scripts
```

---

## 🤝 Credits & Acknowledgements

- **Author:** [Subham Banerjee](https://github.com/tfxpanda0p)
- **Guidance:** Rohit Singh

## 📜 License
This project is licensed under the **ISC License**.
