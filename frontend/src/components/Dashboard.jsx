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
  const [chartView, setChartView] = useState('expense'); // 'expense' | 'income'

  const totalSpent = round2(expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));
  const income = Number(budgetData?.monthly_income) || 0;
  const budget = Number(budgetData?.monthly_budget) || 0;
  const remaining = round2(budget - totalSpent);
  const cashflow = round2(income - totalSpent);
  const savingsRate = income > 0 ? ((Math.max(0, cashflow) / income) * 100).toFixed(1) : '0.0';

  const budgetUsedPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const hasSetup = income > 0 || budget > 0;

  // Group expenses by category
  const categoryTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

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

  // SVG Donut calculation
  const totalDonut = totalSpent > 0 ? totalSpent : 1;
  let cumulativePercent = 0;
  const donutSlices = sortedCategories.map(([cat, amt]) => {
    const percent = amt / totalDonut;
    const strokeDasharray = `${percent * 282.74} 282.74`;
    const strokeDashoffset = -cumulativePercent * 282.74;
    cumulativePercent += percent;
    return {
      category: cat,
      amount: amt,
      percent: (percent * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
      color: getCategoryColor(cat).color
    };
  });

  // Current Month Name
  const monthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {warning && (
        <div className={`alert-banner ${totalSpent > budget ? 'danger' : 'warning'}`}>
          <AlertCircle size={20} />
          <span>{warning}</span>
        </div>
      )}

      {/* =========================================================
          IMAGE 3 LAYOUT: Clean 3-Column Tracker
          1. Quick Actions & Cashflow
          2. Monthly Charts (Trend)
          3. This Month Breakdown (Donut Chart)
          ========================================================= */}
      <div className="dashboard-grid-img3">
        
        {/* Left Column: Quick Actions + Cashflow Box */}
        <div className="card-img3">
          <div>
            <div className="card-img3-header">
              <span className="card-img3-title">Quick Actions</span>
            </div>
            
            <div className="quick-action-buttons">
              <button
                className="btn-action-outline"
                onClick={() => onNavigateTab && onNavigateTab('expenses')}
              >
                <Plus size={16} /> New Expense
              </button>
              <button
                className="btn-action-outline"
                onClick={() => onNavigateTab && onNavigateTab('budget')}
              >
                <TrendingUp size={16} /> Adjust Budget
              </button>
            </div>
          </div>

          <div className="cashflow-box">
            <div className="cashflow-month-title">
              <Calendar size={16} color="var(--caramel-accent)" />
              <span>{monthName}</span>
            </div>

            <div className="cashflow-row">
              <span className="cashflow-label">Income:</span>
              <span className="cashflow-val-income">{currency}{income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="cashflow-row">
              <span className="cashflow-label">Expense:</span>
              <span className="cashflow-val-expense">{currency}{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="cashflow-row" style={{ borderTop: '1px dashed var(--border-card)', paddingTop: '8px', marginTop: '6px' }}>
              <span className="cashflow-label">Cashflow:</span>
              <span className="cashflow-val-net" style={{ color: cashflow >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {cashflow >= 0 ? '+' : ''}{currency}{cashflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--mocha-muted)', marginBottom: '4px' }}>
                <span>Budget Consumed</span>
                <strong>{budgetUsedPercent}%</strong>
              </div>
              <div className="progress-bar-bg" style={{ height: '7px', margin: 0 }}>
                <div
                  className={`progress-bar-fill ${budgetUsedPercent > 90 ? 'danger' : budgetUsedPercent > 75 ? 'warning' : ''}`}
                  style={{ width: `${budgetUsedPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Monthly Charts (Trend) */}
        <div className="card-img3">
          <div className="card-img3-header">
            <span className="card-img3-title">Monthly Charts</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`cadence-btn ${chartView === 'expense' ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setChartView('expense')}
              >
                ↑ Expense
              </button>
              <button
                className={`cadence-btn ${chartView === 'income' ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setChartView('income')}
              >
                ↓ Income
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}>
            <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-card)" />

              {/* Y Axis Labels */}
              <text x="32" y="24" fontSize="10" fill="var(--mocha-muted)" textAnchor="end">{currency}{income > 0 ? (income * 0.8).toFixed(0) : '400'}</text>
              <text x="32" y="74" fontSize="10" fill="var(--mocha-muted)" textAnchor="end">{currency}{income > 0 ? (income * 0.5).toFixed(0) : '200'}</text>
              <text x="32" y="124" fontSize="10" fill="var(--mocha-muted)" textAnchor="end">{currency}{income > 0 ? (income * 0.2).toFixed(0) : '80'}</text>
              <text x="32" y="164" fontSize="10" fill="var(--mocha-muted)" textAnchor="end">0</text>

              {/* Area & Trend Curve */}
              {chartView === 'expense' ? (
                <>
                  <defs>
                    <linearGradient id="coffeeCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--caramel-accent)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--caramel-accent)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 60 160 Q 140 155, 200 125 T 320 50 L 360 65 L 360 160 Z"
                    fill="url(#coffeeCurveGrad)"
                  />
                  <path
                    d="M 60 160 Q 140 155, 200 125 T 320 50 L 360 65"
                    fill="none"
                    stroke="var(--caramel-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="320" cy="50" r="5" fill="#ffffff" stroke="var(--caramel-accent)" strokeWidth="3" />
                  <text x="320" y="40" fontSize="11" fontWeight="bold" fill="var(--coffee-dark)" textAnchor="middle">
                    {currency}{totalSpent}
                  </text>
                </>
              ) : (
                <>
                  <defs>
                    <linearGradient id="incomeCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 60 160 Q 150 100, 240 60 T 360 30 L 360 160 Z"
                    fill="url(#incomeCurveGrad)"
                  />
                  <path
                    d="M 60 160 Q 150 100, 240 60 T 360 30"
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="360" cy="30" r="5" fill="#ffffff" stroke="var(--color-success)" strokeWidth="3" />
                  <text x="350" y="22" fontSize="11" fontWeight="bold" fill="var(--color-success)" textAnchor="middle">
                    {currency}{income}
                  </text>
                </>
              )}

              {/* X Axis Time Labels */}
              <text x="60" y="176" fontSize="10" fill="var(--mocha-muted)" textAnchor="middle">Wk 1</text>
              <text x="160" y="176" fontSize="10" fill="var(--mocha-muted)" textAnchor="middle">Wk 2</text>
              <text x="260" y="176" fontSize="10" fill="var(--mocha-muted)" textAnchor="middle">Wk 3</text>
              <text x="360" y="176" fontSize="10" fill="var(--mocha-muted)" textAnchor="middle">Wk 4</text>
            </svg>
          </div>
        </div>

        {/* Right Column: This Month Breakdown (Donut Chart - Image 3 match) */}
        <div className="card-img3">
          <div className="card-img3-header">
            <span className="card-img3-title">This Month Breakdown</span>
          </div>

          <div className="donut-container">
            <svg width="180" height="180" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="var(--bg-surface)"
                strokeWidth="12"
              />

              {/* Slices with Universal Color Theory */}
              {donutSlices.length === 0 ? (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="var(--border-subtle)"
                  strokeWidth="12"
                />
              ) : (
                donutSlices.map((slice, i) => (
                  <circle
                    key={slice.category}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="12"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    transform="rotate(-90 50 50)"
                  />
                ))
              )}
            </svg>

            {/* Total in center */}
            <div className="donut-center-text">
              <div className="donut-center-total">{currency}{totalSpent.toFixed(0)}</div>
              <div className="donut-center-label">Total Spent</div>
            </div>
          </div>

          {/* Legend */}
          <div className="donut-legend">
            {donutSlices.slice(0, 4).map((slice) => (
              <div key={slice.category} className="donut-legend-item">
                <span className="donut-legend-dot" style={{ background: slice.color }} />
                <span style={{ color: 'var(--coffee-dark)', whiteSpace: 'nowrap' }}>
                  {slice.category}: <strong>{slice.percent}%</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Integrated Quick-Add Form */}
      {onAddExpense && (
        <div className="harmony-card">
          <div className="card-header">
            <div className="card-title">
              <Plus size={20} color="var(--coffee-primary)" />
              <span>Log Expense Instantly</span>
            </div>
            {quickSuccess && (
              <span style={{ fontSize: '0.84rem', color: 'var(--color-success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Added to your ledger!
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

              <button type="submit" className="btn-primary" style={{ height: '44px' }}>
                <Plus size={18} /> Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two-Column: Daily Financial Habits + Recent Expenses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        
        <div className="harmony-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={20} color="var(--coffee-primary)" />
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
              <Wallet size={20} color="var(--coffee-primary)" />
              <span>Recent Transactions</span>
            </div>
            {onNavigateTab && (
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => onNavigateTab('expenses')}
              >
                Full Ledger <ArrowRight size={14} />
              </button>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <p>No transactions logged yet.</p>
              <div className="hint">Use the form above to log your first coffee or purchase!</div>
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
                        <td style={{ color: 'var(--mocha-muted)', fontWeight: '600' }}>{exp.date}</td>
                        <td style={{ fontWeight: '700', color: 'var(--coffee-dark)' }}>{exp.description}</td>
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
                        <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--coffee-primary)' }}>
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
