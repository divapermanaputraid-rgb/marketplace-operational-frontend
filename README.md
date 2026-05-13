# Marketplace Operations - Frontend

> **Note to Agents and Developers:**
> All project-wide documentation, system rules, architecture, and API specifications have been consolidated into the root workspace `docs/` folder. Please refer to `../../docs/` (or the root `docs/` folder of the workspace) for shared context before modifying this frontend.

Frontend for the Marketplace Operations System. Built with Vite, React, TypeScript, and Tailwind CSS.

## Implemented Pages (Internal MVP)
- Login
- Dashboard (Metrics and Alerts)
- Stores / Marketplace Accounts
- Products (Master Catalog)
- Product Mappings
- Inventory
- Orders
- Sync Center
- Reports

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- TanStack Query

## Local Setup

### 1. Configure Environment

```bash
cp .env.example .env.local
```
Ensure `VITE_API_BASE_URL` points to your running Go backend (default: `http://localhost:8080`).

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
```

The output will be in the `dist` directory.

## Deployment (Vercel)

This project includes a `vercel.json` file configured to rewrite all routes to `index.html` to support React Router's client-side routing on Vercel.

1. Connect your repository to Vercel
2. Set root directory to `frontend`
3. Set Framework Preset to **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Set the Environment Variable `VITE_API_BASE_URL` pointing to your deployed Render backend (e.g., `https://your-backend-app.onrender.com`). *Do not append `/api` as the client handles this.*
7. Deploy!

.
