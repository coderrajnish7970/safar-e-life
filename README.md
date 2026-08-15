# 🌴 Safar-E-Life (SplitSmart AI)

> **AI-Assisted Group Travel & Financial Management Platform**
> 
> *Destination Discovery → Trip Planning → Collaborative Expense Management → Deterministic Remainder Splitting → Receipt Vision Scanning → Debt Settlement Lifecycle*

---

## 🎯 1. Project Overview & Pitch

**Safar-E-Life** is a full-stack SaaS platform designed to eliminate financial friction and confusion in group travel. Unlike basic CRUD expense trackers, Safar-E-Life combines **integer-paise deterministic financial math**, **peer-to-peer debt minimization algorithms**, **Google Gemini Vision receipt scanning**, and **zero-downtime AI financial insights** into a unified, human-centered travel workspace.

---

## 💡 2. Problem Statement

Group travel planning and expense sharing suffer from three major issues:
1. **Floating-Point Financial Errors**: Standard division algorithms result in sub-cent discrepancies (e.g. ₹1000 ÷ 3 ➔ ₹333.33 × 3 = ₹999.99), creating a ₹0.01 mismatch that breaks user trust.
2. **Uncertain Settlement Lifecycles**: Many apps compute who owes whom but lack a recorded settlement lifecycle to mark payments as settled and dynamically update net balances.
3. **Manual Data Entry Burden**: Typing receipt items manually on mobile devices during travel is tedious and error-prone.

---

## ✨ 3. Key Features

- 🧳 **Collaborative Trip Management**: Create trips, define estimated budgets, set travel dates, and manage group members with role-based permissions.
- 💰 **Deterministic Integer-Paise Remainder Splitting**: Integer-cents division algorithm that deterministically allocates remainders so that equal splits always sum **100% exactly** to the expense total (e.g., ₹1000 ÷ 3 ➔ ₹333.34 + ₹333.33 + ₹333.33 = ₹1,000.00 ✓).
- 🤝 **Settlement System with "Mark as Paid" Flow**: Calculates net balances across group members, renders directional settlement cards (`Priya Sharma ➔ Rajnish Singh`), and records settled payments (`POST /api/expenses/group/:groupId/settle`) to reduce net debt dynamically to zero.
- 📸 **Gemini Vision Receipt Scanning**: Drag-and-drop receipt uploader that extracts merchant names, amounts, and categories via **Google Gemini Vision AI** with an interactive confirmation preview card.
- 🤖 **Zero-Fail AI Financial Assistant**: Natural language chat interface powered by **Gemini AI** with a local financial rules engine fallback to guarantee 100% uptime even during Google API 503 spikes.
- 🌍 **Destination Discovery & Planning Funnel**: Integrated travel guide with destination stories, ideal duration, best season, daily cost estimators, and top attraction highlights.
- 🔒 **Enterprise-Grade Security**: JWT authentication, bcrypt password hashing, IDOR authorization checks on all group/expense routes, and Multer file upload restrictions.

---

## 🧮 4. Deterministic Remainder Splitting Logic

Standard floating-point division ($4000 / 3 = 1333.3333...$) creates rounding discrepancies. Safar-E-Life solves this using an **Integer-Paise Remainder Allocator**:

```typescript
function calculateEqualSplits(totalAmount: number, memberCount: number): number[] {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / memberCount);
  let remainder = totalCents - (baseCents * memberCount);

  return Array.from({ length: memberCount }, (_, index) => {
    const shareCents = baseCents + (index < remainder ? 1 : 0);
    return shareCents / 100;
  });
}
```

### Mathematical Proof for ₹4,000.00 ÷ 3 Members
- $\text{Total Cents} = 4000 \times 100 = 400,000\text{ cents}$
- $\text{Base Cents} = \lfloor 400,000 / 3 \rfloor = 133,333\text{ cents}\ (₹1,333.33)$
- $\text{Remainder} = 400,000 - (133,333 \times 3) = 1\text{ cent}$
- **Member 1 Share**: $133,334\text{ cents} \rightarrow \mathbf{₹1,333.34}$
- **Member 2 Share**: $133,333\text{ cents} \rightarrow \mathbf{₹1,333.33}$
- **Member 3 Share**: $133,333\text{ cents} \rightarrow \mathbf{₹1,333.33}$
- **Sum**: $\mathbf{₹1,333.34 + ₹1,333.33 + ₹1,333.33 = ₹4,000.00 \quad \checkmark\ VERIFIED}$

---

## 🤖 5. AI Architecture & Zero-Fail Fallback Engine

