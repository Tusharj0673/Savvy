# Savvy – Personal Finance Dashboard

Savvy is a **Next.js 15 + React 19** personal finance application that helps users manage accounts, transactions, budgets, and receive automated email alerts and monthly reports.

---

## 🚀 Tech Stack

- **Next.js** 15.0.3 (App Router)
- **React** 19.0.0
- **Node.js** 18.x / 20.x
- **Prisma** 6.19.0
- **PostgreSQL**
- **Tailwind CSS v4**
- **Clerk** – Authentication
- **Inngest** – Background jobs & cron
- **Resend + React Email** – Emails
- **Arcjet** – Security & rate limiting
- **Gemini AI** – Financial insights

---

## ✅ System Requirements

Make sure you have:

- **Node.js** `>= 18.18.0` (recommended: **Node 20 LTS**)
- **npm** `>= 9`
- **PostgreSQL** database

> ⚠️ This project is built and tested specifically with **Next.js 15 + React 19**.  
> Using older versions may cause runtime or type issues.

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/Tusharj0673/Savvy.git
cd Savvy

# ===============================
# Database
# ===============================
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# ===============================
# Clerk Authentication
# ===============================
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_WEBHOOK_SECRET=

# ===============================
# Email (Resend)
# ===============================
RESEND_API_KEY=

# ===============================
# AI Insights (Gemini)
# ===============================
GEMINI_API_KEY=

# ===============================
# Security (Arcjet)
# ===============================
ARCJET_KEY=



