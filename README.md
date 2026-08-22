# Harmony Expense Tracker

A modern personal financial wellness application designed around growth, balance, and mindful money management. Built with a FastAPI Python backend, a command line interface, and a React Vite frontend.

## Overview

Harmony Expense Tracker provides comprehensive expense tracking, budget allocation, and analytics. It helps users manage daily expenditures, maintain financial discipline, and achieve long term savings milestones.

## Technology Stack

1. Backend: Python 3.8+, FastAPI, Uvicorn, Pydantic
2. Frontend: React 19, Vite, Vanilla CSS3, Lucide React, Canvas Confetti
3. Testing: Pytest, HTTPX, Oxlint
4. Storage: Atomic JSON file persistence with automated directory initialization

## Core Features

1. Executive Financial Dashboard: Real time summaries of monthly income, total expenditures, remaining budget balance, savings rate, and financial discipline checklist.
2. Live Clock Widget: Real time digital clock showing current local hours, minutes, seconds, and full date.
3. Transaction Management: Full create, read, update, and delete operations with keyword search, category filtering, custom dates, and CSV export.
4. Balanced Budget Planner: Implementation of the 50 30 20 financial allocation model for Essential Needs (50%), Mindful Discretionary (30%), and Growth Savings (20%).
5. Financial Growth Matrix: Structured milestone roadmap of 100 incremental capital building steps.
6. Analytics and Insights: Category allocation percentages, highest transaction metrics, average spending calculations, and financial wellness score.

## Installation and Setup

1. Clone the repository and navigate to the project directory.

2. Install Python dependencies:
```bash
pip install fastapi uvicorn pydantic pytest httpx
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

## Running the Application

To launch both the FastAPI backend server and the React frontend simultaneously:
```bash
python run_app.py
```

To run the backend server individually:
```bash
python run_server.py
```
Or start uvicorn directly:
```bash
uvicorn backend.server:app --reload --port 8000
```

To run the frontend dev server individually:
```bash
cd frontend
npm run dev
```

The web application runs locally at http://localhost:5173 and connects to the backend API at http://127.0.0.1:8000.

## Command Line Interface

The application includes a command line interface script located at cli.py for terminal usage.

1. List all recorded expenses:
```bash
python cli.py list
```

2. View summary of expenses:
```bash
python cli.py summary
```

3. Add a new expense:
```bash
python cli.py add
```

4. Update an existing expense by identifier:
```bash
python cli.py update
```

5. Delete an expense by identifier:
```bash
python cli.py delete
```

6. Export records to CSV:
```bash
python cli.py export
```

7. View or configure monthly budget:
```bash
python cli.py budget
```

## REST API Endpoints

1. GET /api/expenses: Retrieve expense records with optional category, search, month, and year query parameters.
2. POST /api/expenses: Create a new expense record with description, amount, category, and date.
3. PUT /api/expenses/{id}: Update an existing expense record by ID.
4. DELETE /api/expenses/{id}: Remove an expense record by ID.
5. GET /api/summary: Retrieve total spending, monthly average, and category allocations.
6. GET /api/budget: Retrieve budget limits, income, and checklist status.
7. POST /api/budget: Update budget limits, income, and checklist status.
8. GET /api/analytics: Retrieve 50 30 20 breakdown and category percentage metrics.
9. GET /api/export: Download full expense history in CSV spreadsheet format.
10. GET /api/categories: Retrieve standard category list.

## Quality Assurance and Testing

The project includes an automated test suite verifying backend logic, input validation, and REST API endpoints.

Execute all backend test suites:
```bash
python -m pytest tests -v
```

Execute frontend build verification:
```bash
cd frontend && npm run build
```

Execute frontend code analysis:
```bash
cd frontend && npm run lint
```

## Project Directory Structure

```
Harmony Expense Tracker/
├── backend/
│   ├── init.py
│   ├── server.py
│   └── tracker_logic.py
├── data/
│   ├── budget.json
│   └── expenses.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.jsx
│   │   │   ├── BudgetPlanner.jsx
│   │   │   ├── ClockWidget.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ExpenseList.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── tests/
│   ├── test_cli.py
│   ├── test_server.py
│   └── test_tracker_logic.py
├── .gitignore
├── cli.py
├── pytest.ini
├── requirements.txt
├── run_app.py
└── README.md
```

## License

MIT License. Open source and free to use for personal financial management.
