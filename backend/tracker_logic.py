import json
import os
import csv
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Any

# Base path configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
EXPENSES_FILE = os.path.join(DATA_DIR, "expenses.json")
BUDGET_FILE = os.path.join(DATA_DIR, "budget.json")

# Standard Categories for Balanced Budgeting
STANDARD_CATEGORIES = [
    "Housing & Utilities",
    "Food & Dining",
    "Transportation",
    "Health & Wellness",
    "Entertainment",
    "Personal & Shopping",
    "Education & Career",
    "Other"
]

def ensure_files_exist(data_dir: Optional[str] = None, expenses_file: Optional[str] = None, budget_file: Optional[str] = None):
    """
    Ensures data directory and initial JSON storage files exist with valid structures.
    """
    target_data_dir = data_dir or DATA_DIR
    target_expenses_file = expenses_file or EXPENSES_FILE
    target_budget_file = budget_file or BUDGET_FILE

    if not os.path.exists(target_data_dir):
        os.makedirs(target_data_dir, exist_ok=True)

    if not os.path.exists(target_expenses_file):
        _atomic_save_json(target_expenses_file, {"expenses": []})

    if not os.path.exists(target_budget_file):
        default_budget = {
            "monthly_income": 3500.0,
            "monthly_budget": 2400.0,
            "categories_budget": {
                "Housing & Utilities": 900.0,
                "Food & Dining": 550.0,
                "Transportation": 300.0,
                "Health & Wellness": 200.0,
                "Entertainment": 200.0,
                "Personal & Shopping": 150.0,
                "Education & Career": 100.0
            },
            "savings_target": {
                "goal": 20000.0,
                "target_box_amount": 200.0,
                "saved_boxes": []
            },
            "checklist": [
                {"id": 1, "text": "Reviewed daily expenditures and logged all transactions", "checked": False},
                {"id": 2, "text": "Maintained balanced spending within category allocations", "checked": False},
                {"id": 3, "text": "Set aside target allocation for savings and growth", "checked": False},
                {"id": 4, "text": "Made mindful and value-aligned purchasing decisions", "checked": False}
            ]
        }
        _atomic_save_json(target_budget_file, default_budget)

def _atomic_save_json(filepath: str, data: Any):
    """
    Safely writes data to a temporary file and atomically renames it.
    Prevents file corruption on process interruption.
    """
    dir_name = os.path.dirname(filepath)
    if dir_name and not os.path.exists(dir_name):
        os.makedirs(dir_name, exist_ok=True)
    temp_path = f"{filepath}.tmp"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(temp_path, filepath)

