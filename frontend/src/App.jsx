import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import BudgetPlanner from './components/BudgetPlanner';
import Analytics from './components/Analytics';
import ClockWidget from './components/ClockWidget';
import harmonyLogo from './assets/harmony_logo.png';
import { LayoutDashboard, Receipt, Target, BarChart2, User, Edit3, X, Save, ArrowRight } from 'lucide-react';

const STORAGE_KEYS = {
  expenses: 'harmony_expenses',
  budget: 'harmony_budget',
  userProfile: 'harmony_user_profile',
};

const DEFAULT_BUDGET = {
  monthly_income: 0,
  monthly_budget: 0,
  categories_budget: {},
  savings_target: { goal: 0, target_box_amount: 0, cadence: 'daily', isConfigSaved: false, saved_boxes: [] },
  checklist: [
    { id: 1, text: 'Review today\'s purchases', checked: false },
    { id: 2, text: 'Log all expenses', checked: false },
    { id: 3, text: 'Check remaining allowance', checked: false },
    { id: 4, text: 'Complete your daily/weekly savings step', checked: false },
    { id: 5, text: 'Plan tomorrow\'s essentials', checked: false },
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
    // Storage quota or error handling
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState(() => loadFromStorage(STORAGE_KEYS.expenses, []));
  const [budgetData, setBudgetData] = useState(() => loadFromStorage(STORAGE_KEYS.budget, DEFAULT_BUDGET));
  const [userProfile, setUserProfile] = useState(() => loadFromStorage(STORAGE_KEYS.userProfile, null));
  const [warning, setWarning] = useState(null);

  // Profile modal state (for editing later)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Setup form states (for initial onboarding or editing)
  const [formName, setFormName] = useState(userProfile?.name || '');
  const [formCurrency, setFormCurrency] = useState(userProfile?.currency || '₹');
  const [formIncome, setFormIncome] = useState(budgetData?.monthly_income ? String(budgetData.monthly_income) : '');
  const [formBudget, setFormBudget] = useState(budgetData?.monthly_budget ? String(budgetData.monthly_budget) : '');

  const currency = userProfile?.currency || '₹';

  // Budget warnings
  const evaluateBudgetWarning = useCallback((expensesList, currentBudget, currSym) => {
    const total = expensesList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const limit = Number(currentBudget?.monthly_budget) || 0;
    if (limit > 0 && total > limit) {
      setWarning(`Budget Exceeded: Spent ${currSym}${total.toFixed(2)} of ${currSym}${limit.toFixed(2)} (over by ${currSym}${(total - limit).toFixed(2)}).`);
    } else if (limit > 0 && total >= limit * 0.85) {
      setWarning(`Caution: ${((total / limit) * 100).toFixed(0)}% of budget utilized — only ${currSym}${(limit - total).toFixed(2)} remaining.`);
    } else {
      setWarning(null);
    }
  }, []);

  useEffect(() => {
    evaluateBudgetWarning(expenses, budgetData, currency);
  }, [expenses, budgetData, currency, evaluateBudgetWarning]);

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
    a.download = `harmony-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Initial Onboarding Submit
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
      monthly_income: Math.round(inc * 100) / 100,
      monthly_budget: Math.round(bud * 100) / 100
    };

    setUserProfile(newProfile);
    saveToStorage(STORAGE_KEYS.userProfile, newProfile);

    setBudgetData(updatedBudget);
    saveToStorage(STORAGE_KEYS.budget, updatedBudget);
  };

  // Editing profile details later
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
      monthly_income: Math.round(inc * 100) / 100,
      monthly_budget: Math.round(bud * 100) / 100
    };

    setUserProfile(updatedProfile);
    saveToStorage(STORAGE_KEYS.userProfile, updatedProfile);

    setBudgetData(updatedBudget);
    saveToStorage(STORAGE_KEYS.budget, updatedBudget);

    setIsEditProfileModalOpen(false);
  };

  // If user has not set their name or details, progressive disclosure shows the onboarding setup first
  if (!userProfile?.name) {
    return (
      <div className="setup-overlay">
        <div className="setup-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <img src={harmonyLogo} alt="Harmony" style={{ height: '46px', borderRadius: '8px' }} />
            <div>
              <h2>Welcome to Harmony</h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--mint-light)', fontWeight: '600' }}>
                Personal Finance & Budget Tracker
              </div>
            </div>
          </div>
          
          <p>
            Please tell us your name and basic details to personalize your workspace before viewing your dashboard.
          </p>

          <form onSubmit={handleOnboardingSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Vidhya or Alex"
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
                placeholder="e.g. 25000 or 3500"
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
                placeholder="e.g. 18000 or 2000"
                className="form-input"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                Continue to Tracker <ArrowRight size={18} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Edit Your Details
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
                  placeholder="e.g. Vidhya"
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
                  placeholder="e.g. 25000"
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
                  placeholder="e.g. 18000"
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

      {/* Main Header */}
      <header className="app-header">
        <div className="brand-section">
          <img
            src={harmonyLogo}
            alt="Harmony Expense Tracker"
            className="brand-logo-img"
          />
          <div>
            <div className="brand-title">
              Harmony
              <span className="brand-user-greeting">
                Hello, {userProfile.name} 👋
              </span>
            </div>
            <p className="brand-subtitle">Natural, breathable money tracker</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-profile-edit"
            onClick={handleOpenEditProfile}
            title="Edit Name, Currency & Budget"
          >
            <User size={14} /> {currency} Details
          </button>
          <ClockWidget />
        </div>
      </header>

      {/* Tab Navigation */}
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
          <Target size={16} /> Budget & Goals
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart2 size={16} /> Analytics
        </button>
      </nav>

      {/* Content Area */}
      <main>
        <div className="tab-content" key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              budgetData={budgetData}
              onToggleChecklist={handleToggleChecklist}
              warning={warning}
              currency={currency}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onExportCSV={handleExportCSV}
              currency={currency}
            />
          )}
          {activeTab === 'budget' && (
            <BudgetPlanner
              budgetData={budgetData}
              onUpdateBudget={handleUpdateBudget}
              expenses={expenses}
              currency={currency}
            />
          )}
          {activeTab === 'analytics' && (
            <Analytics
              expenses={expenses}
              budgetData={budgetData}
              currency={currency}
            />
          )}
        </div>
      </main>
    </div>
  );
}
