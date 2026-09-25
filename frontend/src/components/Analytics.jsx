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
    if (score >= 70) return { label: 'Healthy', color: 'var(--coffee-primary)', bg: 'var(--coffee-light)' };
    if (score >= 50) return { label: 'Watch Out', color: 'var(--caramel-accent)', bg: 'var(--caramel-light)' };
    return { label: 'Critical', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' };
  };

  const badge = getScoreBadge(displayScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--coffee-light)', color: 'var(--coffee-primary)' }}>
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
          <div className="stat-icon-wrapper stat-icon-remaining">
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
            <div style={{ fontSize: '0.8rem', color: 'var(--mocha-muted)', marginTop: '2px' }}>
              {maxExpense.desc}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--bg-surface)', color: 'var(--coffee-dark)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-label">Logged Entries</div>
            <div className="stat-value">{count}</div>
          </div>
        </div>
      </div>

      <div className="harmony-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <PieChart size={20} color="var(--coffee-primary)" />
              <span>Category Distribution (Universal Theory)</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--mocha-muted)', marginTop: '2px' }}>
              Visual breakdown of your expenses mapped by dedicated category color.
            </div>
          </div>
        </div>

        {categoryArray.length === 0 ? (
          <div className="empty-state">
            <p>No expenses recorded yet.</p>
            <div className="hint">Log your expenses in the ledger to view this distribution</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryArray.map((item) => {
              const catTheme = getCategoryColor(item.category);
              return (
                <div key={item.category} style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.95rem', color: 'var(--coffee-dark)' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: catTheme.color }} />
                      <span>{item.category}</span>
                    </div>
                    <div style={{ fontWeight: '800', color: 'var(--coffee-dark)' }}>
                      {currency}{item.amount.toFixed(2)} <span style={{ color: 'var(--mocha-muted)', fontSize: '0.85rem', fontWeight: '600' }}>({item.percentage}%)</span>
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

      <div className="harmony-card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={20} color="var(--coffee-primary)" />
            <span>Cozy Financial Principles</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1.5px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--coffee-primary)', marginBottom: '4px' }}>
              Mindful Espresso Log
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Logging expenses right after paying brings calm awareness and eliminates month-end financial shock.
            </div>
          </div>

          <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1.5px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--coffee-primary)', marginBottom: '4px' }}>
              Pay Yourself First
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Reserve 20% into savings or emergency funds the moment income is received, before discretionary purchases.
            </div>
          </div>

          <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1.5px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--coffee-primary)', marginBottom: '4px' }}>
              Solvent Milestones
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Always ensure your daily, weekly, or monthly savings targets never exceed your real money in hand.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
