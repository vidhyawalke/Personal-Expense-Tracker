import React from 'react';
import { BarChart3, PieChart, TrendingUp, Award, DollarSign, Calendar } from 'lucide-react';

export default function Analytics({ expenses, budgetData }) {
  const income = Number(budgetData?.monthly_income) || 3500;
  const budget = Number(budgetData?.monthly_budget) || 2400;
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
    if (score >= 85) return { label: 'Optimal Harmony', color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
    if (score >= 70) return { label: 'Balanced Growth', color: 'var(--sage-600)', bg: 'var(--sage-100)' };
    if (score >= 50) return { label: 'Moderate Caution', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
    return { label: 'Action Required', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' };
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
            <div className="stat-label">Financial Wellness Score</div>
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
            <div className="stat-label">Average Transaction</div>
            <div className="stat-value">${avgExpense.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Highest Expense</div>
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
            <div className="stat-label">Logged Entries</div>
            <div className="stat-value">{count}</div>
          </div>
        </div>
      </div>

      <div className="harmony-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <PieChart size={20} color="var(--forest-800)" />
              <span>Category Allocation Breakdown</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Distribution of all recorded spending across financial categories.
            </div>
          </div>
        </div>

        {categoryArray.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No expense data available for analytics.
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
            <span>Growth & Balance Recommendations</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--sage-50)', border: '1px solid var(--sage-200)' }}>
            <div style={{ fontWeight: '700', color: 'var(--forest-900)', marginBottom: '4px' }}>
              Maintain Consistent Daily Logging
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Tracking every purchase immediately ensures realistic category limits and prevents unexpected budget overruns.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--forest-900)', marginBottom: '4px' }}>
              Automate the 20% Growth Target
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Direct at least 20% of net income into savings or investments immediately upon receipt to ensure long-term harmony.
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--forest-900)', marginBottom: '4px' }}>
              Quarterly Category Calibration
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Re-evaluate discretionary allowances every quarter to align with evolving lifestyle priorities and goals.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
