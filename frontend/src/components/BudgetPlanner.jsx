import React, { useState } from 'react';
import { Compass, TrendingUp, Save, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BudgetPlanner({ budgetData, onUpdateBudget, expenses }) {
  const [incomeInput, setIncomeInput] = useState(budgetData?.monthly_income || '');
  const [budgetInput, setBudgetInput] = useState(budgetData?.monthly_budget || '');
  const [goalInput, setGoalInput] = useState(budgetData?.savings_target?.goal || '');
  const [stepInput, setStepInput] = useState(budgetData?.savings_target?.target_box_amount || '');

  const savedBoxes = budgetData?.savings_target?.saved_boxes || [];
  const goal = Number(budgetData?.savings_target?.goal) || 0;
  const boxValue = Number(budgetData?.savings_target?.target_box_amount) || 0;
  const totalSteps = (goal > 0 && boxValue > 0) ? Math.ceil(goal / boxValue) : 0;

  const totalSavedFromMatrix = savedBoxes.length * boxValue;
  const matrixProgressPercent = goal > 0 ? Math.min(100, Math.round((totalSavedFromMatrix / goal) * 100)) : 0;

  const income = Number(budgetData?.monthly_income) || 0;
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const needsTarget = income * 0.50;
  const wantsTarget = income * 0.30;
  const savingsTarget = income * 0.20;

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
  const actualSavings = Math.max(0, income - totalSpent);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const parsedIncome = parseFloat(incomeInput);
    const parsedBudget = parseFloat(budgetInput);
    const parsedGoal = parseFloat(goalInput);
    const parsedStep = parseFloat(stepInput);

    if (isNaN(parsedIncome) || parsedIncome < 0 || isNaN(parsedBudget) || parsedBudget < 0) {
      alert("Please enter valid numbers for income and spending limit.");
      return;
    }

    onUpdateBudget({
      monthly_income: parsedIncome,
      monthly_budget: parsedBudget,
      savings_target: {
        goal: (!isNaN(parsedGoal) && parsedGoal > 0) ? parsedGoal : 0,
        target_box_amount: (!isNaN(parsedStep) && parsedStep > 0) ? parsedStep : 0,
        saved_boxes: savedBoxes
      }
    });
    alert("Saved!");
  };

  const handleToggleBox = (boxNumber) => {
    let updated;
    if (savedBoxes.includes(boxNumber)) {
      updated = savedBoxes.filter(n => n !== boxNumber);
    } else {
      updated = [...savedBoxes, boxNumber];
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.75 },
          colors: ['#99cc66', '#254222', '#cae4c5', '#ece2b1']
        });
      } catch {
        // Confetti animation fallback
      }
    }

    onUpdateBudget({
      saved_boxes: updated
    });
  };

  const hasGoalSetup = goal > 0 && boxValue > 0;
  const displaySteps = hasGoalSetup ? Math.min(totalSteps, 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Settings card */}
      <div className="harmony-card">
        <div className="card-header">
          <div className="card-title">
            <Settings size={20} color="var(--sage-400)" />
            <span>Your Budget Settings</span>
          </div>
        </div>

        <form onSubmit={handleSaveConfig}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label">Monthly Income ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 3500"
                className="form-input"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label">Spending Limit ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 2000"
                className="form-input"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label">Savings Goal ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 10000"
                className="form-input"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label">Save per Step ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 100"
                className="form-input"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            <Save size={16} /> Save Settings
          </button>
        </form>
      </div>

      {/* 50/30/20 Rule */}
      {income > 0 && (
        <div className="harmony-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Compass size={20} color="var(--sage-400)" />
                <span>50 / 30 / 20 Rule</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Split your income: 50% needs, 30% wants, 20% savings.
              </div>
            </div>
          </div>

          <div className="rule-grid">
            <div className="rule-box needs">
              <div>
                <div className="rule-percentage">50%</div>
                <div className="rule-title">Needs</div>
                <div className="rule-desc">Rent, food, bills, health, transport.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: ${needsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Spent: ${actualNeeds.toFixed(2)} ({needsTarget > 0 ? ((actualNeeds / needsTarget) * 100).toFixed(0) : 0}%)
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
                <div className="rule-title">Wants</div>
                <div className="rule-desc">Fun, shopping, eating out, subscriptions.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: ${wantsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Spent: ${totalWantsWithOther.toFixed(2)} ({wantsTarget > 0 ? ((totalWantsWithOther / wantsTarget) * 100).toFixed(0) : 0}%)
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
                <div className="rule-title">Savings</div>
                <div className="rule-desc">Emergency fund, investments, debt payoff.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: ${savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Saved so far: ${actualSavings.toFixed(2)} ({savingsTarget > 0 ? ((actualSavings / savingsTarget) * 100).toFixed(0) : 0}%)
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
      )}

      {!income && (
        <div className="harmony-card">
          <div className="empty-state">
            <p>Set your monthly income above to see the 50/30/20 budget breakdown.</p>
          </div>
        </div>
      )}

      {/* Savings Goal Tracker */}
      {hasGoalSetup ? (
        <div className="savings-matrix-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--sage-400)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Savings Goal
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Save ${goal.toLocaleString()} in {displaySteps} steps of ${boxValue.toLocaleString()} each. Click a box when you save.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                ${totalSavedFromMatrix.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ ${goal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--sage-400)' }}>
                {savedBoxes.length} of {displaySteps} done ({matrixProgressPercent}%)
              </div>
            </div>
          </div>

          <div className="progress-bar-bg" style={{ height: '10px', marginTop: '14px', marginBottom: '20px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${matrixProgressPercent}%`, background: 'linear-gradient(90deg, var(--forest-700) 0%, var(--sage-400) 100%)' }}
            />
          </div>

          <div className="matrix-grid">
            {Array.from({ length: displaySteps }).map((_, idx) => {
              const boxNum = idx + 1;
              const isSaved = savedBoxes.includes(boxNum);
              return (
                <div
                  key={boxNum}
                  className={`matrix-box ${isSaved ? 'saved' : ''}`}
                  onClick={() => handleToggleBox(boxNum)}
                  title={`Step #${boxNum}: $${boxValue}`}
                >
                  {isSaved ? '✓' : boxNum}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="savings-matrix-container">
          <div className="empty-state">
            <TrendingUp size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <p>Set a savings goal and step amount above to start tracking.</p>
            <div className="hint">e.g. Goal: $10,000 — Step: $100 = 100 steps to track</div>
          </div>
        </div>
      )}

    </div>
  );
}
