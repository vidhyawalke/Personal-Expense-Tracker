import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import BudgetPlanner from './components/BudgetPlanner';
import Analytics from './components/Analytics';
import ClockWidget from './components/ClockWidget';
import { Shield, LayoutDashboard, Receipt, Target, BarChart2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [budgetData, setBudgetData] = useState({
    monthly_income: 3500,
    monthly_budget: 2400,
    categories_budget: {},
    savings_target: { goal: 20000, target_box_amount: 200, saved_boxes: [] },
    checklist: []
  });
  const [warning, setWarning] = useState(null);

  const evaluateBudgetWarning = useCallback((expensesList, currentBudget) => {
    const total = expensesList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const limit = Number(currentBudget?.monthly_budget) || 2400;

    if (limit > 0 && total > limit) {
      setWarning(`Budget Notice: Current monthly expenditures ($${total.toFixed(2)}) exceed the target allocation of $${limit.toFixed(2)} by $${(total - limit).toFixed(2)}.`);
    } else if (limit > 0 && total >= limit * 0.85) {
      setWarning(`Budget Notice: You have utilized ${((total / limit) * 100).toFixed(0)}% of your monthly budget allocation ($${(limit - total).toFixed(2)} remaining).`);
    } else {
      setWarning(null);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [expRes, budRes] = await Promise.all([
        fetch(`${API_BASE}/expenses`),
        fetch(`${API_BASE}/budget`)
      ]);

      let loadedExpenses = [];
      let loadedBudget = budgetData;

      if (expRes.ok) {
        loadedExpenses = await expRes.json();
        setExpenses(loadedExpenses);
      }

      if (budRes.ok) {
        loadedBudget = await budRes.json();
        setBudgetData(loadedBudget);
      }

      evaluateBudgetWarning(loadedExpenses, loadedBudget);
    } catch {
      // Backend starting up or disconnected; local state is maintained
    }
  }, [budgetData, evaluateBudgetWarning]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddExpense = async (newExpense) => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      if (res.ok) {
        const result = await res.json();
        const updated = [result.expense, ...expenses];
        setExpenses(updated);
        evaluateBudgetWarning(updated, budgetData);
      }
    } catch {
      alert("Failed to save transaction to server.");
    }
  };

  const handleUpdateExpense = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const result = await res.json();
        const updated = expenses.map(e => e.id === id ? result.expense : e);
        setExpenses(updated);
        evaluateBudgetWarning(updated, budgetData);
      }
    } catch {
      alert("Failed to update transaction.");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updated = expenses.filter(e => e.id !== id);
        setExpenses(updated);
        evaluateBudgetWarning(updated, budgetData);
      }
    } catch {
      alert("Failed to delete transaction.");
    }
  };

  const handleUpdateBudget = async (newBudgetData) => {
    try {
      const res = await fetch(`${API_BASE}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudgetData)
      });
      if (res.ok) {
        const result = await res.json();
        setBudgetData(result.budget);
        evaluateBudgetWarning(expenses, result.budget);
      }
    } catch {
      console.log("Failed to update budget on server.");
    }
  };

  const handleToggleChecklist = (checklistId) => {
    const updatedList = (budgetData.checklist || []).map(item =>
      item.id === checklistId ? { ...item, checked: !item.checked } : item
    );
    const updatedBudget = { ...budgetData, checklist: updatedList };
    setBudgetData(updatedBudget);
    handleUpdateBudget({ checklist: updatedList });
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE}/export`, '_blank');
  };

  return (
    <div className="app-container">
      
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <Shield size={26} />
          </div>
          <div>
            <h1 className="brand-title">Harmony Expense Tracker</h1>
            <p className="brand-subtitle">Cultivate Financial Wellness and Balanced Growth</p>
          </div>
        </div>

        <ClockWidget />
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <Receipt size={18} /> Expenses
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          <Target size={18} /> Budget & Growth
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart2 size={18} /> Analytics
        </button>
      </nav>

      <main>
        {activeTab === 'dashboard' && (
          <Dashboard
            expenses={expenses}
            budgetData={budgetData}
            onToggleChecklist={handleToggleChecklist}
            warning={warning}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            budgetData={budgetData}
            onUpdateBudget={handleUpdateBudget}
            expenses={expenses}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            expenses={expenses}
            budgetData={budgetData}
          />
        )}
      </main>

    </div>
  );
}
