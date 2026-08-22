import React, { useState } from 'react';
import { Compass, TrendingUp, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BudgetPlanner({ budgetData, onUpdateBudget, expenses }) {
  const [incomeInput, setIncomeInput] = useState(budgetData?.monthly_income || 3500);
  const [budgetInput, setBudgetInput] = useState(budgetData?.monthly_budget || 2400);

  const savedBoxes = budgetData?.savings_target?.saved_boxes || [];
  const goal = budgetData?.savings_target?.goal || 20000;
  const boxValue = budgetData?.savings_target?.target_box_amount || 200;

  const totalSavedFromMatrix = savedBoxes.length * boxValue;
  const matrixProgressPercent = Math.min(100, Math.round((totalSavedFromMatrix / goal) * 100));

  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const needsTarget = incomeInput * 0.50;
  const wantsTarget = incomeInput * 0.30;
  const savingsTarget = incomeInput * 0.20;

  const needsCategories = ['Housing & Utilities', 'Food & Dining', 'Transportation', 'Health & Wellness', 'Fixed Expenses'];
  const wantsCategories = ['Entertainment', 'Personal & Shopping', 'Shopping'];

  const actualNeeds = expenses
    .filter(e => needsCategories.some(nc => nc.toLowerCase() === (e.category || '').toLowerCase()))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const actualWants = expenses
    .filter(e => wantsCategories.some(wc => wc.toLowerCase() === (e.category || '').toLowerCase()))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const actualOther = totalSpent - (actualNeeds + actualWants);
  const totalWantsWithOther = actualWants + (actualOther > 0 ? actualOther : 0);
  const actualSavings = Math.max(0, incomeInput - totalSpent);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const parsedIncome = parseFloat(incomeInput);
    const parsedBudget = parseFloat(budgetInput);

    if (isNaN(parsedIncome) || parsedIncome < 0 || isNaN(parsedBudget) || parsedBudget < 0) {
      alert("Please enter valid positive numbers for income and budget.");
      return;
    }

    onUpdateBudget({
      monthly_income: parsedIncome,
      monthly_budget: parsedBudget
    });
    alert("Budget settings updated successfully.");
  };

  const handleToggleBox = (boxNumber) => {
    let updated;
    if (savedBoxes.includes(boxNumber)) {
      updated = savedBoxes.filter(n => n !== boxNumber);
    } else {
      updated = [...savedBoxes, boxNumber];
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.75 },
          colors: ['#2d6a4f', '#52b788', '#74c69d', '#d8f3dc']
        });
      } catch {
        // Confetti animation fallback
      }
    }

    onUpdateBudget({
      saved_boxes: updated
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="harmony-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Compass size={22} color="var(--forest-800)" />
              <span>The 50 / 30 / 20 Balanced Financial Model</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              A proven framework allocating income into Essential Needs, Mindful Wants, and Future Growth.
            </div>
          </div>

          <form onSubmit={handleSaveConfig} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '4px' }}>Monthly Income ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ width: '140px', padding: '8px 12px' }}
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '4px' }}>Monthly Budget ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ width: '140px', padding: '8px 12px' }}
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
              <Save size={16} /> Save
            </button>
          </form>
        </div>

        <div className="rule-grid">
          
          <div className="rule-box needs">
            <div>
              <div className="rule-percentage">50%</div>
              <div className="rule-title">Essential Needs</div>
              <div className="rule-desc">Housing, Groceries, Utilities, Healthcare, and Transportation.</div>
            </div>
            <div>
              <div className="rule-target-amount">
                Target: ${needsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Actual spent: ${actualNeeds.toFixed(2)} ({needsTarget > 0 ? ((actualNeeds / needsTarget) * 100).toFixed(0) : 0}%)
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, needsTarget > 0 ? (actualNeeds / needsTarget) * 100 : 0)}%`,
                    background: 'var(--color-info)'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rule-box wants">
            <div>
              <div className="rule-percentage">30%</div>
              <div className="rule-title">Mindful Discretionary</div>
              <div className="rule-desc">Dining out, Leisure, Entertainment, Subscriptions, and Personal purchases.</div>
            </div>
            <div>
              <div className="rule-target-amount">
                Target: ${wantsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Actual spent: ${totalWantsWithOther.toFixed(2)} ({wantsTarget > 0 ? ((totalWantsWithOther / wantsTarget) * 100).toFixed(0) : 0}%)
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, wantsTarget > 0 ? (totalWantsWithOther / wantsTarget) * 100 : 0)}%`,
                    background: 'var(--color-warning)'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rule-box savings">
            <div>
              <div className="rule-percentage">20%</div>
              <div className="rule-title">Growth & Savings</div>
              <div className="rule-desc">Emergency reserve, Investments, Debt reduction, and Long-term goals.</div>
            </div>
            <div>
              <div className="rule-target-amount">
                Target: ${savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Projected reserve: ${actualSavings.toFixed(2)} ({savingsTarget > 0 ? ((actualSavings / savingsTarget) * 100).toFixed(0) : 0}%)
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, savingsTarget > 0 ? (actualSavings / savingsTarget) * 100 : 0)}%`,
                    background: 'var(--color-success)'
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="savings-matrix-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="var(--forest-800)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--forest-900)' }}>
                Financial Growth & Milestone Roadmap
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Structured $20,000 Capital Milestone (100 incremental steps of $200 each).
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--forest-900)' }}>
              ${totalSavedFromMatrix.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ ${goal.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--sage-600)' }}>
              {savedBoxes.length} of 100 Milestones Completed ({matrixProgressPercent}%)
            </div>
          </div>
        </div>

        <div className="progress-bar-bg" style={{ height: '12px', marginTop: '16px', marginBottom: '24px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${matrixProgressPercent}%`, background: 'linear-gradient(90deg, var(--forest-800) 0%, var(--sage-500) 100%)' }}
          />
        </div>

        <div className="matrix-grid">
          {Array.from({ length: 100 }).map((_, idx) => {
            const boxNum = idx + 1;
            const isSaved = savedBoxes.includes(boxNum);
            return (
              <div
                key={boxNum}
                className={`matrix-box ${isSaved ? 'saved' : ''}`}
                onClick={() => handleToggleBox(boxNum)}
                title={`Milestone #${boxNum}: $${boxValue} allocation`}
              >
                {isSaved ? '✓' : boxNum}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
