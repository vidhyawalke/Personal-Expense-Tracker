import os
import pytest
from unittest.mock import patch
import backend.tracker_logic as logic
import cli

@pytest.fixture(autouse=True)
def setup_cli_test_data(monkeypatch, tmp_path):
    temp_data_dir = str(tmp_path / "data")
    temp_expenses_file = os.path.join(temp_data_dir, "expenses.json")
    temp_budget_file = os.path.join(temp_data_dir, "budget.json")

    monkeypatch.setattr(logic, "DATA_DIR", temp_data_dir)
    monkeypatch.setattr(logic, "EXPENSES_FILE", temp_expenses_file)
    monkeypatch.setattr(logic, "BUDGET_FILE", temp_budget_file)

    logic.ensure_files_exist(temp_data_dir, temp_expenses_file, temp_budget_file)

def test_cli_add_and_list(capsys):
    test_args = ["expense-tracker", "add", "--description", "Yoga Class", "--amount", "25.00", "--category", "Health & Wellness"]
    with patch("sys.argv", test_args):
        cli.main()

    captured = capsys.readouterr()
    assert "Expense added successfully" in captured.out
    assert "Yoga Class" in captured.out

    test_list_args = ["expense-tracker", "list"]
    with patch("sys.argv", test_list_args):
        cli.main()

    captured_list = capsys.readouterr()
    assert "Yoga Class" in captured_list.out
    assert "$25.00" in captured_list.out

def test_cli_summary(capsys):
    logic.add_expense("Groceries", 60.00, "Food & Dining", "2026-08-10")
    test_summary_args = ["expense-tracker", "summary"]
    with patch("sys.argv", test_summary_args):
        cli.main()

    captured = capsys.readouterr()
    assert "Total Expenditure:" in captured.out
    assert "$60.00" in captured.out

def test_cli_budget(capsys):
    test_budget_args = ["expense-tracker", "budget", "--set", "2800.00"]
    with patch("sys.argv", test_budget_args):
        cli.main()

    captured = capsys.readouterr()
    assert "Monthly budget limit updated to: $2,800.00" in captured.out

def test_cli_delete(capsys):
    item, _ = logic.add_expense("Item to Delete", 15.00)
    exp_id = str(item["id"])

    test_del_args = ["expense-tracker", "delete", "--id", exp_id]
    with patch("sys.argv", test_del_args):
        cli.main()

    captured = capsys.readouterr()
    assert f"Expense record ID {exp_id} deleted successfully." in captured.out
