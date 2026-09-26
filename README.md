# Harmony Expense Tracker

A clean, modern personal finance and savings tracker with milestone-based goal planning.

## Features

- **Expense Tracking**: Fast transaction logging, category filtering, search, and CSV export.
- **Goal & Milestone Planner**: Plan savings weekly, monthly, or yearly with exact start/end dates, milestone blocks, and last-saved tracking.
- **50/30/20 Budgeting**: Automatic allocation analysis based on your monthly income.
- **Profile & Live Clock**: Customizable currency, spending limits, and real-time clock widget.

## Quick Start

### 1. Backend (FastAPI)
```bash
pip install -r requirements.txt
python run_app.py
```
Or start uvicorn directly:
```bash
uvicorn backend.server:app --reload --port 8000
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS, Lucide Icons, Canvas Confetti
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **Storage**: JSON file persistence with atomic writes
