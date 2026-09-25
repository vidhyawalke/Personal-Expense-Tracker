import React from 'react';
import { Wallet, TrendingUp, ShieldCheck, PieChart, CheckCircle2, AlertCircle, Coins, Activity } from 'lucide-react';

export default function Dashboard({ expenses, budgetData, onToggleChecklist, warning, currency = '₹' }) {
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const income = Number(budgetData?.monthly_income) || 0;
  const budget = Number(budgetData?.monthly_budget) || 0;
  const remaining = budget - totalSpent;
  const netSavings = Math.max(0, income - totalSpent);
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : '—';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {warning && (
        <div className={`alert-banner ${totalSpent > budget ? 'danger' : 'warning'}`}>
          <AlertCircle size={18} />
          <span>{warning}</span>
        </div>
      )}

      {!hasSetup && (
        <div className="alert-banner info">
          <Coins size={18} />
          <span>Go to the Budget tab to configure your income, spending limit, and savings goals.</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-income">
            <Coins size={22} />
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
            <Activity size={22} />
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
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="stat-label">Budget Left</div>
            <div className="stat-value" style={{ color: budget > 0 ? (remaining >= 0 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-main)' }}>
              {budget > 0 ? `${currency}${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-savings">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value">{savingsRate}{income > 0 ? '%' : ''}</div>
          </div>
        </div>
      </div>

      {hasSetup && (
        <div className="harmony-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--text-main)' }}>
                Budget Spending Pace
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currency}{totalSpent.toFixed(2)} of {currency}{budget.toFixed(2)} monthly allowance
              </div>
            </div>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '20px',
              background: budgetUsedPercent > 90 ? 'var(--color-danger-bg)' : budgetUsedPercent > 75 ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
              color: budgetUsedPercent > 90 ? 'var(--color-danger)' : budgetUsedPercent > 75 ? 'var(--color-warning)' : 'var(--color-success)'
            }}>
              {budgetUsedPercent}%
            </span>
          </div>

          <div className="progress-bar-bg" style={{ height: '10px' }}>
            <div
              className={`progress-bar-fill ${budgetUsedPercent > 90 ? 'danger' : budgetUsedPercent > 75 ? 'warning' : 'success'}`}
              style={{ width: `${budgetUsedPercent}%` }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="harmony-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={20} color="var(--mint-light)" />
              <span>Daily Checklist</span>
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
              <PieChart size={20} color="var(--mint-light)" />
              <span>Top Spending Categories</span>
            </div>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="empty-state">
              <p>No expenses logged yet.</p>
              <div className="hint">Add expenses to view category breakdown</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sortedCategories.map(([cat, amt]) => {
                const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-main)' }}>{cat}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{currency}{amt.toFixed(2)} ({pct}%)</span>
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

      <div className="harmony-card">
        <div className="card-header">
          <div className="card-title">
            <Wallet size={20} color="var(--mint-light)" />
            <span>Recent Expenses</span>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet.</p>
            <div className="hint">Go to the Expenses tab to log your spending</div>
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
                    <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{exp.date}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{exp.description}</td>
                    <td>
                      <span style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {exp.category || 'Other'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--mint-light)' }}>
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
