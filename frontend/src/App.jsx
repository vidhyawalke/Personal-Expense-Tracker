import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import BudgetPlanner from './components/BudgetPlanner';
import Analytics from './components/Analytics';
import ClockWidget from './components/ClockWidget';
import harmonyLogo from './assets/harmony_logo.png';
import { LayoutDashboard, Receipt, Target, BarChart2, Save } from 'lucide-react';

const STORAGE_KEYS = {
  expenses: 'harmony_expenses',
  budget: 'harmony_budget',
  setupDone: 'harmony_setup_done',
};

const DEFAULT_BUDGET = {
  monthly_income: 0,
  monthly_budget: 0,
  categories_budget: {},
  savings_target: { goal: 20000, target_box_amount: 200, saved_boxes: [] },
  checklist: [
    { id: 1, text: 'Check yesterday\'s spending', checked: false },
    { id: 2, text: 'Log all today\'s expenses', checked: false },
    { id: 3, text: 'Check how much budget is left', checked: false },
    { id: 4, text: 'Move savings amount', checked: false },
    { id: 5, text: 'Plan for next week', checked: false },
  ]
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState(() => loadFromStorage(STORAGE_KEYS.expenses, []));
  const [budgetData, setBudgetData] = useState(() => loadFromStorage(STORAGE_KEYS.budget, DEFAULT_BUDGET));
  const [warning, setWarning] = useState(null);
  const [showSetup, setShowSetup] = useState(() => !localStorage.getItem(STORAGE_KEYS.setupDone));
  const [setupIncome, setSetupIncome] = useState('');
  const [setupBudget, setSetupBudget] = useState('');

  const evaluateBudgetWarning = useCallback((expensesList, currentBudget) => {
    const total = expensesList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const limit = Number(currentBudget?.monthly_budget) || 0;
    if (limit > 0 && total > limit) {
      setWarning(`Over budget! You spent $${total.toFixed(2)} out of $${limit.toFixed(2)} (over by $${(total - limit).toFixed(2)}).`);
    } else if (limit > 0 && total >= limit * 0.85) {
      setWarning(`${((total / limit) * 100).toFixed(0)}% used — only $${(limit - total).toFixed(2)} left.`);
    } else {
      setWarning(null);
    }
  }, []);

  useEffect(() => {
    evaluateBudgetWarning(expenses, budgetData);
  }, [expenses, budgetData, evaluateBudgetWarning]);

  const handleAddExpense = (newExpense) => {
    const id = Date.now();
    const entry = { id, ...newExpense };
    const updated = [entry, ...expenses];
    setExpenses(updated);
    saveToStorage(STORAGE_KEYS.expenses, updated);
  };

  const handleUpdateExpense = (id, updatedData) => {
    const updated = expenses.map(e => e.id === id ? { ...e, ...updatedData } : e);
    setExpenses(updated);
    saveToStorage(STORAGE_KEYS.expenses, updated);
  };

  const handleDeleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveToStorage(STORAGE_KEYS.expenses, updated);
  };

  const handleUpdateBudget = (patch) => {
    const merged = { ...budgetData, ...patch };
    // Handle nested savings target
    if (patch.saved_boxes !== undefined) {
      merged.savings_target = {
        ...budgetData.savings_target,
        saved_boxes: patch.saved_boxes
      };
      delete merged.saved_boxes;
    }
    if (patch.checklist !== undefined) {
      merged.checklist = patch.checklist;
    }
    setBudgetData(merged);
    saveToStorage(STORAGE_KEYS.budget, merged);
  };

  const handleToggleChecklist = (checklistId) => {
    const updatedList = (budgetData.checklist || []).map(item =>
      item.id === checklistId ? { ...item, checked: !item.checked } : item
    );
    handleUpdateBudget({ checklist: updatedList });
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to download.');
      return;
    }
    const header = 'ID,Date,Description,Category,Amount';
    const rows = expenses.map(e =>
      `${e.id},${e.date},"${e.description}",${e.category || 'Other'},${Number(e.amount).toFixed(2)}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harmony-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetupSubmit = (e) => {
    e.preventDefault();
    const inc = parseFloat(setupIncome);
    const bud = parseFloat(setupBudget);
    if (isNaN(inc) || inc <= 0 || isNaN(bud) || bud <= 0) {
      alert('Please enter valid numbers for both fields.');
      return;
    }
    const newBudget = { ...DEFAULT_BUDGET, monthly_income: inc, monthly_budget: bud };
    setBudgetData(newBudget);
    saveToStorage(STORAGE_KEYS.budget, newBudget);
    saveToStorage(STORAGE_KEYS.setupDone, 'true');
    setShowSetup(false);
  };

  const handleSkipSetup = () => {
    const newBudget = { ...DEFAULT_BUDGET, monthly_income: 3000, monthly_budget: 2000 };
    setBudgetData(newBudget);
    saveToStorage(STORAGE_KEYS.budget, newBudget);
    saveToStorage(STORAGE_KEYS.setupDone, 'true');
    setShowSetup(false);
  };

  return (
    <div className="app-container">
      {/* First-time setup */}
      {showSetup && (
        <div className="setup-overlay">
          <div className="setup-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <img src={harmonyLogo} alt="Harmony" style={{ height: '40px', borderRadius: '6px' }} />
              <h2 style={{ margin: 0 }}>Welcome to Harmony!</h2>
            </div>
            <p>Let's set up your budget. You can always change these later.</p>

            <form onSubmit={handleSetupSubmit}>
              <div className="form-group">
                <label className="form-label">How much do you earn per month?</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3500.00"
                  className="form-input"
                  value={setupIncome}
                  onChange={(e) => setSetupIncome(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">How much do you want to spend per month?</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2000.00"
                  className="form-input"
                  value={setupBudget}
                  onChange={(e) => setSetupBudget(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={handleSkipSetup}>
                  Skip for now
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} /> Save & Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="brand-section">
          <img
            src={harmonyLogo}
            alt="Harmony Expense Tracker"
            className="brand-logo-img"
          />
          <div>
            <h1 className="brand-title">Harmony Expense Tracker</h1>
            <p className="brand-subtitle">Keep your money on track</p>
          </div>
        </div>
        <ClockWidget />
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={16} /> Home
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <Receipt size={16} /> Expenses
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          <Target size={16} /> Budget
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart2 size={16} /> Reports
        </button>
      </nav>

      <main>
        <div className="tab-content" key={activeTab}>
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
        </div>
      </main>
    </div>
  );
}
