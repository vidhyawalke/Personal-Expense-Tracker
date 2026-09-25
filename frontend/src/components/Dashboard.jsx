import React, { useState } from 'react';
import { Wallet, TrendingUp, ShieldCheck, PieChart, CheckCircle2, AlertCircle, Coins, Activity, Plus, ArrowRight } from 'lucide-react';

const round2 = (val) => Math.round((Number(val) || 0) * 100) / 100;

export default function Dashboard({
  expenses,
  budgetData,
  onToggleChecklist,
  warning,
  currency = '₹',
  onAddExpense,
  onNavigateTab
}) {
  const [quickDesc, setQuickDesc] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food & Dining');
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quickSuccess, setQuickSuccess] = useState(false);

  const totalSpent = round2(expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));
  const income = Number(budgetData?.monthly_income) || 0;
  const budget = Number(budgetData?.monthly_budget) || 0;
  const remaining = round2(budget - totalSpent);
  const netSavings = round2(Math.max(0, income - totalSpent));
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : '0.0';

  const budgetUsedPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const hasSetup = income > 0 || budget > 0;

  const categoryTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const handleDashboardQuickAdd = (e) => {
    e.preventDefault();
    const cleanDesc = quickDesc.trim();
    const numAmount = parseFloat(quickAmount);

    if (!cleanDesc || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a description and amount.');
      return;
    }

    if (onAddExpense) {
      onAddExpense({
        description: cleanDesc,
        amount: round2(numAmount),
        category: quickCategory,
        date: quickDate || new Date().toISOString().split('T')[0]
      });
      setQuickDesc('');
      setQuickAmount('');
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {warning && (
        <div className={`alert-banner ${totalSpent > budget ? 'danger' : 'warning'}`}>
          <AlertCircle size={18} />
          <span>{warning}</span>
        </div>
      )}

      {/* Financial Growth Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-income">
            <Coins size={24} />
          </div>
          <div>
            <div className="stat-label">Monthly Income</div>
            <div className="stat-value">
              {income > 0 ? `${currency}${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-spent">
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">
              {currency}{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-remaining">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-label">Remaining Budget</div>
            <div className="stat-value" style={{ color: budget > 0 ? (remaining >= 0 ? 'var(--growth-green)' : 'var(--color-danger)') : 'var(--text-main)' }}>
              {budget > 0 ? `${currency}${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-savings">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value">{income > 0 ? `${savingsRate}%` : '—'}</div>
          </div>
        </div>
      </div>

      {/* Budget Spending Pace Bar */}
      {hasSetup && (
        <div className="harmony-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>
                Budget Spending Pace
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--charcoal-muted)', marginTop: '2px' }}>
                {currency}{totalSpent.toFixed(2)} utilized out of {currency}{budget.toFixed(2)} limit
              </div>
            </div>
            <span style={{
              fontSize: '0.84rem',
              fontWeight: '700',
              padding: '3px 12px',
              borderRadius: '20px',
              background: budgetUsedPercent > 90 ? 'var(--color-danger-bg)' : budgetUsedPercent > 75 ? 'var(--terracotta-light)' : 'var(--growth-green-light)',
              color: budgetUsedPercent > 90 ? 'var(--color-danger)' : budgetUsedPercent > 75 ? 'var(--terracotta)' : 'var(--growth-green)'
            }}>
              {budgetUsedPercent}% used
            </span>
          </div>

          <div className="progress-bar-bg" style={{ height: '10px' }}>
            <div
              className={`progress-bar-fill ${budgetUsedPercent > 90 ? 'danger' : budgetUsedPercent > 75 ? 'warning' : ''}`}
              style={{ width: `${budgetUsedPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Integrated Quick-Add Form on Dashboard (Merged features!) */}
      {onAddExpense && (
        <div className="harmony-card">
          <div className="card-header">
            <div className="card-title">
              <Plus size={20} color="var(--growth-green)" />
              <span>Log Expense Now</span>
            </div>
            {quickSuccess && (
              <span style={{ fontSize: '0.84rem', color: 'var(--growth-green)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Added!
              </span>
            )}
          </div>

          <form onSubmit={handleDashboardQuickAdd}>
            <div className="quick-add-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">What did you spend on?</label>
                <input
                  type="text"
                  placeholder="e.g. Coffee, Groceries"
                  className="form-input"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  className="form-input"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Housing & Utilities">Housing & Utilities</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Personal & Shopping">Personal & Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ height: '44px' }}>
                <Plus size={18} /> Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two-Column: Daily Checklist + Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="harmony-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={20} color="var(--growth-green)" />
              <span>Daily Financial Habits</span>
            </div>
          </div>

          <div className="checklist-container">
            {budgetData?.checklist && budgetData.checklist.map((item) => (
              <div
                key={item.id}
                className={`checklist-card ${item.checked ? 'checked' : ''}`}
                onClick={() => onToggleChecklist(item.id)}
              >
                <div className="checklist-checkbox">
                  {item.checked && '✓'}
                </div>
                <div className="checklist-text">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="harmony-card">
          <div className="card-header">
            <div className="card-title">
              <PieChart size={20} color="var(--growth-green)" />
              <span>Top Spending Categories</span>
            </div>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="empty-state">
              <p>No expenses logged yet.</p>
              <div className="hint">Log an expense above to view breakdown</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sortedCategories.map(([cat, amt]) => {
                const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '600', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-main)' }}>{cat}</span>
                      <span style={{ color: 'var(--charcoal-muted)' }}>{currency}{amt.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '7px', marginTop: 0 }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses Table with View Full Ledger button */}
      <div className="harmony-card">
        <div className="card-header">
          <div className="card-title">
            <Wallet size={20} color="var(--growth-green)" />
            <span>Recent Expenses</span>
          </div>
          {onNavigateTab && (
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={() => onNavigateTab('expenses')}>
              View Full Ledger <ArrowRight size={14} />
            </button>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses logged yet.</p>
            <div className="hint">Use the form above to record your first transaction!</div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--charcoal-muted)', fontWeight: '600' }}>{exp.date}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{exp.description}</td>
                    <td>
                      <span className="badge-category">
                        {exp.category || 'Other'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--growth-green)' }}>
                      {currency}{Number(exp.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
