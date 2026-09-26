from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os

from backend.tracker_logic import (
    load_expenses,
    save_expenses,
    add_expense,
    update_expense,
    delete_expense,
    list_expenses,
    get_summary,
    check_budget_status,
    load_budget,
    save_budget,
    export_to_csv,
    get_analytics_data,
    STANDARD_CATEGORIES
)

app = FastAPI(
    title="Harmony Expense Tracker API",
    description="REST API for financial wellness, balanced budgeting, and growth tracking."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    category: Optional[str] = "Other"
    date: Optional[str] = None

class ExpenseUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    date: Optional[str] = None

class BudgetUpdate(BaseModel):
    monthly_income: Optional[float] = Field(None, ge=0)
    monthly_budget: Optional[float] = Field(None, ge=0)
    categories_budget: Optional[Dict[str, float]] = None
    savings_target: Optional[Dict[str, Any]] = None
    saved_boxes: Optional[List[Any]] = None
    checklist: Optional[List[Dict[str, Any]]] = None

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Harmony Expense Tracker API",
        "version": "2.0.0",
        "description": "Financial wellness, growth tracking, and balanced budgeting."
    }

@app.get("/api/categories")
def get_standard_categories():
    return {"categories": STANDARD_CATEGORIES}

@app.get("/api/expenses")
def get_all_expenses(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100)
):
    """Fetch expense records with optional category, search, and date filters."""
    return list_expenses(category_filter=category, search=search, month=month, year=year)

@app.post("/api/expenses")
def create_new_expense(payload: ExpenseCreate):
    """Add a new expense transaction."""
    try:
        item, warning = add_expense(
            description=payload.description,
            amount=payload.amount,
            category=payload.category,
            date=payload.date
        )
        return {"success": True, "expense": item, "warning": warning}
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

@app.put("/api/expenses/{expense_id}")
def update_existing_expense(expense_id: int, payload: ExpenseUpdate):
    """Update an existing expense by ID."""
    try:
        updated = update_expense(
            expense_id=expense_id,
            description=payload.description,
            amount=payload.amount,
            category=payload.category,
            date=payload.date
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Expense record not found.")
        return {"success": True, "expense": updated}
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

@app.delete("/api/expenses/{expense_id}")
def remove_expense(expense_id: int):
    """Delete an expense record by ID."""
    success = delete_expense(expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense record not found.")
    return {"success": True, "message": "Expense record deleted successfully."}

@app.get("/api/summary")
def get_expense_summary(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100)
):
    """Get summarized expense metrics and category allocations."""
    try:
        return get_summary(month=month, year=year)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

@app.get("/api/budget")
def get_budget_details():
    """Retrieve current budget settings, category limits, growth targets, and checklist."""
    return load_budget()

@app.post("/api/budget")
def update_budget_details(payload: BudgetUpdate):
    """Update budget allocations, income, savings milestones, or daily checklist."""
    current = load_budget()

    if payload.monthly_income is not None:
        current["monthly_income"] = payload.monthly_income
    if payload.monthly_budget is not None:
        current["monthly_budget"] = payload.monthly_budget
    if payload.categories_budget is not None:
        current["categories_budget"] = payload.categories_budget
    if payload.savings_target is not None:
        current["savings_target"] = payload.savings_target
    if payload.saved_boxes is not None:
        if "savings_target" not in current:
            current["savings_target"] = {"goal": 20000.0, "target_box_amount": 200.0, "saved_boxes": []}
        current["savings_target"]["saved_boxes"] = payload.saved_boxes
    if payload.checklist is not None:
        current["checklist"] = payload.checklist

    save_budget(current)
    return {"success": True, "budget": current}

@app.get("/api/analytics")
def get_analytics():
    """Retrieve comprehensive spending breakdown, 50/30/20 rule analytics, and savings rate."""
    return get_analytics_data()

@app.get("/api/export")
def export_csv_file():
    """Generate and download expense history in CSV format."""
    csv_path = export_to_csv("expenses_export.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=500, detail="Failed to generate CSV export file.")
    return FileResponse(
        csv_path,
        media_type="text/csv",
        filename="harmony_expenses_export.csv"
    )
