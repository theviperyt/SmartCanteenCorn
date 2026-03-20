# Smart Canteen 🍽️

**Modern Canteen Ordering System with Real-Time Inventory Locking and Auto-Cancellation**

Smart Canteen is a robust, full-stack web application designed to digitize cafeteria and canteen operations. It provides a seamless ordering experience for users while offering powerful management tools for admins.

---

## 🚀 Key Features

### 🛒 For Regular Users (Students/Staff)
- **Secure Authentication:** Register and log in using JWT-based security.
- **Real-Time Menu:** Browse live stock counts; items are intelligently disabled when out of stock.
- **Immediate Stock Locking:** Placing an order decrements stock instantly to prevent over-ordering.
- **Intuitive UI:** A modern, responsive interface built with Framer Motion and Tailwind CSS.
- **Order Tracking:** Monitor order status from "Pending" to "Confirmed" or "Cancelled".

### 🛠️ For Administrators
- **Role-Based Dashboard:** Exclusive access to manage the entire system.
- **Menu Management:** Complete CRUD (Create, Read, Update, Delete) for menu items.
- **Live Order Control:** View incoming orders and update their status in real-time.
- **Inventory Oversight:** Monitor stock levels and update them as needed.

### ⏱️ Smart Automation (The "Cron" Logic)
- **Auto-Cancellation:** Stale orders (unpaid or unpicked) are automatically cancelled after **15 minutes**.
- **Stock Restoration:** Once an order is cancelled (manually or by the system), stock is instantly restored to the inventory.

---

## 💻 Tech Stack

| Frontend | Backend | Database | Tools |
| :--- | :--- | :--- | :--- |
| **React 19** | **Node.js** | **MongoDB** | **Vite** |
| **Tailwind CSS** | **Express.js** | **Mongoose** | **Concurrently** |
| **Framer Motion** | **JWT & Argon2** | | **Node-Cron** |
| **Lucide Icons** | **React Query** | | **Winston/Morgan** |

---

## 📸 Project Interface

![Smart Canteen Interface]
<img width="1920" height="964" alt="Screenshot (764)" src="https://github.com/user-attachments/assets/20ddfdba-b40b-45b8-84f9-c7d1e39e9906" />


---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally
- Git

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/tfxpanda0p/smart-canteen-cron
cd "Smart Canteen"

# Install all dependencies (Root, API, and Client)
npm install
cd api && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Environment Configuration

Create a `.env` file inside the `/api` directory:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/canteen-db
JWT_SECRET=your_super_secret_jwt_key
ADMIN_KEY=your_admin_registration_password
```

### 3. Running the App

Start both the Backend and Frontend servers simultaneously from the root directory:

```bash
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3000`

---

## 🤝 Credits

- **Author:** [Subham Banerjee](https://github.com/tfxpanda0p)
- **Guidance:** Rohit Singh

---

## 📜 License
This project is licensed under the ISC License.
