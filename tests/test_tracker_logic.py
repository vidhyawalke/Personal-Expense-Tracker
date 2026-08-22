import os
import json
import tempfile
import pytest
from datetime import datetime
import backend.tracker_logic as logic

@pytest.fixture(autouse=True)
def setup_test_environment(monkeypatch, tmp_path):
    """Sets up an isolated temporary directory for data files for each test."""
    temp_data_dir = str(tmp_path / "data")
    temp_expenses_file = os.path.join(temp_data_dir, "expenses.json")
    temp_budget_file = os.path.join(temp_data_dir, "budget.json")

    monkeypatch.setattr(logic, "DATA_DIR", temp_data_dir)
    monkeypatch.setattr(logic, "EXPENSES_FILE", temp_expenses_file)
    monkeypatch.setattr(logic, "BUDGET_FILE", temp_budget_file)

    logic.ensure_files_exist(temp_data_dir, temp_expenses_file, temp_budget_file)

def test_add_expense_valid():
    item, warning = logic.add_expense("Organic Groceries", 85.50, "Food & Dining", "2026-08-15")
    assert item["id"] == 1
    assert item["description"] == "Organic Groceries"
    assert item["amount"] == 85.50
    assert item["category"] == "Food & Dining"
    assert item["date"] == "2026-08-15"

    item2, _ = logic.add_expense("Metro Pass", 30.00, "Transportation")
    assert item2["id"] == 2
    assert item2["amount"] == 30.00
    assert item2["date"] == datetime.now().strftime("%Y-%m-%d")

def test_add_expense_validation_errors():
    with pytest.raises(ValueError, match="Description cannot be empty"):
        logic.add_expense("   ", 25.0)

    with pytest.raises(ValueError, match="Amount must be greater than zero"):
        logic.add_expense("Lunch", -5.0)

    with pytest.raises(ValueError, match="Amount must be greater than zero"):
        logic.add_expense("Lunch", 0)

    with pytest.raises(ValueError, match="Invalid date format"):
        logic.add_expense("Lunch", 20.0, date="invalid-date")

def test_update_expense():
    item, _ = logic.add_expense("Coffee", 4.50, "Food & Dining")
    exp_id = item["id"]

    updated = logic.update_expense(exp_id, description="Specialty Coffee", amount=5.25, category="Food & Dining")
    assert updated["description"] == "Specialty Coffee"
    assert updated["amount"] == 5.25

    not_found = logic.update_expense(999, description="Nonexistent")
    assert not_found is None

def test_update_expense_validation():
    item, _ = logic.add_expense("Coffee", 4.50)
    exp_id = item["id"]

    with pytest.raises(ValueError, match="Description cannot be empty"):
        logic.update_expense(exp_id, description="  ")

    with pytest.raises(ValueError, match="Amount must be greater than zero"):
        logic.update_expense(exp_id, amount=-10.0)

    with pytest.raises(ValueError, match="Invalid date format"):
        logic.update_expense(exp_id, date="2026/08/20")

def test_delete_expense():
    item1, _ = logic.add_expense("Item 1", 10.0)
    item2, _ = logic.add_expense("Item 2", 20.0)

    assert logic.delete_expense(item1["id"]) is True
    assert logic.delete_expense(item1["id"]) is False
    assert logic.delete_expense(9999) is False

    remaining = logic.load_expenses()
    assert len(remaining) == 1
    assert remaining[0]["id"] == item2["id"]

def test_list_and_search_expenses():
    logic.add_expense("Office Supplies Notebook", 15.00, "Education & Career", "2026-08-01")
    logic.add_expense("Weekly Groceries", 120.00, "Food & Dining", "2026-08-05")
    logic.add_expense("Train Ticket", 45.00, "Transportation", "2026-08-10")

    all_items = logic.list_expenses()
    assert len(all_items) == 3

    food_items = logic.list_expenses(category_filter="Food & Dining")
    assert len(food_items) == 1
    assert food_items[0]["description"] == "Weekly Groceries"

    search_items = logic.list_expenses(search="office")
    assert len(search_items) == 1
    assert search_items[0]["category"] == "Education & Career"

def test_get_summary_and_breakdown():
    logic.add_expense("Rent", 1000.00, "Housing & Utilities", "2026-08-01")
    logic.add_expense("Groceries", 200.00, "Food & Dining", "2026-08-10")
    logic.add_expense("Books", 50.00, "Education & Career", "2026-08-15")

    summary = logic.get_summary(month=8, year=2026)
    assert summary["total"] == 1250.00
    assert summary["count"] == 3
    assert summary["average"] == round(1250.00 / 3, 2)
    assert summary["month"] == "August"
    assert summary["categories"]["Housing & Utilities"] == 1000.00
    assert summary["categories"]["Food & Dining"] == 200.00
    assert summary["categories"]["Education & Career"] == 50.00

def test_invalid_month_summary():
    with pytest.raises(ValueError, match="Month must be between 1 and 12"):
        logic.get_summary(month=13)

def test_budget_warning_calculation():
    budget = logic.load_budget()
    budget["monthly_budget"] = 500.00
    logic.save_budget(budget)

    # 1. Below 85%
    today = datetime.now().strftime("%Y-%m-%d")
    logic.add_expense("Expense 1", 200.00, "Other", today)
    warning = logic.check_budget_status(today)
    assert warning is None

    # 2. Reaching 85%
    logic.add_expense("Expense 2", 230.00, "Other", today) # Total 430 / 500 = 86%
    warning86 = logic.check_budget_status(today)
    assert warning86 is not None
    assert "86%" in warning86

    # 3. Exceeding 100%
    logic.add_expense("Expense 3", 100.00, "Other", today) # Total 530 / 500
    warning_exceeded = logic.check_budget_status(today)
    assert warning_exceeded is not None
    assert "exceed the target limit" in warning_exceeded

def test_export_to_csv(tmp_path):
    logic.add_expense("Test Item", 42.50, "Other", "2026-08-20")
    csv_file = logic.export_to_csv("test_export.csv", output_dir=str(tmp_path))

    assert os.path.exists(csv_file)
    with open(csv_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
        assert len(lines) == 2
        assert "ID,Date,Description,Category,Amount ($)" in lines[0]
        assert "Test Item" in lines[1]
        assert "42.50" in lines[1]

def test_get_analytics_data():
    budget = logic.load_budget()
    budget["monthly_income"] = 4000.00
    budget["monthly_budget"] = 2500.00
    logic.save_budget(budget)

    today = datetime.now().strftime("%Y-%m-%d")
    logic.add_expense("Apartment Rent", 1200.00, "Housing & Utilities", today)
    logic.add_expense("Concert Ticket", 150.00, "Entertainment", today)

    analytics = logic.get_analytics_data()
    assert analytics["monthly_income"] == 4000.00
    assert analytics["monthly_budget"] == 2500.00
    assert analytics["total_spent_current_month"] == 1350.00
    assert analytics["net_savings"] == 2650.00
    assert analytics["rule_50_30_20"]["needs_target"] == 2000.00
    assert analytics["rule_50_30_20"]["wants_target"] == 1200.00
    assert analytics["rule_50_30_20"]["savings_target"] == 800.00