def load_expenses(expenses_file: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Loads all expense records from the storage file.
    """
    target_file = expenses_file or EXPENSES_FILE
    ensure_files_exist(expenses_file=target_file)
    try:
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("expenses", [])
    except Exception as exc:
        print(f"Notice: Failed to read expenses file: {exc}")
        return []

def save_expenses(expenses_list: List[Dict[str, Any]], expenses_file: Optional[str] = None):
    """
    Persists expense list to JSON file atomically.
    """
    target_file = expenses_file or EXPENSES_FILE
    ensure_files_exist(expenses_file=target_file)
    _atomic_save_json(target_file, {"expenses": expenses_list})

def load_budget(budget_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Loads budget configuration, category limits, and growth goals.
    """
    target_file = budget_file or BUDGET_FILE
    ensure_files_exist(budget_file=target_file)
    try:
        with open(target_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_budget(budget_data: Dict[str, Any], budget_file: Optional[str] = None):
    """
    Persists budget configuration atomically.
    """
    target_file = budget_file or BUDGET_FILE
    ensure_files_exist(budget_file=target_file)
    _atomic_save_json(target_file, budget_data)

def validate_date(date_str: str) -> str:
    """
    Validates that a date string matches YYYY-MM-DD format.
    Raises ValueError if invalid.
    """
    try:
        parsed = datetime.strptime(date_str, "%Y-%m-%d")
        return parsed.strftime("%Y-%m-%d")
    except (ValueError, TypeError):
        raise ValueError("Invalid date format. Please use YYYY-MM-DD.")

def add_expense(
    description: str,
    amount: float,
    category: str = "Other",
    date: Optional[str] = None,
    expenses_file: Optional[str] = None,
    budget_file: Optional[str] = None
) -> Tuple[Dict[str, Any], Optional[str]]:
    """
    Adds a new expense record with robust input validation.
    Returns: (new_expense_dict, budget_warning_or_none)
    """
    cleaned_desc = str(description).strip()
    if not cleaned_desc:
        raise ValueError("Description cannot be empty.")

    try:
        num_amount = round(float(amount), 2)
    except (ValueError, TypeError):
        raise ValueError("Amount must be a valid number.")

    if num_amount <= 0:
        raise ValueError("Amount must be greater than zero.")

    if date:
        formatted_date = validate_date(date)
    else:
        formatted_date = datetime.now().strftime("%Y-%m-%d")

    expenses = load_expenses(expenses_file=expenses_file)
    next_id = max([e.get("id", 0) for e in expenses], default=0) + 1

    new_item = {
        "id": next_id,
        "date": formatted_date,
        "description": cleaned_desc,
        "amount": num_amount,
        "category": category.strip() if category else "Other"
    }

    expenses.append(new_item)
    save_expenses(expenses, expenses_file=expenses_file)

    warning = check_budget_status(formatted_date, expenses_file=expenses_file, budget_file=budget_file)
    return new_item, warning

def update_expense(
    expense_id: int,
    description: Optional[str] = None,
    amount: Optional[float] = None,
    category: Optional[str] = None,
    date: Optional[str] = None,
    expenses_file: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Updates an existing expense record by ID.
    Returns updated item dict, or None if not found.
    """
    try:
        exp_id = int(expense_id)
    except (ValueError, TypeError):
        raise ValueError("Expense ID must be a valid integer.")

    expenses = load_expenses(expenses_file=expenses_file)
    target = None

    for item in expenses:
        if item.get("id") == exp_id:
            target = item
            break

    if not target:
        return None

    if description is not None:
        cleaned_desc = str(description).strip()
        if not cleaned_desc:
            raise ValueError("Description cannot be empty.")
        target["description"] = cleaned_desc

    if amount is not None:
        try:
            num_amount = round(float(amount), 2)
        except (ValueError, TypeError):
            raise ValueError("Amount must be a valid number.")
        if num_amount <= 0:
            raise ValueError("Amount must be greater than zero.")
        target["amount"] = num_amount

    if category is not None:
        target["category"] = str(category).strip() or "Other"

    if date is not None:
        target["date"] = validate_date(date)

    save_expenses(expenses, expenses_file=expenses_file)
    return target

def delete_expense(expense_id: int, expenses_file: Optional[str] = None) -> bool:
    """
    Deletes an expense by its unique identifier.
    Returns True if an expense was deleted, False if ID not found.
    """
    try:
        exp_id = int(expense_id)
    except (ValueError, TypeError):
        return False

    expenses = load_expenses(expenses_file=expenses_file)
    initial_len = len(expenses)
    filtered = [e for e in expenses if e.get("id") != exp_id]

    if len(filtered) < initial_len:
        save_expenses(filtered, expenses_file=expenses_file)
        return True
    return False

def list_expenses(
    category_filter: Optional[str] = None,
    search: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    expenses_file: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns filtered and sorted list of expense records.
    """
    expenses = load_expenses(expenses_file=expenses_file)
    results = expenses

    if category_filter and category_filter.lower() != "all":
        results = [e for e in results if e.get("category", "").lower() == category_filter.lower()]

    if search:
        s = search.lower().strip()
        results = [
            e for e in results
            if s in e.get("description", "").lower() or s in e.get("category", "").lower()
        ]

    if month is not None:
        try:
            target_month = int(month)
            target_year = int(year) if year is not None else datetime.now().year
            filtered_by_date = []
            for e in results:
                try:
                    d = datetime.strptime(e["date"], "%Y-%m-%d")
                    if d.month == target_month and d.year == target_year:
                        filtered_by_date.append(e)
                except ValueError:
                    continue
            results = filtered_by_date
        except (ValueError, TypeError):
            pass

    return sorted(results, key=lambda x: (x.get("date", ""), x.get("id", 0)), reverse=True)

def get_summary(
    month: Optional[int] = None,
    year: Optional[int] = None,
    expenses_file: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculates summary metrics including total, monthly average, and category allocations.
    """
    expenses = load_expenses(expenses_file=expenses_file)
    month_name = None
    target_year = year

    if month is not None:
        try:
            month_int = int(month)
            if not 1 <= month_int <= 12:
                raise ValueError("Month must be between 1 and 12.")
            target_year = year if year is not None else datetime.now().year
            month_name = datetime(target_year, month_int, 1).strftime("%B")

            filtered = []
            for e in expenses:
                try:
                    exp_date = datetime.strptime(e["date"], "%Y-%m-%d")
                    if exp_date.year == target_year and exp_date.month == month_int:
                        filtered.append(e)
                except ValueError:
                    continue
            expenses = filtered
        except ValueError as err:
            raise err

    total = round(sum(e.get("amount", 0.0) for e in expenses), 2)
    count = len(expenses)
    average = round(total / count, 2) if count > 0 else 0.0

    category_breakdown: Dict[str, float] = {}
    for e in expenses:
        cat = e.get("category", "Other")
        category_breakdown[cat] = round(category_breakdown.get(cat, 0.0) + e.get("amount", 0.0), 2)

    return {
        "total": total,
        "month": month_name,
        "year": target_year,
        "count": count,
        "average": average,
        "categories": category_breakdown,
        "expenses": expenses
    }

def check_budget_status(
    date_str: Optional[str] = None,
    expenses_file: Optional[str] = None,
    budget_file: Optional[str] = None
) -> Optional[str]:
    """
    Evaluates current month spending against configured budget limit.
    Returns status message if budget threshold is reached or exceeded.
    """
    budget_info = load_budget(budget_file=budget_file)
    monthly_budget = float(budget_info.get("monthly_budget", 0))

    if monthly_budget <= 0:
        return None

    if date_str:
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            parsed_date = datetime.now()
    else:
        parsed_date = datetime.now()

    summary = get_summary(month=parsed_date.month, year=parsed_date.year, expenses_file=expenses_file)
    total_spent = summary["total"]

    if total_spent > monthly_budget:
        exceeded = round(total_spent - monthly_budget, 2)
        return f"Budget Notice: Current monthly expenditures (${total_spent:.2f}) exceed the target limit of ${monthly_budget:.2f} by ${exceeded:.2f}."
    elif total_spent >= monthly_budget * 0.85:
        remaining = round(monthly_budget - total_spent, 2)
        pct = int((total_spent / monthly_budget) * 100)
        return f"Budget Notice: You have utilized {pct}% of your monthly budget allocation (${remaining:.2f} remaining)."

    return None

def export_to_csv(
    filename: str = "expenses_export.csv",
    output_dir: Optional[str] = None,
    expenses_file: Optional[str] = None
) -> str:
    """
    Exports expense records to a clean CSV spreadsheet file.
    Returns the absolute path to the generated CSV.
    """
    expenses = load_expenses(expenses_file=expenses_file)
    target_dir = output_dir or BASE_DIR
    export_path = os.path.join(target_dir, filename)

    with open(export_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Date", "Description", "Category", "Amount ($)"])
        for e in expenses:
            writer.writerow([
                e.get("id"),
                e.get("date"),
                e.get("description"),
                e.get("category", "Other"),
                f"{float(e.get('amount', 0.0)):.2f}"
            ])

    return export_path

def get_analytics_data(
    expenses_file: Optional[str] = None,
    budget_file: Optional[str] = None
) -> Dict[str, Any]:
    """
    Aggregates financial analytics, category distribution, and monthly spending insights.
    """
    expenses = load_expenses(expenses_file=expenses_file)
    budget_info = load_budget(budget_file=budget_file)

    monthly_income = float(budget_info.get("monthly_income", 3500.0))
    monthly_budget = float(budget_info.get("monthly_budget", 2400.0))

    current_date = datetime.now()
    current_month_summary = get_summary(month=current_date.month, year=current_date.year, expenses_file=expenses_file)
    total_current_spent = current_month_summary["total"]

    category_breakdown = current_month_summary["categories"]
    category_percentages = {}
    if total_current_spent > 0:
        for cat, amt in category_breakdown.items():
            category_percentages[cat] = {
                "amount": amt,
                "percentage": round((amt / total_current_spent) * 100, 1)
            }

    # Calculate 50/30/20 breakdown
    needs_categories = ["Housing & Utilities", "Food & Dining", "Transportation", "Health & Wellness", "Fixed Expenses"]
    wants_categories = ["Entertainment", "Personal & Shopping", "Shopping"]

    needs_spent = sum(amt for cat, amt in category_breakdown.items() if any(nc.lower() in cat.lower() for nc in needs_categories))
    wants_spent = sum(amt for cat, amt in category_breakdown.items() if any(wc.lower() in cat.lower() for wc in wants_categories))
    other_spent = total_current_spent - (needs_spent + wants_spent)
    if other_spent > 0:
        wants_spent += other_spent

    net_savings = max(0.0, round(monthly_income - total_current_spent, 2))
    savings_rate = round((net_savings / monthly_income) * 100, 1) if monthly_income > 0 else 0.0

    return {
        "monthly_income": monthly_income,
        "monthly_budget": monthly_budget,
        "total_spent_current_month": total_current_spent,
        "remaining_budget": round(monthly_budget - total_current_spent, 2),
        "net_savings": net_savings,
        "savings_rate_percent": savings_rate,
        "category_breakdown": category_percentages,
        "rule_50_30_20": {
            "needs_target": round(monthly_income * 0.50, 2),
            "needs_actual": round(needs_spent, 2),
            "wants_target": round(monthly_income * 0.30, 2),
            "wants_actual": round(wants_spent, 2),
            "savings_target": round(monthly_income * 0.20, 2),
            "savings_actual": net_savings
        }
    }
