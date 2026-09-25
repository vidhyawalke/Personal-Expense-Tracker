import React from 'react';
import { BarChart3, PieChart, TrendingUp, Award, Coins, Calendar } from 'lucide-react';

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
    if (score >= 70) return { label: 'Healthy', color: 'var(--mint-light)', bg: 'rgba(52, 211, 153, 0.12)' };
    if (score >= 50) return { label: 'Attention', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
    return { label: 'Critical', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' };
  };

  const badge = getScoreBadge(displayScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.14)', color: 'var(--mint-light)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-label">Financial Health Score</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{displayScore}/100</span>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
            <Coins size={24} />
          </div>
          <div>
            <div className="stat-label">Average Expense</div>
            <div className="stat-value">{currency}{avgExpense.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Largest Expense</div>
            <div className="stat-value">{currency}{maxExpense.amount.toFixed(2)}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {maxExpense.desc}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--bg-surface)', color: 'var(--mint-light)' }}>
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
              <PieChart size={20} color="var(--mint-light)" />
              <span>Category Distribution</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Distribution of your recorded expenditures.
            </div>
          </div>
        </div>

        {categoryArray.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet. Add expenses to generate category analysis.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryArray.map((item) => (
              <div key={item.category} style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {item.category}
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                    {currency}{item.amount.toFixed(2)} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>({item.percentage}%)</span>
                  </div>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px', marginTop: 0 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="harmony-card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={20} color="var(--mint-light)" />
            <span>Financial Wellness Principles</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--mint-light)', marginBottom: '4px' }}>
              Daily Consistency
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Record expenses immediately as they happen to keep your awareness sharp and budget honest.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--mint-light)', marginBottom: '4px' }}>
              Pay Yourself First
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Allocate 20% into savings or emergency buffer right when you receive your monthly income.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--mint-light)', marginBottom: '4px' }}>
              Pace Against Time
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Ensure your step targets stay within 365 days so long-term goals remain realistic and achievable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
