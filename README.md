# Personal Expense Tracker

A personal finance, budget allocation, and milestone-based savings tracker built with React and JavaScript.

## What the Project Does

Personal Expense Tracker is a web application that helps you manage your daily spending, plan a budget, and set savings goals.

You can add expenses, assign them a category, and see a breakdown of where your money is going. The app follows the 50/30/20 rule to split your income into needs, wants, and savings. You can also create savings milestones and track how close you are to reaching each one.

All data is stored in your browser. Nothing is sent to any server and no account is needed to use it.

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
