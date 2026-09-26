# Personal Expense Tracker

A modern personal finance, budget allocation, and milestone-based savings tracker built with React and JavaScript.

## Features

- **Transaction Management**: Quickly log, edit, and organize daily expenses by category with instant search and CSV export.
- **Goal Savings Milestones**: Plan savings by week, month, or year with scheduled milestone blocks, start and end dates, and automated tracking of your latest deposit.
- **50/30/20 Budget Allocation**: Real-time breakdown of essential Needs (50%), discretionary Wants (30%), and Growth Savings (20%).
- **Interactive Guide**: Built-in information tool explaining how your milestone plan and capacity calculations work in plain English.
- **Real-Time Clock & Custom Profile**: Live digital clock with customizable baseline income, spending limits, and currency.
- **Zero Server Setup**: Fully client-side state persistence using browser storage.

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Local Development
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BudgetPlanner.jsx   # Milestone goal planner & 50/30/20 rules
│   │   │   ├── ClockWidget.jsx     # Live real-time clock widget
│   │   │   └── ExpenseList.jsx     # Transaction ledger & CSV export
│   │   ├── utils/
│   │   │   ├── categoryColors.js   # Category color palettes
│   │   │   └── trackerLogic.js     # Pure JavaScript financial formulas
│   │   ├── App.jsx                 # Workspace controller & storage
│   │   ├── App.css                 # Application styles
│   │   ├── index.css               # Design system & CSS tokens
│   │   └── main.jsx                # Application root mount
│   ├── package.json
│   └── vite.config.js
├── package.json
└── vercel.json
```

## Tech Stack

- **Framework**: React 19, Vite
- **Styling**: Vanilla CSS3 Design System with frosted glass aesthetics
- **Icons & Effects**: Lucide React, Canvas Confetti
- **Storage**: Browser LocalStorage
