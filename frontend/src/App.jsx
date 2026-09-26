import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ExpenseList from './components/ExpenseList';
import BudgetPlanner from './components/BudgetPlanner';
import ClockWidget from './components/ClockWidget';
import { 
  Wallet,
  Receipt, 
  Target, 
  User, 
  X, 
  Save, 
  ArrowRight
} from 'lucide-react';

const STORAGE_KEYS = {
  expenses: 'finance_tracker_expenses',
  budget: 'finance_tracker_budget',
  userProfile: 'finance_tracker_profile',
};

const DEFAULT_BUDGET = {
  monthly_income: 0,
  monthly_budget: 0,
  categories_budget: {},
  savings_target: { goal: 0, duration: 12, cadence: 'month', target_box_amount: 0, isConfigSaved: false, saved_boxes: [] },
  checklist: [
    { id: 1, text: 'Review today\'s transactions', checked: false },
    { id: 2, text: 'Log all daily expenditures', checked: false },
    { id: 3, text: 'Monitor spending pace vs budget', checked: false },
    { id: 4, text: 'Deposit monthly/yearly savings milestone', checked: false },
    { id: 5, text: 'Review upcoming fixed bills', checked: false },
  ]
};

const round2 = (val) => Math.round((Number(val) || 0) * 100) / 100;

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
    // Storage quota fallback
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  const [expenses, setExpenses] = useState(() => loadFromStorage(STORAGE_KEYS.expenses, []));
  const [budgetData, setBudgetData] = useState(() => loadFromStorage(STORAGE_KEYS.budget, DEFAULT_BUDGET));
  const [userProfile, setUserProfile] = useState(() => loadFromStorage(STORAGE_KEYS.userProfile, null));
  const [warning, setWarning] = useState(null);

  // Profile modal state
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Setup form states
  const [formName, setFormName] = useState(userProfile?.name || '');
  const [formCurrency, setFormCurrency] = useState(userProfile?.currency || '₹');
  const [formIncome, setFormIncome] = useState(budgetData?.monthly_income ? String(budgetData.monthly_income) : '');
  const [formBudget, setFormBudget] = useState(budgetData?.monthly_budget ? String(budgetData.monthly_budget) : '');

  const currency = userProfile?.currency || '₹';

  // Mathematical Budget Warnings
  const evaluateBudgetWarning = useCallback((expensesList, currentBudget, currSym) => {
    const total = round2(expensesList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));
    const limit = Number(currentBudget?.monthly_budget) || 0;
    if (limit > 0 && total > limit) {
      setWarning(`Budget Warning: Total spent is ${currSym}${total.toFixed(2)} exceeding your ${currSym}${limit.toFixed(2)} spending limit by ${currSym}${(total - limit).toFixed(2)}.`);
    } else if (limit > 0 && total >= limit * 0.85) {
      setWarning(`Notice: ${((total / limit) * 100).toFixed(0)}% of monthly budget utilized — only ${currSym}${(limit - total).toFixed(2)} remaining.`);
    } else {
      setWarning(null);
    }
  }, []);

  useEffect(() => {
    evaluateBudgetWarning(expenses, budgetData, currency);
  }, [expenses, budgetData, currency, evaluateBudgetWarning]);

  const handleAddExpense = (newExpense) => {
    const id = Date.now();
    const entry = { id, ...newExpense, amount: round2(newExpense.amount) };
    const updated = [entry, ...expenses];
    setExpenses(updated);
    saveToStorage(STORAGE_KEYS.expenses, updated);
  };

  const handleUpdateExpense = (id, updatedData) => {
    const updated = expenses.map(e => e.id === id ? { ...e, ...updatedData, amount: round2(updatedData.amount) } : e);
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
    if (patch.savings_target !== undefined) {
      merged.savings_target = {
        ...budgetData.savings_target,
        ...patch.savings_target
      };
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
    a.download = `finance-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Onboarding Submit
  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    const inc = parseFloat(formIncome);
    const bud = parseFloat(formBudget);

    if (!formName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (isNaN(inc) || inc <= 0 || isNaN(bud) || bud <= 0) {
      alert('Please enter valid positive numbers for income and spending limit.');
      return;
    }

    const newProfile = {
      name: formName.trim(),
      currency: formCurrency
    };
    const updatedBudget = {
      ...budgetData,
      monthly_income: round2(inc),
      monthly_budget: round2(bud)
    };

    setUserProfile(newProfile);
    saveToStorage(STORAGE_KEYS.userProfile, newProfile);

    setBudgetData(updatedBudget);
    saveToStorage(STORAGE_KEYS.budget, updatedBudget);
  };

  const handleOpenEditProfile = () => {
    setFormName(userProfile?.name || '');
    setFormCurrency(userProfile?.currency || '₹');
    setFormIncome(budgetData?.monthly_income ? String(budgetData.monthly_income) : '');
    setFormBudget(budgetData?.monthly_budget ? String(budgetData.monthly_budget) : '');
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfileEdit = (e) => {
    e.preventDefault();
    const inc = parseFloat(formIncome);
    const bud = parseFloat(formBudget);

    if (!formName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (isNaN(inc) || inc <= 0 || isNaN(bud) || bud <= 0) {
      alert('Please enter valid positive numbers for income and spending limit.');
      return;
    }

    const updatedProfile = {
      name: formName.trim(),
      currency: formCurrency
    };
    const updatedBudget = {
      ...budgetData,
      monthly_income: round2(inc),
      monthly_budget: round2(bud)
    };

    setUserProfile(updatedProfile);
    saveToStorage(STORAGE_KEYS.userProfile, updatedProfile);

    setBudgetData(updatedBudget);
    saveToStorage(STORAGE_KEYS.budget, updatedBudget);

    setIsEditProfileModalOpen(false);
  };

  // Onboarding Setup
  if (!userProfile?.name) {
    return (
      <div className="setup-overlay">
        <div className="setup-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div className="brand-icon-square">
              ₹
            </div>
            <div>
              <h2>Personal Expense Tracker</h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Budget & Goal Savings Setup
              </div>
            </div>
          </div>
          
          <p>
            Please set your baseline parameters to initialize your personal budget and savings ledger.
          </p>

          <form onSubmit={handleOnboardingSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <select
                className="form-select"
                value={formCurrency}
                onChange={(e) => setFormCurrency(e.target.value)}
              >
                <option value="₹">₹ - Indian Rupee (INR)</option>
                <option value="$">$ - US Dollar (USD)</option>
                <option value="€">€ - Euro (EUR)</option>
                <option value="£">£ - British Pound (GBP)</option>
                <option value="¥">¥ - Japanese Yen (JPY)</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Income ({formCurrency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 50000"
                className="form-input"
                value={formIncome}
                onChange={(e) => setFormIncome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Spending Limit ({formCurrency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 35000"
                className="form-input"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                Open Financial Workspace <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditProfileModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Edit Profile & Baseline
              </h3>
              <button
                className="btn-icon"
                onClick={() => setIsEditProfileModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  className="form-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Currency</label>
                <select
                  className="form-select"
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value)}
                >
                  <option value="₹">₹ - Indian Rupee (INR)</option>
                  <option value="$">$ - US Dollar (USD)</option>
                  <option value="€">€ - Euro (EUR)</option>
                  <option value="£">£ - British Pound (GBP)</option>
                  <option value="¥">¥ - Japanese Yen (JPY)</option>
                  <option value="AED">AED - UAE Dirham</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Income ({formCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50000"
                  className="form-input"
                  value={formIncome}
                  onChange={(e) => setFormIncome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Spending Limit ({formCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 35000"
                  className="form-input"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditProfileModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Area (Clean, Image 1 fix: Profile button, Image 2 fix: Removed 4 icons) */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon-square">
            <Wallet size={24} />
          </div>
          <div>
            <div className="brand-title">
              Personal Expense Tracker
            </div>
            <div className="brand-subtitle">
              Budget & Savings Management | {userProfile.name}
            </div>
          </div>
        </div>

        <div className="header-controls">
          <button
            type="button"
            className="btn-profile"
            onClick={handleOpenEditProfile}
            title="Edit Profile & Baseline"
          >
            <User size={15} /> Profile
          </button>
          <ClockWidget />
        </div>
      </header>

      {/* Navigation (Only 2 sections: Tracker and Goal) */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          <Receipt size={17} /> Expense Tracker
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'goal' ? 'active' : ''}`}
          onClick={() => setActiveTab('goal')}
        >
          <Target size={17} /> Savings Goal
        </button>
      </nav>

      {/* Content Area (Only 2 sections) */}
      <main>
        <div className="tab-content" key={activeTab}>
          {activeTab === 'tracker' && (
            <ExpenseList
              expenses={expenses}
              budgetData={budgetData}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onExportCSV={handleExportCSV}
              currency={currency}
              warning={warning}
            />
          )}
          {activeTab === 'goal' && (
            <BudgetPlanner
              budgetData={budgetData}
              onUpdateBudget={handleUpdateBudget}
              expenses={expenses}
              currency={currency}
            />
          )}
        </div>
      </main>
    </div>
  );
}
