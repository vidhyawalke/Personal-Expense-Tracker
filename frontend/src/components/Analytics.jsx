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
    if (score >= 85) return { label: 'Optimal', color: 'var(--growth-green)', bg: 'var(--growth-green-light)' };
    if (score >= 70) return { label: 'Healthy', color: 'var(--growth-green-hover)', bg: 'var(--growth-green-light)' };
    if (score >= 50) return { label: 'Attention', color: 'var(--terracotta)', bg: 'var(--terracotta-light)' };
    return { label: 'Critical', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' };
  };

  const badge = getScoreBadge(displayScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--growth-green-light)', color: 'var(--growth-green)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-label">Financial Health Score</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{displayScore}/100</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '3px 10px', borderRadius: '12px', background: badge.bg, color: badge.color }}>
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
            <div className="stat-label">Average Expense</div>
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
            <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-muted)', marginTop: '2px' }}>
              {maxExpense.desc}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--bg-surface)', color: 'var(--charcoal-mid)' }}>
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
              <PieChart size={20} color="var(--growth-green)" />
              <span>Category Distribution</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--charcoal-muted)', marginTop: '2px' }}>
              Detailed breakdown of where your money was spent.
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
            {categoryArray.map((item) => (
              <div key={item.category} style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {item.category}
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                    {currency}{item.amount.toFixed(2)} <span style={{ color: 'var(--charcoal-muted)', fontSize: '0.85rem', fontWeight: '500' }}>({item.percentage}%)</span>
                  </div>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px', marginTop: 0 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      background: 'var(--growth-green)'
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
            <BarChart3 size={20} color="var(--growth-green)" />
            <span>Financial Growth Principles</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--growth-green)', marginBottom: '4px' }}>
              Daily Log Habit
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Record expenses immediately upon purchase. Awareness creates financial discipline and eliminates mystery spending.
            </div>
          </div>

          <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--growth-green)', marginBottom: '4px' }}>
              Pay Yourself First
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Automatically allocate 20% into savings or emergency funds the moment income is received, before lifestyle spending.
            </div>
          </div>

          <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: '800', color: 'var(--growth-green)', marginBottom: '4px' }}>
              365-Day Velocity
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Keep savings milestones bounded to 365 steps or fewer to maintain momentum, motivation, and tangible progress.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
