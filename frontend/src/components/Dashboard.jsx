import React from 'react';
import { Wallet, TrendingUp, ShieldCheck, PieChart, CheckCircle2, AlertCircle, DollarSign, Activity } from 'lucide-react';

export default function Dashboard({ expenses, budgetData, onToggleChecklist, warning }) {
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const income = Number(budgetData?.monthly_income) || 3500;
  const budget = Number(budgetData?.monthly_budget) || 2400;
  const remaining = budget - totalSpent;
  const netSavings = Math.max(0, income - totalSpent);
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : '0.0';

  const budgetUsedPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  const categoryTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {warning && (
        <div className={`alert-banner ${totalSpent > budget ? 'danger' : 'warning'}`}>
          <AlertCircle size={20} />
          <span>{warning}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-income">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-label">Monthly Income</div>
            <div className="stat-value">${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-spent">
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-label">Total Expenditures</div>
            <div className="stat-value">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-balance">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-label">Budget Balance</div>
            <div className="stat-value" style={{ color: remaining >= 0 ? 'var(--forest-800)' : 'var(--color-danger)' }}>
              ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-savings">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value">{savingsRate}%</div>
          </div>
        </div>
      </div>

      <div className="harmony-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--forest-900)' }}>
              Monthly Budget Utilization
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              ${totalSpent.toFixed(2)} spent of ${budget.toFixed(2)} monthly allocation
            </div>
          </div>
          <span style={{
            fontSize: '0.88rem',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '20px',
            background: budgetUsedPercent > 90 ? 'var(--color-danger-bg)' : budgetUsedPercent > 75 ? 'var(--color-warning-bg)' : 'var(--sage-100)',
            color: budgetUsedPercent > 90 ? 'var(--color-danger)' : budgetUsedPercent > 75 ? 'var(--color-warning)' : 'var(--forest-800)'
          }}>
            {budgetUsedPercent}% Allocated
          </span>
        </div>

        <div className="progress-bar-bg" style={{ height: '12px' }}>
          <div
            className={`progress-bar-fill ${budgetUsedPercent > 90 ? 'danger' : budgetUsedPercent > 75 ? 'warning' : 'success'}`}
            style={{ width: `${budgetUsedPercent}%` }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        <div className="harmony-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={20} color="var(--forest-800)" />
              <span>Daily Financial Discipline</span>
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
              <PieChart size={20} color="var(--forest-800)" />
              <span>Primary Allocation Distribution</span>
            </div>
          </div>

          {sortedCategories.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No category expenditures recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sortedCategories.map(([cat, amt]) => {
                const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-main)' }}>{cat}</span>
                      <span style={{ color: 'var(--text-muted)' }}>${amt.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '8px', marginTop: 0 }}>
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
            <Wallet size={20} color="var(--forest-800)" />
            <span>Recent Transactions</span>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No expense records found. Use the Expense Tracker tab to add transactions.
          </div>
        ) : (
          <div className="table-container">
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
                {expenses.slice(0, 6).map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{exp.date}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{exp.description}</td>
                    <td>
                      <span className="badge-category">{exp.category || 'Other'}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--forest-900)' }}>
                      ${Number(exp.amount).toFixed(2)}
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
