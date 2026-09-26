# Personal Expense Tracker

A modern personal finance, budget allocation, and milestone-based savings tracker built with React and JavaScript.

---

## 🎯 Project Overview (STAR Method for Interviews)

### **Situation**
Managing everyday expenses, tracking budget limits, and staying committed to savings targets usually requires bulky spreadsheets or invasive third-party apps that compromise financial privacy and have steep learning curves.

### **Task**
Create a fast, responsive, and privacy-focused client-side web application where users can log daily transactions, monitor real-time 50/30/20 budget allocations, and track scheduled savings milestones without needing a backend server or account creation.

### **Action**
- **Architecture & Performance**: Built a single-page React 19 application using Vite for instant load times and pure CSS custom properties for a consistent, accessible design system.
- **Financial Business Logic**: Modularized financial math in pure JavaScript (`trackerLogic.js`) to handle round-safe currency calculations, budget utilization pacing, and dynamic milestone schedules.
- **Data Portability & Integrity**: Implemented clean CSV export with sanitized integer IDs compatible with spreadsheet software (Excel, Google Sheets) and persistent client-side storage via LocalStorage.
- **UX & Gamification**: Designed milestone savings blocks with visual progress tracking, interactive popup guides, and celebratory feedback upon goal achievements.

### **Result**
Delivered an elegant, zero-latency financial tracking tool that operates 100% in the browser. Users gain immediate clarity on their spending habits and savings progress with complete data privacy and zero hosting or database maintenance costs.

---

## ✨ Features

- **Transaction Management**: Quickly log, edit, and categorize daily expenses with live search filters and one-click CSV export.
- **Goal Savings Milestones**: Plan savings by week, month, or year with structured milestone blocks, timeline projections, and latest-deposit markers.
- **50/30/20 Budget Allocation**: Instant breakdown of income into essential Needs (50%), discretionary Wants (30%), and Growth Savings (20%).
- **Interactive Guide**: Built-in information popup explaining how your milestone plan and capacity calculations work in plain English.
- **Real-Time Clock & Custom Profile**: Live digital clock with customizable baseline income, spending limits, and currency symbols.
- **Privacy-First Architecture**: 100% client-side state persistence using browser storage.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript (ESNext)
- **Tooling**: Vite
- **Styling**: Vanilla CSS3 Design Tokens
- **Icons & Effects**: Lucide React, Canvas Confetti
- **Storage**: Browser LocalStorage

---

## 🚀 Getting Started

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

---

## 📁 Project Structure

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
