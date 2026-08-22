import argparse
import sys
import os
from datetime import datetime

# Ensure UTF-8 output encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from backend.tracker_logic import (
    add_expense,
    update_expense,
    delete_expense,
    list_expenses,
    get_summary,
    export_to_csv,
    load_budget,
    save_budget,
    STANDARD_CATEGORIES
)

def format_currency(amount: float) -> str:
    """Formats float amount to standardized currency string."""
    return f"${amount:,.2f}"

def main():
    parser = argparse.ArgumentParser(
        description="Harmony Expense Tracker - Personal Financial Management CLI",
        prog="expense-tracker"
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Add Command
    add_parser = subparsers.add_parser("add", help="Add a new expense record")
    add_parser.add_argument("--description", required=True, type=str, help="Description of the expense")
    add_parser.add_argument("--amount", required=True, type=float, help="Amount spent (must be greater than 0)")
    add_parser.add_argument("--category", type=str, default="Other", help="Category name")
    add_parser.add_argument("--date", type=str, default=None, help="Expense date (YYYY-MM-DD), defaults to today")

    # Update Command
    update_parser = subparsers.add_parser("update", help="Update an existing expense by ID")
    update_parser.add_argument("--id", required=True, type=int, help="Expense ID to update")
    update_parser.add_argument("--description", type=str, default=None, help="New description")
    update_parser.add_argument("--amount", type=float, default=None, help="New amount")
    update_parser.add_argument("--category", type=str, default=None, help="New category")
    update_parser.add_argument("--date", type=str, default=None, help="New date (YYYY-MM-DD)")

    # Delete Command
    delete_parser = subparsers.add_parser("delete", help="Delete an expense record by ID")
    delete_parser.add_argument("--id", required=True, type=int, help="Expense ID to delete")

    # List Command
    list_parser = subparsers.add_parser("list", help="View recorded expenses")
    list_parser.add_argument("--category", type=str, default=None, help="Filter expenses by category")
    list_parser.add_argument("--search", type=str, default=None, help="Search keyword in description or category")
    list_parser.add_argument("--month", type=int, default=None, help="Filter by month number (1-12)")
    list_parser.add_argument("--year", type=int, default=None, help="Filter by year")

    # Summary Command
    summary_parser = subparsers.add_parser("summary", help="View total summary of expenses")
    summary_parser.add_argument("--month", type=int, default=None, help="Month number (1-12)")
    summary_parser.add_argument("--year", type=int, default=None, help="Year number (e.g. 2026)")

    # Export Command
    export_parser = subparsers.add_parser("export", help="Export expense history to a CSV file")
    export_parser.add_argument("--filename", type=str, default="expenses_export.csv", help="Target CSV filename")

    # Budget Command
    budget_parser = subparsers.add_parser("budget", help="Set or view monthly budget limits")
    budget_parser.add_argument("--set", type=float, default=None, help="Set monthly budget limit amount")
    budget_parser.add_argument("--income", type=float, default=None, help="Set monthly income amount")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # Process Commands
    if args.command == "add":
        try:
            item, warning = add_expense(
                description=args.description,
                amount=args.amount,
                category=args.category,
                date=args.date
            )
            print(f"Expense added successfully (ID: {item['id']})")
            print(f"Date: {item['date']} | Description: {item['description']} | Amount: {format_currency(item['amount'])} | Category: {item['category']}")
            if warning:
                print(f"{warning}")
        except ValueError as err:
            print(f"Error: {err}")

    elif args.command == "list":
        expenses = list_expenses(
            category_filter=args.category,
            search=args.search,
            month=args.month,
            year=args.year
        )
        if not expenses:
            print("No expense records found matching criteria.")
            return

        header = f"{'ID':<6} {'Date':<12} {'Description':<26} {'Category':<22} {'Amount':>10}"
        print(header)
        print("-" * len(header))
        for e in expenses:
            desc = e.get("description", "")
            if len(desc) > 24:
                desc = desc[:21] + "..."
            cat = e.get("category", "Other")
            if len(cat) > 20:
                cat = cat[:17] + "..."
            amt = format_currency(float(e.get("amount", 0.0)))
            print(f"{e.get('id'):<6} {e.get('date'):<12} {desc:<26} {cat:<22} {amt:>10}")
        print("-" * len(header))
        total = sum(float(e.get("amount", 0.0)) for e in expenses)
        print(f"Total: {format_currency(total)} across {len(expenses)} item(s)")

    elif args.command == "summary":
        try:
            summary = get_summary(month=args.month, year=args.year)
            if summary["month"]:
                period = f"{summary['month']} {summary['year'] or ''}".strip()
                print(f"Expense Summary for {period}")
            else:
                print("Overall Expense Summary")
            print("=" * 40)
            print(f"Total Expenditure:   {format_currency(summary['total'])}")
            print(f"Transaction Count:   {summary['count']}")
            print(f"Average Expense:     {format_currency(summary['average'])}")
            if summary["categories"]:
                print("\nCategory Breakdown:")
                for cat, val in summary["categories"].items():
                    print(f"  {cat:<24} {format_currency(val):>10}")
            print("=" * 40)
        except ValueError as err:
            print(f"Error: {err}")

    elif args.command == "delete":
        success = delete_expense(args.id)
        if success:
            print(f"Expense record ID {args.id} deleted successfully.")
        else:
            print(f"Error: Expense with ID {args.id} not found.")

    elif args.command == "update":
        try:
            updated = update_expense(
                expense_id=args.id,
                description=args.description,
                amount=args.amount,
                category=args.category,
                date=args.date
            )
            if updated:
                print(f"Expense ID {args.id} updated successfully.")
                print(f"Date: {updated['date']} | Description: {updated['description']} | Amount: {format_currency(updated['amount'])} | Category: {updated['category']}")
            else:
                print(f"Error: Expense with ID {args.id} not found.")
        except ValueError as err:
            print(f"Error: {err}")

    elif args.command == "export":
        filepath = export_to_csv(args.filename)
        print(f"Expense records exported successfully to: {os.path.abspath(filepath)}")

    elif args.command == "budget":
        bdata = load_budget()
        changed = False
        if args.set is not None:
            if args.set < 0:
                print("Error: Budget amount cannot be negative.")
                return
            bdata["monthly_budget"] = float(args.set)
            changed = True
            print(f"Monthly budget limit updated to: {format_currency(args.set)}")

        if args.income is not None:
            if args.income < 0:
                print("Error: Income amount cannot be negative.")
                return
            bdata["monthly_income"] = float(args.income)
            changed = True
            print(f"Monthly income updated to: {format_currency(args.income)}")

        if changed:
            save_budget(bdata)
        elif args.set is None and args.income is None:
            print("Current Budget Configuration:")
            print(f"  Monthly Income: {format_currency(float(bdata.get('monthly_income', 0.0)))}")
            print(f"  Monthly Budget: {format_currency(float(bdata.get('monthly_budget', 0.0)))}")

if __name__ == "__main__":
    main()
