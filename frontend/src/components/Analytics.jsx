import React from 'react';
import { BarChart3, PieChart, TrendingUp, Award, DollarSign, Calendar } from 'lucide-react';

export default function Analytics({ expenses, budgetData }) {
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
    if (score >= 85) return { label: 'Great', color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
    if (score >= 70) return { label: 'Good', color: 'var(--sage-600)', bg: 'var(--sage-100)' };
    if (score >= 50) return { label: 'Watch out', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
    return { label: 'Needs work', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' };
  };

  const badge = getScoreBadge(displayScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--sage-100)', color: 'var(--forest-800)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-label">Money Health Score</div>
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
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-label">Average per Expense</div>
            <div className="stat-value">${avgExpense.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Biggest Expense</div>
            <div className="stat-value">${maxExpense.amount.toFixed(2)}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {maxExpense.desc}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--bg-surface)', color: 'var(--forest-800)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-label">Total Entries</div>
            <div className="stat-value">{count}</div>
          </div>
        </div>
      </div>

      <div className="harmony-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <PieChart size={20} color="var(--forest-800)" />
              <span>Where Your Money Goes</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              How your spending is split across categories.
            </div>
          </div>
        </div>

        {categoryArray.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No expenses yet. Add some to see your breakdown.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryArray.map((item) => (
              <div key={item.category} style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--forest-900)' }}>
                    {item.category}
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                    ${item.amount.toFixed(2)} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>({item.percentage}%)</span>
                  </div>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px', marginTop: 0 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      background: 'var(--forest-800)'
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
            <BarChart3 size={20} color="var(--forest-800)" />
            <span>Quick Tips</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--sage-50)', border: '1px solid var(--sage-200)' }}>
            <div style={{ fontWeight: '700', color: 'var(--forest-900)', marginBottom: '4px' }}>
              Log every day
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Write down what you spend each day. It helps you see where your money really goes.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--forest-900)', marginBottom: '4px' }}>
              Save 20% first
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              When you get paid, move 20% to savings right away. Spend what's left.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--forest-900)', marginBottom: '4px' }}>
              Review monthly
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Check your spending once a month. See what you can cut and what you need to keep.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
