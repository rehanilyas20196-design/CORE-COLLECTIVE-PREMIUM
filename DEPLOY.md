# Core Collective — Deployment Guide

## Architecture
- **Frontend**: React + Vite (Vercel)
- **Backend**: NestJS (Vercel Serverless)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Cloudflare Turnstile
- **AI Chatbot**: Google Gemini 1.5 Flash

---

## Prerequisites
- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- Supabase project
- Google Gemini API key (free: https://aistudio.google.com/apikey)
- Cloudflare Turnstile site key + secret key (free: https://dash.cloudflare.com/?to=/:account/turnstile)

---

## 1. Backend Deployment

```bash
cd backend

# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

### Required Environment Variables (set in Vercel Dashboard)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `FRONTEND_URL` | Comma-separated frontend URLs (CORS) |
| `PASSWORD_PEPPER` | Secret string for password hashing |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |

---

## 2. Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Build locally (verify)
npm run build

# Deploy to Vercel
vercel --prod --build-env VITE_GEMINI_API_KEY=your_key
```

### Required Environment Variables (set in Vercel Dashboard)
| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Backend API URL (e.g., https://core-back.vercel.app) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key |

---

## 3. Quick Deploy (One-Command)

### Backend
```bash
cd backend && npm install && npm run build && vercel --prod
```

### Frontend (with Gemini key)
```bash
cd frontend && npm install && npm run build && vercel --prod --build-env VITE_GEMINI_API_KEY=your_key
```

---

## 4. Local Development

### Backend
```bash
cd backend
cp .env.example .env   # Fill in values
npm run start:dev      # http://localhost:3000
```

### Frontend
```bash
cd frontend
cp .env.example .env   # Fill in values
npm run dev            # http://localhost:5173
```

---

## 5. Key Features
- B2B marketplace with product catalog, cart, checkout
- Order tracking with 6-step status progression
- AI-powered chatbot (Gemini 1.5 Flash) trained on all website features
- Bulk ordering & supplier inquiry system
- Admin panel for order/discount/supplier management
- Cloudflare Turnstile security on auth
- Responsive Tailwind CSS design

---

## 6. Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Lucide Icons |
| Backend | NestJS, Supabase JS Client |
| Database | Supabase PostgreSQL, Row Level Security |
| Auth | Supabase Auth, Cloudflare Turnstile |
| AI | Google Gemini 1.5 Flash |
| Deployment | Vercel (frontend + serverless backend) |
