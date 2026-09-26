# Personal Expense Tracker

A personal finance, budget allocation, and milestone-based savings tracker built with React and JavaScript.

## What the Project Does

Managing everyday finances without a backend, an account, or a subscription is harder than it should be. This project solves that by putting full financial clarity directly in the browser.

It lets users log and categorize daily transactions, monitor real-time 50/30/20 budget allocations, and plan structured savings milestones — all without a server, a database, or any data leaving the device.

The goal was to build something that feels as fast and trustworthy as a spreadsheet but far more intuitive: a single-page application that loads instantly, persists state in LocalStorage, and handles the financial math in clean, modular JavaScript.

The result is a zero-latency, privacy-first finance tool where users gain immediate visibility into their spending habits and savings progress — with no hosting costs and no maintenance overhead.

## Why It Is Useful

Most personal finance tools demand a cloud account, a monthly subscription, or both. This project takes a different approach — everything runs in the browser, with no sign-up and no data sent to any server. It gives users immediate feedback on how their spending aligns with the 50/30/20 rule, tracks savings progress through structured milestone blocks, and lets them export their data to a clean CSV at any time. It also works fully offline once the page has loaded.

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
