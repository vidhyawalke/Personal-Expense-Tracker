import React, { useState, useMemo } from 'react';
import { Compass, TrendingUp, Save, Settings, Lock, Unlock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

// Safe 2-decimal floating point precision
const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

export default function BudgetPlanner({ budgetData, onUpdateBudget, expenses, currency = '₹' }) {
  const savingsConfig = budgetData?.savings_target || {};
  
  // Cadence: 'daily' | 'weekly' | 'monthly'
  const [cadence, setCadence] = useState(savingsConfig.cadence || 'daily');
  const [incomeInput, setIncomeInput] = useState(budgetData?.monthly_income ? String(budgetData.monthly_income) : '');
  const [budgetInput, setBudgetInput] = useState(budgetData?.monthly_budget ? String(budgetData.monthly_budget) : '');
  const [goalInput, setGoalInput] = useState(savingsConfig.goal ? String(savingsConfig.goal) : '');
  const [stepInput, setStepInput] = useState(savingsConfig.target_box_amount ? String(savingsConfig.target_box_amount) : '');
  
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Active saved settings from parent budgetData
  const savedBoxes = savingsConfig.saved_boxes || [];
  const activeGoal = Number(savingsConfig.goal) || 0;
  const activeStep = Number(savingsConfig.target_box_amount) || 0;
  const activeCadence = savingsConfig.cadence || 'daily';
  const isSettingsLocked = !(activeGoal > 0 && activeStep > 0 && savingsConfig.isConfigSaved);

  // Live input parsing
  const liveGoal = parseFloat(goalInput) || 0;
  const liveStep = parseFloat(stepInput) || 0;
  
  // Live calculation of required steps
  const liveCalculatedSteps = (liveGoal > 0 && liveStep > 0) ? Math.ceil(round2(liveGoal / liveStep)) : 0;
  const exceedsMaxSteps = liveCalculatedSteps > 365;

  // Active matrix calculation
  const totalActiveSteps = (activeGoal > 0 && activeStep > 0) ? Math.min(365, Math.ceil(round2(activeGoal / activeStep))) : 0;
  const totalSavedFromMatrix = round2(Math.min(activeGoal, savedBoxes.length * activeStep));
  const matrixProgressPercent = activeGoal > 0 ? Math.min(100, round2((totalSavedFromMatrix / activeGoal) * 100)) : 0;

  // Income & 50/30/20 Calculations
  const income = Number(budgetData?.monthly_income) || 0;
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const needsTarget = round2(income * 0.50);
  const wantsTarget = round2(income * 0.30);
  const savingsTarget = round2(income * 0.20);

  const needsCategories = ['Housing & Utilities', 'Food & Dining', 'Transportation', 'Health & Wellness', 'Fixed Expenses'];
  const wantsCategories = ['Entertainment', 'Personal & Shopping', 'Shopping'];

  const actualNeeds = round2(expenses
    .filter(e => needsCategories.some(nc => nc.toLowerCase() === (e.category || '').toLowerCase()))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0));

  const actualWants = round2(expenses
    .filter(e => wantsCategories.some(wc => wc.toLowerCase() === (e.category || '').toLowerCase()))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0));

  const actualOther = round2(totalSpent - (actualNeeds + actualWants));
  const totalWantsWithOther = round2(actualWants + (actualOther > 0 ? actualOther : 0));
  const actualSavings = round2(Math.max(0, income - totalSpent));

  // Cadence labels
  const unitName = cadence === 'daily' ? 'day' : cadence === 'weekly' ? 'week' : 'month';
  const unitPlural = cadence === 'daily' ? 'days' : cadence === 'weekly' ? 'weeks' : 'months';
  const activeUnitPrefix = activeCadence === 'daily' ? 'Day' : activeCadence === 'weekly' ? 'Wk' : 'Mo';

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setValidationError('');

    const parsedIncome = parseFloat(incomeInput);
    const parsedBudget = parseFloat(budgetInput);
    const parsedGoal = parseFloat(goalInput);
    const parsedStep = parseFloat(stepInput);

    if (isNaN(parsedIncome) || parsedIncome <= 0) {
      setValidationError("Please enter a valid monthly income.");
      return;
    }
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setValidationError("Please enter a valid spending limit.");
      return;
    }
    if (isNaN(parsedGoal) || parsedGoal <= 0) {
      setValidationError("Please enter a savings goal amount (e.g. 200).");
      return;
    }
    if (isNaN(parsedStep) || parsedStep <= 0) {
      setValidationError(`Please enter the amount you can save per ${unitName} (e.g. 10).`);
      return;
    }

    const calculatedSteps = Math.ceil(round2(parsedGoal / parsedStep));
    if (calculatedSteps > 365) {
      const minStepToFit = Math.ceil(round2(parsedGoal / 365));
      setValidationError(`That would take ${calculatedSteps} ${unitPlural}! The limit is 365 steps. Please save at least ${currency}${minStepToFit} per ${unitName}.`);
      return;
    }

    // Keep existing saved boxes if goal & step remained identical, otherwise reset
    const isSameTarget = parsedGoal === activeGoal && parsedStep === activeStep && cadence === activeCadence;
    const finalSavedBoxes = isSameTarget ? savedBoxes : [];

    onUpdateBudget({
      monthly_income: round2(parsedIncome),
      monthly_budget: round2(parsedBudget),
      savings_target: {
        goal: round2(parsedGoal),
        target_box_amount: round2(parsedStep),
        cadence: cadence,
        isConfigSaved: true,
        saved_boxes: finalSavedBoxes
      }
    });

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleToggleBox = (boxNumber) => {
    let updated;
    const isAdding = !savedBoxes.includes(boxNumber);
    if (isAdding) {
      updated = [...savedBoxes, boxNumber];
      try {
        // Multi-colored rainbow mix confetti
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#ff0055', '#00e1d9', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#10b981', '#f59e0b']
        });
      } catch {
        // Confetti fallback
      }
    } else {
      updated = savedBoxes.filter(n => n !== boxNumber);
    }

    onUpdateBudget({
      savings_target: {
        ...savingsConfig,
        saved_boxes: updated
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Settings Card */}
      <div className="harmony-card">
        <div className="card-header">
          <div className="card-title">
            <Settings size={22} color="var(--mint-light)" />
            <span>Budget & Savings Configuration</span>
          </div>
          {activeGoal > 0 && activeStep > 0 && savingsConfig.isConfigSaved && (
            <span style={{ fontSize: '0.8rem', color: 'var(--mint-light)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
              <Unlock size={14} /> Tracker Active
            </span>
          )}
        </div>

        {validationError && (
          <div className="alert-banner danger" style={{ marginBottom: '14px' }}>
            <AlertTriangle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="alert-banner success" style={{ marginBottom: '14px' }}>
            <CheckCircle2 size={18} />
            <span>Budget settings saved! Tracker unlocked below.</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            
            <div className="form-group">
              <label className="form-label">Monthly Income ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 25000"
                className="form-input"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Spending Limit ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 18000"
                className="form-input"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Savings Goal ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 200 or 5000"
                className="form-input"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Goal Cadence (Frequency)</label>
              <div className="cadence-selector">
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'daily' ? 'active' : ''}`}
                  onClick={() => setCadence('daily')}
                >
                  Daily
                </button>
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'weekly' ? 'active' : ''}`}
                  onClick={() => setCadence('weekly')}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'monthly' ? 'active' : ''}`}
                  onClick={() => setCadence('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Save per {unitName} ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 10"
                className="form-input"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                required
              />
            </div>

          </div>

          {/* Live Calculation Preview */}
          {liveGoal > 0 && liveStep > 0 && (
            <div className="calc-preview-box">
              <div>
                <span>Calculation: </span>
                <span className="calc-preview-highlight">
                  Saving {currency}{round2(liveStep)} per {unitName} will take {liveCalculatedSteps} {liveCalculatedSteps === 1 ? unitName : unitPlural} to save {currency}{round2(liveGoal)}.
                </span>
              </div>
              {exceedsMaxSteps ? (
                <span style={{ color: 'var(--color-danger)', fontWeight: '700', fontSize: '0.82rem' }}>
                  ⚠️ Exceeds 365 steps limit (Max 365)
                </span>
              ) : (
                <span style={{ color: 'var(--mint-light)', fontWeight: '700', fontSize: '0.82rem' }}>
                  ✓ {liveCalculatedSteps} blocks will be loaded
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={exceedsMaxSteps}
            >
              <Save size={16} /> Save Settings & Unlock Tracker
            </button>
          </div>
        </form>
      </div>

      {/* 50 / 30 / 20 Rule Section — Revealed after income is established */}
      {income > 0 && (
        <div className="harmony-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Compass size={20} color="var(--mint-light)" />
                <span>50 / 30 / 20 Budget Breakdown</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Balanced distribution based on {currency}{income.toLocaleString('en-US', { minimumFractionDigits: 2 })} monthly income.
              </div>
            </div>
          </div>

          <div className="rule-grid">
            <div className="rule-box needs">
              <div>
                <div className="rule-percentage">50%</div>
                <div className="rule-title">Needs</div>
                <div className="rule-desc">Essentials: Rent, groceries, utility bills, commute, healthcare.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{needsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Spent: {currency}{actualNeeds.toFixed(2)} ({needsTarget > 0 ? ((actualNeeds / needsTarget) * 100).toFixed(0) : 0}%)
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
                <div className="rule-desc">Lifestyle: Dining out, hobbies, subscriptions, leisure, shopping.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{wantsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Spent: {currency}{totalWantsWithOther.toFixed(2)} ({wantsTarget > 0 ? ((totalWantsWithOther / wantsTarget) * 100).toFixed(0) : 0}%)
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
                <div className="rule-title">Savings & Debt</div>
                <div className="rule-desc">Future: Emergency fund, investments, retirement, loan repayments.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Retained: {currency}{actualSavings.toFixed(2)} ({savingsTarget > 0 ? ((actualSavings / savingsTarget) * 100).toFixed(0) : 0}%)
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

      {/* Savings Goal Tracker — With Blur Lock Protection */}
      <div className="savings-tracker-wrapper">
        
        {isSettingsLocked && (
          <div className="blur-lock-overlay">
            <div className="blur-lock-card">
              <div className="blur-lock-icon">🔒</div>
              <h4>Savings Tracker Locked</h4>
              <p>
                Choose your savings goal and the amount to save per {unitName} above, then click <strong>"Save Settings & Unlock Tracker"</strong> to generate your interactive tracking blocks.
              </p>
            </div>
          </div>
        )}

        <div className={`savings-matrix-container ${isSettingsLocked ? 'is-blurred' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={22} color="var(--mint-light)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Savings Goal Tracker
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Save {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} in {totalActiveSteps} steps of {currency}{activeStep.toLocaleString('en-US', { minimumFractionDigits: 2 })} each. Click any box when you complete your saving.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {currency}{totalSavedFromMatrix.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--mint-light)' }}>
                {savedBoxes.length} of {totalActiveSteps} done ({matrixProgressPercent}%)
              </div>
            </div>
          </div>

          <div className="progress-bar-bg" style={{ height: '10px', marginTop: '14px', marginBottom: '20px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${matrixProgressPercent}%` }}
            />
          </div>

          <div className="matrix-grid">
            {Array.from({ length: totalActiveSteps }).map((_, idx) => {
              const boxNum = idx + 1;
              const isSaved = savedBoxes.includes(boxNum);
              return (
                <div
                  key={boxNum}
                  className={`matrix-box ${isSaved ? 'saved' : ''}`}
                  onClick={() => handleToggleBox(boxNum)}
                  title={`${activeUnitPrefix} ${boxNum}: ${currency}${activeStep}`}
                >
                  <span>{isSaved ? '✓' : `${activeUnitPrefix} ${boxNum}`}</span>
                  <span className="matrix-box-sub">{currency}{activeStep}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
