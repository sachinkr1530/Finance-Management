# 💰 FinanceAI - AI-Powered Personal Finance Management   URL=>  https://finance-management-eta-sable.vercel.app/


## ✨ Features

### 🏦 Core Features
- **JWT Authentication** - Secure signup/login with bcrypt password hashing
- **Dashboard** - Real-time balance, savings, expenses, and health score
- **Expense Management** - Add/Edit/Delete with categories, search, and filters
- **Goal Planning** - Animated progress bars, predictions, and savings tracking
- **Salary & Income** - Track multiple income sources
- **Subscription Tracker** - Monitor recurring payments with AI insights



### 🤖 AI Features
- **AI Financial Advisor (FinWise)** - Chat-based financial advice
- **Affordability Analysis** - "Can I buy a ₹40,000 laptop?"
- **Spending Insights** - AI-powered spending pattern analysis
- **Future Predictions** - 3-month financial forecasts
- **Smart Notifications** - Overspending alerts, goal reminders

### 📊 Analytics
- Monthly expense charts (Area/Bar)
- Category pie charts
- Savings growth trends
- Financial health score (0-100)
- Income vs Expense comparisons




### 🎯 Advanced Features
- 🎤 **Voice Expense Input** - "Aaj ₹300 food pe kharch hua"
- 🔔 **Smart Notifications** - Overspending, budget, goal alerts
- 📈 **Financial Health Score** - Comprehensive 0-100 scoring
- 🔮 **Future Predictions** - AI-powered financial forecasting
- 📺 **Subscription Review** - AI detects unnecessary subscriptions
- 🌙 **Dark/Light Mode** - Beautiful theme switching




## 🛠 Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Redux Toolkit
- React Router v6
- Recharts
- Framer Motion
- Axios

### Backend
- Node.js + Express.js
- JWT + bcrypt
- MongoDB + Mongoose

### AI
- OpenAI GPT-4o-mini (with fallback)




## 📁 Project Structure

```
finance-ai/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Modal, StatCard, LoadingSpinner
│   │   │   └── ui/
│   │   ├── pages/            # All page components
│   │   ├── redux/            # Redux store & slices
│   │   │   └── slices/       # auth, expense, goal, theme, notification
│   │   ├── layouts/          # Dashboard layout with sidebar
│   │   ├── services/         # API service layer (Axios)
│   │   ├── utils/            # Helper functions
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/               # DB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── services/             # AI, notifications
│   ├── utils/
│   ├── server.js             # Entry point
│   └── package.json
│
└── README.md
```



## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- OpenAI API key (optional - app works with fallback)

### 1. Clone & Install

```bash
# Install server dependencies
cd finance-ai/server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

```bash
# Copy and edit server environment
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finance-ai
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
OPENAI_API_KEY=your_openai_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Run the App

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm start
```

Visit `http://localhost:3000`

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses/add` | Add expense |
| GET | `/api/expenses/all` | Get all expenses |
| GET | `/api/expenses/stats` | Get expense stats |
| PUT | `/api/expenses/update/:id` | Update expense |
| DELETE | `/api/expenses/delete/:id` | Delete expense |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/goals/create` | Create goal |
| GET | `/api/goals/all` | Get all goals |
| PUT | `/api/goals/update/:id` | Update goal |
| POST | `/api/goals/add-savings/:id` | Add savings to goal |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI advisor |
| POST | `/api/ai/analyze` | Get financial analysis |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/monthly` | Monthly analytics |
| GET | `/api/analytics/health-score` | Financial health score |
| GET | `/api/analytics/predictions` | Future predictions |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions/create` | Add subscription |
| GET | `/api/subscriptions/all` | Get all subscriptions |
| PUT | `/api/subscriptions/update/:id` | Update subscription |
| DELETE | `/api/subscriptions/delete/:id` | Delete subscription |

## 🔐 Security Features
- JWT token authentication
- bcrypt password hashing (salt rounds: 12)
- Protected API routes
- Input validation & sanitization
- Rate limiting (100 req/15min)
- CORS configuration
- Helmet security headers

## 📱 Responsive Design
- Mobile-first approach
- Collapsible sidebar
- Adaptive grids
- Touch-friendly interface
- Beautiful on all screen sizes

## 🎨 UI Highlights
- Premium fintech aesthetic
- Glass morphism cards
- Smooth animations (Framer Motion)
- Interactive charts (Recharts)
- Gradient accents
- Dark/Light mode with persistence

## 📄 License
MIT License - feel free to use this project for personal or commercial purposes.
#


# My Project

## Home Page


## Login Page
![Login](./screenshot/login.png)

## Dashboard
![Dashboard](./screenshot/Dashboard.jpeg)
