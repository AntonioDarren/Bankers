# BANKERS — Personal Finance & Smart OCR Wallet App

> **University Project Notice:** **BANKERS** is developed as a university academic project prototype and is not an official banking or financial institution application. Please use dummy data and test credentials when trying the application.

**BANKERS** is a mobile-first personal finance management web application built with **React 18, TypeScript, Vite, Tailwind CSS, Tesseract.js (OCR), and Supabase**. It helps users consolidate multiple bank accounts and e-wallets, scan receipts or mobile banking screenshots using Optical Character Recognition (OCR), automatically categorize expenses (including **BI-FAST**, transfer admin fees, and **Monthly Bank Admin Fees**), and track their real-time **Financial Health Score** and **Total Net Worth**.

---

## ✨ Key Features

- **Secure Authentication & University Project Agreement Gate**
  - Email & Password registration and sign-in powered by **Supabase Auth** (with automatic `localStorage` fallback).
  - Mandatory clickable **Agreement** disclaimer modal that must be read before checking the agreement box and registering.
  - Generic security-focused credential validation alerts (`"Credentials cannot be empty."` / `"Invalid credentials."`).

- **8-Step Financial Persona Onboarding**
  - Interactive 8-question onboarding flow that assigns a personalized financial persona badge (*Careful Saver*, *Smart Tracker*, *Multi-Wallet Planner*, *Balanced Planner*) and customizes insights.

- **Live Financial Health & Net Worth Dashboard**
  - Every new account starts completely fresh (`0` Financial Health Score, `Rp 0` Net Worth, `0` Wallets, `0` Transactions).
  - **Total Net Worth** is dynamically calculated as the exact sum of all active wallet card balances.
  - Includes a **Cash Flow** dual-line chart, **Spending by Category** donut chart, **Emergency Fund** tracker, and **AI Savings Simulator**.

- **Apple Wallet–Style Multi-Wallet Manager**
  - Supports preset banks and e-wallets (**BCA**, **OCTO Mobile**, **Hana Bank**, **blu**, **Gopay**, **DANA**, **ShopeePay Visa**) plus **`Other Bank`** and **`Other E-Money`** so users can type any custom bank or e-wallet name (e.g., *Mandiri, BNI, BRI, SeaBank, OVO, LinkAja*).
  - Live card preview with customizable color themes and one-tap account number copy.

- **Real Client-Side OCR Receipt & Screenshot Scanner (`tesseract.js`)**
  - Upload receipt photos/screenshots from the device gallery or capture bills using the live mobile camera viewfinder.
  - Automatically extracts transaction titles, amounts, and categories (`FnB`, `Transportation`, `Income`, `Health`, `Shopping`, `Transfer`, `Bills`, and `Admin Fee`).
  - Smart detection for **BI-FAST (`Rp 2.500`)**, **Interbank Transfer Fees (`Rp 6.500`)**, **E-Wallet Top-Up Fees (`Rp 1.000`)**, and **Monthly Bank Admin Fees (`Rp 15.000`)** (differentiated between Bank cards and E-Money cards).

- **User Feedback System Synced to Supabase**
  - Built-in **Send Feedback** modal under **Profile → Privacy & Support** where users can rate their experience (1–5 stars) and submit text feedback directly to the `public.bankers_feedback` PostgreSQL table.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite 6
- **Styling & Icons:** Tailwind CSS v3, Lucide React
- **OCR Engine:** `tesseract.js` (WebAssembly client-side OCR)
- **Backend / Database:** Supabase (`@supabase/supabase-js` — Supabase Auth + PostgreSQL)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (`.env`)

Copy `.env.example` to `.env` in the project root and add your Supabase Project URL and Anon Public Key:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

*(Note: `.env` is listed in `.gitignore` so your keys will not be pushed to Git.)*

### 3. Set Up the Supabase Database Tables

Open your **Supabase Dashboard → SQL Editor**, paste the contents of [`supabase_schema.sql`](./supabase_schema.sql), and click **Run**. This creates:
- `public.bankers_users` — stores user profiles, onboarding answers, wallet cards, transactions, notifications, and per-user feedback.
- `public.bankers_feedback` — dedicated table storing all submitted user ratings and feedback messages.

*(Optional: Under **Supabase Dashboard → Authentication → Providers → Email**, turn off **"Confirm email"** if you want new users to log in immediately without waiting for an email verification link.)*

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```text
├── public/
├── src/
│   ├── components/
│   │   ├── BottomNavBar.tsx         # Floating bottom navigation bar
│   │   ├── MobileChrome.tsx         # Status bar & custom SVG illustrations
│   │   ├── SupabaseSetupModal.tsx   # Runtime Supabase connection & SQL modal
│   │   └── WalletVisuals.tsx        # Card branding, category badges & bank/e-money helpers
│   ├── context/
│   │   └── BankersContext.tsx       # Global state, live financial calculations & Supabase sync
│   ├── data/
│   │   └── onboardingQuestions.ts   # 8-step English onboarding questions
│   ├── lib/
│   │   ├── ocrEngine.ts             # Tesseract.js OCR runner & receipt/admin-fee parser
│   │   └── supabase.ts              # Supabase client & runtime configuration helpers
│   ├── screens/
│   │   ├── SignUpScreen.tsx         # Sign Up with mandatory Agreement disclaimer modal
│   │   ├── SignInScreen.tsx         # Sign In screen
│   │   ├── OnboardingScreen.tsx     # 8-step onboarding questionnaire
│   │   ├── HomeScreen.tsx           # Financial Health, Net Worth & AI Insights dashboard
│   │   ├── WalletScreen.tsx         # Stacked wallet cards & per-card history/edit modals
│   │   ├── AddWalletScreen.tsx      # Add card with custom Bank / E-Money name support
│   │   ├── UploadBillScreen.tsx     # Gallery upload & live Camera OCR scanner
│   │   ├── EditTransactionScreen.tsx# Review/edit OCR items, select wallet & quick fee presets
│   │   ├── TransactionSavedScreen.tsx # Confirmation screen after saving transactions
│   │   ├── HistoryScreen.tsx        # All-wallet filterable transaction history
│   │   ├── NotificationsScreen.tsx  # Activity & insight notifications
│   │   └── ProfileScreen.tsx        # Account profile, reports & interactive Feedback modal
│   ├── App.tsx                      # Mobile viewport frame & top preview switcher bar
│   └── main.tsx                     # Application entry point
├── .env.example                     # Safe environment variable template
├── .gitignore                       # Git ignore rules (excludes node_modules, dist, .env)
├── supabase_schema.sql              # Supabase PostgreSQL schema for users & feedback
└── package.json
```
