import pytest
from fastapi.testclient import TestClient
import os
import backend.tracker_logic as logic
from backend.server import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_data(monkeypatch, tmp_path):
    temp_data_dir = str(tmp_path / "data")
    temp_expenses_file = os.path.join(temp_data_dir, "expenses.json")
    temp_budget_file = os.path.join(temp_data_dir, "budget.json")

    monkeypatch.setattr(logic, "DATA_DIR", temp_data_dir)
    monkeypatch.setattr(logic, "EXPENSES_FILE", temp_expenses_file)
    monkeypatch.setattr(logic, "BUDGET_FILE", temp_budget_file)

    logic.ensure_files_exist(temp_data_dir, temp_expenses_file, temp_budget_file)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Harmony Expense Tracker" in data["app"]

def test_api_get_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) > 0

def test_api_create_and_get_expense():
    payload = {
        "description": "Ergonomic Desk Chair",
        "amount": 220.00,
        "category": "Housing & Utilities",
        "date": "2026-08-18"
    }
    create_res = client.post("/api/expenses", json=payload)
    assert create_res.status_code == 200
    created_data = create_res.json()
    assert created_data["success"] is True
    assert created_data["expense"]["id"] == 1
    assert created_data["expense"]["description"] == "Ergonomic Desk Chair"

    list_res = client.get("/api/expenses")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1
    assert items[0]["id"] == 1

def test_api_create_expense_validation_error():
    # Negative amount
    res = client.post("/api/expenses", json={"description": "Invalid", "amount": -10})
    assert res.status_code == 422

    # Empty description
    res2 = client.post("/api/expenses", json={"description": "", "amount": 10})
    assert res2.status_code == 422

def test_api_update_expense():
    create_res = client.post("/api/expenses", json={"description": "Desk Lamp", "amount": 35.00})
    exp_id = create_res.json()["expense"]["id"]

    update_res = client.put(f"/api/expenses/{exp_id}", json={"description": "LED Desk Lamp", "amount": 42.00})
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["expense"]["description"] == "LED Desk Lamp"
    assert updated_data["expense"]["amount"] == 42.00

    not_found_res = client.put("/api/expenses/9999", json={"description": "Ghost"})
    assert not_found_res.status_code == 404

def test_api_delete_expense():
    create_res = client.post("/api/expenses", json={"description": "Temporary Note", "amount": 5.00})
    exp_id = create_res.json()["expense"]["id"]

    del_res = client.delete(f"/api/expenses/{exp_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    del_res_again = client.delete(f"/api/expenses/{exp_id}")
    assert del_res_again.status_code == 404

def test_api_summary():
    client.post("/api/expenses", json={"description": "Book", "amount": 30.00, "category": "Education & Career", "date": "2026-08-10"})
    client.post("/api/expenses", json={"description": "Dinner", "amount": 70.00, "category": "Food & Dining", "date": "2026-08-12"})

    res = client.get("/api/summary?month=8&year=2026")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 100.00
    assert data["count"] == 2
    assert data["month"] == "August"

def test_api_budget_get_and_post():
    get_res = client.get("/api/budget")
    assert get_res.status_code == 200
    budget = get_res.json()
    assert "monthly_income" in budget

    post_res = client.post("/api/budget", json={"monthly_income": 4500.0, "monthly_budget": 3000.0})
    assert post_res.status_code == 200
    updated = post_res.json()["budget"]
    assert updated["monthly_income"] == 4500.0
    assert updated["monthly_budget"] == 3000.0

def test_api_analytics():
    client.post("/api/expenses", json={"description": "Rent", "amount": 800.00, "category": "Housing & Utilities"})
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "rule_50_30_20" in data
    assert "savings_rate_percent" in data

def test_api_export_csv():
    client.post("/api/expenses", json={"description": "Monitor", "amount": 180.00, "category": "Education & Career"})
    res = client.get("/api/export")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Monitor" in res.text