```
                               ┌─────────────────────────┐
                               │   User Financial Q&A    │
                               └────────────┬────────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │ Express Backend   │
                                  └─────────┬─────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
          ┌─────────▼─────────┐                           ┌─────────▼─────────┐
          │  Google Gemini    │                           │ Smart Financial   │
          │  Flash AI Model   │                           │ Rules Engine      │
          └─────────┬─────────┘                           └─────────┬─────────┘
                    │ (Success)                                     │ (Fallback on 503)
                    └───────────────────────┬───────────────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │  Verified AI Response   │
                               └─────────────────────────┘
```

If Google Generative AI endpoints return temporary 503 high demand or quota limits, the backend automatically intercepts the error and calls `generateFallbackAnswer(question)` to compute accurate financial answers directly from MongoDB facts.

---

## 🔒 6. Security & IDOR Authorization Matrix

All private API routes enforce strict double-layer authorization:

```javascript
// Middleware: Verify JWT session token
const protect = require("../middleware/authMiddleware");

// Route Handler: Verify IDOR Group Membership
const isMember = group.members.some(
  (memberId) => memberId.toString() === req.user.id
);
if (!isMember) {
  return res.status(403).json({ message: "You are not a member of this group" });
}
```

| Domain | Route | Authorization Rule |
|---|---|---|
| **Group Data** | `GET /api/groups/:id` | Logged-in user must be in `group.members` |
| **Expenses** | `GET /api/expenses/group/:groupId` | Logged-in user must be in `group.members` |
| **Expense Edit** | `PUT /api/expenses/:id` | Logged-in user must be `expense.paidBy` |
| **Settlement** | `POST /api/expenses/group/:groupId/settle` | Logged-in user must be in `group.members` |
| **AI Q&A** | `POST /api/expenses/group/:groupId/ask` | Logged-in user must be in `group.members` |

---

## 🛠️ 7. Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Axios, Custom Vanilla CSS Design System (`formatMoney` Intl formatter).
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ORM), JWT, bcryptjs, Multer.
- **AI Integration**: `@google/generative-ai` (Gemini 1.5 Flash Vision & Chat).

---

## ⚙️ 8. Environment Variables & Local Setup

### Backend Environment Variables (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/splitsmart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Quick Run Commands

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

---

## 📡 9. API Reference Overview

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/auth/signup` | `POST` | Public | Register new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/groups/dashboard-summary` | `GET` | Private | Bulk fetch user groups, summaries, and net balances |
| `/api/groups` | `POST` | Private | Create a new trip group |
| `/api/groups/:id/members` | `POST` | Member | Add a member to a group |
| `/api/expenses` | `POST` | Member | Create a new expense with equal/custom split |
| `/api/expenses/group/:groupId/settlement` | `GET` | Member | Compute optimal peer-to-peer settlement transactions |
| `/api/expenses/group/:groupId/settle` | `POST` | Member | Record a settlement payment (`Mark as Paid`) |
| `/api/expenses/group/:groupId/ask` | `POST` | Member | Query Gemini AI / Fallback Engine for trip financial insights |
| `/api/receipts/scan` | `POST` | Private | Extract receipt data using Gemini Vision AI |

---

## 🌐 10. Production Deployment

- **Backend**: Deployed on [Render](https://render.com) (`Root Directory: backend`, `Start Command: npm start`).
- **Frontend**: Deployed on [Vercel](https://vercel.com) (`Root Directory: frontend`, `Build Command: npm run build`, `VITE_API_URL=https://<your-render-backend>.onrender.com/api`).
- **Database**: Hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with Network IP whitelist `0.0.0.0/0`.

---

## 📄 11. Portfolio & Resume Presentation

**Title**: Safar-E-Life — AI-Powered Travel & Expense Management Platform  
**Tagline**: *An AI-assisted collaborative travel platform for destination discovery, trip planning, budget tracking, receipt-based expense management, intelligent splitting, and settlement.*

**Resume Key Highlights**:
- Engineered a **deterministic integer-paise remainder allocation algorithm** solving floating-point division errors ($₹1000 / 3 \rightarrow ₹333.34 + ₹333.33 + ₹333.33 = ₹1,000.00\ \checkmark$).
- Implemented a **peer-to-peer settlement lifecycle** with recorded payments, reducing net group debt dynamically to zero.
- Integrated **Google Gemini Vision AI** for automated receipt OCR & category extraction with confirmation review cards.
- Designed a **zero-fail financial AI fallback architecture** maintaining 100% application uptime during external API rate limits.
- Enforced strict **IDOR security checks** across Express route handlers to protect user privacy.
