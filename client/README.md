# Smart Canteen - Client Application

This is the frontend client application for the **Smart Canteen** project. It is a modern Single Page Application (SPA) built with React, designed to provide a seamless and responsive user experience for both regular users and canteen administrators.

## 🚀 Tech Stack

The application is built using a modern, performance-focused stack:

- **Framework**: [React](https://react.dev/) (v19)
- **Tooling/Bundler**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/) (v7) for client-side routing with lazy-loading
- **State & Data Fetching**: [TanStack React Query](https://tanstack.com/query) (v5) for caching and asynchronous state management, combined with React Context for authentication state
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth UI transitions
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 📁 Project Structure

The codebase is organized logically within the `src/` directory:

```text
src/
├── assets/         # Static assets (images, logos)
├── components/     # Reusable UI components and layout wrappers
│   ├── layout/     # Page layouts (e.g., UserLayout, AdminLayout)
│   ├── ui/         # Base UI components (Buttons, Badges, Spinners)
│   └── ...
├── context/        # React Context providers (AuthProvider)
├── lib/            # Utility libraries and configurations (e.g., Axios setup)
├── pages/          # Route-level components (Lazy-loaded)
│   ├── admin/      # Admin-specific pages (Dashboard, MenuManagement, AllOrders)
│   ├── user/       # User-specific pages (MenuBrowse, PlaceOrder, MyOrders)
│   ├── Login.jsx
│   └── Register.jsx
├── services/       # API abstraction layer (e.g., menuService.js)
├── App.jsx         # Main application component and routing configuration
└── main.jsx        # Application entry point
```

## ✨ Key Features

### Role-Based Access Control (RBAC)
The app uses a `ProtectedRoute` component to restrict access based on user roles (`user` vs `admin`).

### For Regular Users:
- **Browse Menu**: View all available and unavailable items in the canteen.
- **Cart Management**: Add/remove items with stock validation.
- **Place Orders**: Checkout and submit orders securely.
- **Order History**: Track past and current orders dynamically.

### For Administrators:
- **Admin Dashboard**: Overview of canteen metrics and activities.
- **Menu Management**: Perform CRUD operations on the menu (Add, Edit, Delete items, update pricing and stock).
- **Order Management**: Monitor and manage all incoming orders across the system.

### Performance Optimizations:
- **Lazy Loading**: Route-level code splitting using `React.lazy` and `Suspense` ensures the initial JavaScript bundle is small and loads incredibly fast.
- **Data Caching**: `react-query` handles background data synchronization, caching, and retry logic to minimize redundant API calls.

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn` installed

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (if any, e.g., in a `.env` file for the API base URL).

### Running the App

Start the Vite development server:
```bash
npm run dev
```
The application will usually be available at `http://localhost:5173`.

### Building for Production

Create a production-ready optimized build:
```bash
npm run build
```
You can locally preview the production build using:
```bash
npm run preview
```

## 📝 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Bundles the app for production.
- `npm run lint`: Runs ESLint to find and fix code style issues.
- `npm run preview`: Bootstraps a local server to serve the production build.

---

## Author
**Arnab Ghosh**
