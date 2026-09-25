import React from 'react';
import { BarChart3, PieChart, TrendingUp, Award, Coins, Calendar } from 'lucide-react';
import { getCategoryColor } from '../utils/categoryColors';

export default function Analytics({ expenses, budgetData, currency = '₹' }) {
  const income = Number(budgetData?.monthly_income) || 0;
  const budget = Number(budgetData?.monthly_budget) || 0;
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const count = expenses.length;
  const avgExpense = count > 0 ? (totalSpent / count) : 0;

  const maxExpense = expenses.reduce((max, curr) => {
    const amt = Number(curr.amount) || 0;
    return amt > max.amount ? { amount: amt, desc: curr.description, date: curr.date } : max;
  }, { amount: 0, desc: 'None', date: '-' });

  const categoryMap = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(e.amount) || 0);
  });

  const categoryArray = Object.entries(categoryMap)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  let healthScore = 100;
  if (budget > 0 && totalSpent > budget) {
    healthScore -= Math.min(40, ((totalSpent - budget) / budget) * 100);
  }
  if (income > 0 && totalSpent > income * 0.8) {
    healthScore -= 20;
  }
  const displayScore = Math.max(10, Math.round(healthScore));

  const getScoreBadge = (score) => {
    if (score >= 85) return { label: 'Optimal', color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
    if (score >= 70) return { label: 'Healthy', color: 'var(--primary)', bg: 'var(--primary-light)' };
    if (score >= 50) return { label: 'Caution', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
    return { label: 'Over Limit', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' };
  };

  const badge = getScoreBadge(displayScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-income">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-label">Financial Health Score</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{displayScore}/100</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', padding: '3px 10px', borderRadius: '12px', background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-budget">
            <Coins size={24} />
          </div>
          <div>
            <div className="stat-label">Average Transaction</div>
            <div className="stat-value">{currency}{avgExpense.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-spent">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Largest Expense</div>
            <div className="stat-value">{currency}{maxExpense.amount.toFixed(2)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {maxExpense.desc}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-remaining">
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-label">Total Entries</div>
            <div className="stat-value">{count}</div>
          </div>
        </div>
      </div>

      <div className="finance-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <PieChart size={20} color="var(--primary)" />
              <span>Category Distribution</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Expenditures grouped by category with dedicated color tracking.
            </div>
          </div>
        </div>

        {categoryArray.length === 0 ? (
          <div className="empty-state">
            <p>No expenditures recorded yet.</p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Log transactions in your ledger to generate distribution analysis.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryArray.map((item) => {
              const catTheme = getCategoryColor(item.category);
              return (
                <div key={item.category} style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: catTheme.color }} />
                      <span>{item.category}</span>
                    </div>
                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      {currency}{item.amount.toFixed(2)} <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: '600' }}>({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '8px', marginTop: 0 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${item.percentage}%`,
                        background: catTheme.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="finance-card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={20} color="var(--primary)" />
            <span>Financial Management Benchmarks</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>
              Immediate Logging
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Record expenses immediately upon completion to maintain accurate real-time cashflow awareness.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>
              Pay Yourself First
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Transfer 20% into savings or emergency funds directly when income is received, before discretionary expenses.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>
              Mathematical Solvency
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Ensure monthly and annual savings targets strictly remain within your unallocated disposable income.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
