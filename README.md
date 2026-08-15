# 🌴 SplitSmart AI (सफ़र-ए-Life)

> **AI-Powered Group Travel Expense Management & Financial Intelligence Platform**

SplitSmart AI is a modern full-stack web application designed for group travelers to effortlessly track trip budgets, split expenses dynamically, scan receipts using **Google Gemini Vision AI**, and receive intelligent AI spending insights and debt settlement plans.

---

## ✨ Features

- 🧳 **Group Trip Management**: Create trips, set estimated budgets, track trip dates, and invite members.
- 💸 **Smart Expense Splitting**: Split expenses equally or with custom amounts across group members.
- 💳 **Debt Minimization Algorithm**: Automatically calculates optimal peer-to-peer settlement transactions to settle group balances with minimal transfers.
- 📸 **AI Receipt Scanning**: Upload receipt photos to extract total amounts, merchant descriptions, and spending categories using **Gemini 1.5 Vision API**.
- 💬 **Safar AI Financial Chatbot**: Natural language Q&A interface powered by **Gemini 1.5 Flash** to analyze trip spending, budget scenarios, and savings recommendations.
- 📊 **Spending Analytics**: Rule-based & AI-driven insights highlighting top categories, budget overruns, and top payers.
- 🔒 **Security & Authentication**: JWT-based session security, password hashing with bcrypt, IDOR route protection, and Multer file upload restrictions.

---

## 🛠️ Technology Stack

### **Backend**
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM) with indexing
- **Security:** JWT (`jsonwebtoken`), `bcryptjs`, CORS middleware
- **AI SDK:** `@google/generative-ai` (Gemini 1.5 Flash)
- **File Uploads:** Multer with file type & size limits

### **Frontend**
- **Framework:** React, Vite
- **Routing:** React Router DOM (with `<ProtectedRoute>` client guards)
- **HTTP Client:** Axios (with 401 interceptor & environment configuration)
- **Styling:** Custom CSS with Glassmorphism, HSL color tokens, dark mode design system

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB server running locally or MongoDB Atlas URI
- Google Gemini API Key ([Get a free key at Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Set Up Backend

```bash
cd splitsmart-ai/backend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

Edit `.env` and fill in your keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/splitsmart
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:
```bash
npm start
```

### 2. Set Up Frontend

```bash
cd splitsmart-ai/frontend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

Start the frontend development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Architecture Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/signup` | `POST` | Public | Register a new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & get JWT token |
| `/api/groups/dashboard-summary` | `GET` | User | Bulk fetch user groups, summaries & net balances |
| `/api/groups` | `POST` | User | Create a new trip group |
| `/api/groups/:id/members` | `POST` | Member | Add a user to a trip group |
| `/api/expenses` | `POST` | Member | Add an expense to a group |
| `/api/expenses/group/:groupId` | `GET` | Member | Fetch all group expenses |
| `/api/expenses/group/:groupId/settlement` | `GET` | Member | Get optimized debt settlement transactions |
| `/api/expenses/group/:groupId/ask` | `POST` | Member | Ask Gemini AI questions about trip finances |
| `/api/receipts/scan` | `POST` | User | Scan receipt image via Gemini 1.5 Vision |

---

## 🧪 License & Portfolio Usage

Created as a showcase full-stack project demonstrating clean Node.js architecture, Mongoose optimization, modern React practices, and Gemini AI integration.
