# Personal Expense Tracker

A personal finance, budget allocation, and milestone-based savings tracker built with React and JavaScript.

## What the Project Does

Tracking personal expenses without a proper tool often means maintaining scattered notes or complex spreadsheets, which are hard to keep up with over time.

The goal was to build a simple web application where a person can log daily expenses, follow a structured budget, and plan savings without relying on any external service or account.

The app was built using React and JavaScript. It lets users add and categorize transactions, apply the 50/30/20 budget rule to their income, and create savings milestones. All data is saved in the browser itself using local storage.

Users get a clear view of their spending, stay within their budget limits, and track savings progress, all without sharing any data with a server.

## Why It Is Useful

1. No account or sign-up is required to use it.
2. Your data stays only in your browser and is never shared with anyone.
3. You can see how your spending compares to the 50/30/20 budget rule.
4. You can set savings goals and check your progress over time.
5. You can download your expenses as a CSV file to open in Excel or Google Sheets.
6. The app works without an internet connection after the page has loaded.

## Getting Started

### Prerequisites

[Node.js](https://nodejs.org/) v18 or later and npm.

### Installation

```bash
git clone https://github.com/vidhyawalke/Personal-Expense-Tracker.git
cd Personal-Expense-Tracker/frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Features

Transaction Management — Log, edit, and categorize expenses with live search and one-click CSV export

50/30/20 Budget Allocation — Instant income breakdown into Needs, Wants, and Savings

Goal Savings Milestones — Weekly, monthly, or yearly milestone blocks with progress tracking and deposit markers

Interactive Guide — Built-in popup explaining milestone capacity and pacing calculations

Real-Time Clock and Custom Profile — Live clock with configurable income, spending limits, and currency symbol

Privacy-First — 100% client-side; no backend, no account required

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BudgetPlanner.jsx   # Milestone goal planner and 50/30/20 rules
│   │   │   ├── ClockWidget.jsx     # Live real-time clock widget
│   │   │   └── ExpenseList.jsx     # Transaction ledger and CSV export
│   │   ├── utils/
│   │   │   ├── categoryColors.js   # Category color palettes
│   │   │   └── trackerLogic.js     # Pure JavaScript financial formulas
│   │   ├── App.jsx                 # Global state and storage controller
│   │   ├── App.css                 # Application styles
│   │   ├── index.css               # Design system and CSS tokens
│   │   └── main.jsx                # Application root mount
│   ├── package.json
│   └── vite.config.js
├── package.json
└── vercel.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, JavaScript (ESNext) |
| Tooling | Vite |
| Styling | Vanilla CSS3 with custom properties |
| Icons | Lucide React |
| Effects | Canvas Confetti |
| Storage | Browser LocalStorage |

## Getting Help

If you run into issues or have questions, open a [GitHub Issue](https://github.com/vidhyawalke/Personal-Expense-Tracker/issues) in this repository.

## Maintainer

Built and maintained by [Vidhya Walke](https://github.com/vidhyawalke).

Contributions, bug reports, and suggestions are welcome via pull request or issue.
