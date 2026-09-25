import React, { useState } from 'react';
import { Wallet, TrendingUp, ShieldCheck, PieChart, CheckCircle2, AlertCircle, Coins, Activity, Plus, ArrowRight, ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react';
import { getCategoryColor } from '../utils/categoryColors';

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
  const cashflow = round2(income - totalSpent);
  const savingsRate = income > 0 ? ((Math.max(0, cashflow) / income) * 100).toFixed(1) : '0.0';

  const budgetUsedPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const hasSetup = income > 0 || budget > 0;

  // Category totals
  const categoryTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const handleDashboardQuickAdd = (e) => {
    e.preventDefault();
    const cleanDesc = quickDesc.trim();
    const numAmount = parseFloat(quickAmount);

    if (!cleanDesc || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a description and positive amount.');
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

      {/* Financial Metrics Summary Bar */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-income">
            <Coins size={22} />
          </div>
          <div>
            <div className="stat-label">Monthly Income</div>
            <div className="stat-value">
              {income > 0 ? `${currency}${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-budget">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="stat-label">Spending Limit</div>
            <div className="stat-value">
              {budget > 0 ? `${currency}${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-spent">
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">
              {currency}{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-remaining">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label">Remaining Budget</div>
            <div className="stat-value" style={{ color: budget > 0 ? (remaining >= 0 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-main)' }}>
              {budget > 0 ? `${currency}${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-savings">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label">Net Savings Rate</div>
            <div className="stat-value">{income > 0 ? `${savingsRate}%` : '—'}</div>
          </div>
        </div>
      </div>

      {/* Spending Pace Meter */}
      {hasSetup && (
        <div className="finance-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
              Monthly Spending Pace
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {currency}{totalSpent.toFixed(2)} of {currency}{budget.toFixed(2)} limit ({budgetUsedPercent}%)
            </div>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${budgetUsedPercent}%`,
                background: budgetUsedPercent > 90 ? 'var(--color-danger)' : budgetUsedPercent > 75 ? 'var(--color-warning)' : 'var(--primary)'
              }}
            />
          </div>
        </div>
      )}

      {/* Direct Inline Quick Add Transaction */}
      {onAddExpense && (
        <div className="finance-card">
          <div className="card-header">
            <div className="card-title">
              <Plus size={18} color="var(--primary)" />
              <span>Add Expense</span>
            </div>
            {quickSuccess && (
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-green)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Saved to ledger!
              </span>
            )}
          </div>

          <form onSubmit={handleDashboardQuickAdd}>
            <div className="quick-add-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Groceries, Electricity bill"
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
                  placeholder="e.g. 250.00"
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
                  <option value="Education & Career">Education & Career</option>
                  <option value="Fixed Expenses">Fixed Expenses</option>
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

              <button type="submit" className="btn-primary" style={{ height: '40px' }}>
                <Plus size={16} /> Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two-Column: Daily Habits Checklist + Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        
        <div className="finance-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={18} color="var(--primary)" />
              <span>Daily Financial Habits</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {budgetData?.checklist && budgetData.checklist.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.checked ? 'var(--color-success-bg)' : 'var(--bg-surface)',
                  border: `1px solid ${item.checked ? 'var(--color-success-border)' : 'var(--border-card)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => onToggleChecklist(item.id)}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `1.5px solid ${item.checked ? 'var(--accent-green)' : 'var(--text-muted)'}`,
                  background: item.checked ? 'var(--accent-green)' : '#ffffff',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {item.checked && '✓'}
                </div>
                <div style={{
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  color: item.checked ? 'var(--text-muted)' : 'var(--text-main)',
                  textDecoration: item.checked ? 'line-through' : 'none'
                }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="finance-card">
          <div className="card-header">
            <div className="card-title">
              <Wallet size={18} color="var(--primary)" />
              <span>Recent Transactions</span>
            </div>
            {onNavigateTab && (
              <button
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => onNavigateTab('expenses')}
              >
                Full Ledger <ArrowRight size={13} />
              </button>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <p>No transactions logged yet.</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Use the form above to record your first transaction.
              </div>
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
                  {expenses.slice(0, 5).map((exp) => {
                    const catStyle = getCategoryColor(exp.category);
                    return (
                      <tr key={exp.id}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{exp.date}</td>
                        <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{exp.description}</td>
                        <td>
                          <span
                            className="badge-category"
                            style={{
                              background: catStyle.bg,
                              color: catStyle.color,
                              border: `1px solid ${catStyle.color}40`
                            }}
                          >
                            {exp.category || 'Other'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>
                          {currency}{Number(exp.amount).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
