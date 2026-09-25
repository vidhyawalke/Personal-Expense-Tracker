import React, { useState } from 'react';
import { Compass, TrendingUp, Save, Settings, Lock, Unlock, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  // Active saved configuration
  const savedBoxes = savingsConfig.saved_boxes || [];
  const activeGoal = Number(savingsConfig.goal) || 0;
  const activeStep = Number(savingsConfig.target_box_amount) || 0;
  const activeCadence = savingsConfig.cadence || 'daily';
  const isSettingsLocked = !(activeGoal > 0 && activeStep > 0 && savingsConfig.isConfigSaved);

  // Live input parsing
  const liveGoal = parseFloat(goalInput) || 0;
  const liveStep = parseFloat(stepInput) || 0;
  
  // Live calculation of days/weeks/months
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
      setValidationError("Please enter a valid positive monthly income.");
      return;
    }
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setValidationError("Please enter a valid positive spending limit.");
      return;
    }
    if (isNaN(parsedGoal) || parsedGoal <= 0) {
      setValidationError(`Please enter a savings goal amount (e.g. 5000 or 200).`);
      return;
    }
    if (isNaN(parsedStep) || parsedStep <= 0) {
      setValidationError(`Please enter the amount you want to save per ${unitName} (e.g. 50 or 10).`);
      return;
    }

    const calculatedSteps = Math.ceil(round2(parsedGoal / parsedStep));
    if (calculatedSteps > 365) {
      const minStepToFit = Math.ceil(round2(parsedGoal / 365));
      setValidationError(`That would take ${calculatedSteps} ${unitPlural}! The limit is 365 steps. Increase your saving to at least ${currency}${minStepToFit} per ${unitName}.`);
      return;
    }

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
        confetti({
          particleCount: 50,
          spread: 75,
          origin: { y: 0.7 },
          colors: ['#2e9e66', '#e07a5f', '#ffbe0b', '#3a86ff', '#8338ec', '#ff006e', '#00b4d8']
        });
      } catch {
        // Animation fallback
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
            <Settings size={22} color="var(--growth-green)" />
            <span>Budget & Savings Configuration</span>
          </div>
          {activeGoal > 0 && activeStep > 0 && savingsConfig.isConfigSaved && (
            <span style={{ fontSize: '0.84rem', color: 'var(--growth-green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
              <Unlock size={16} /> Tracker Unlocked
            </span>
          )}
        </div>

        {validationError && (
          <div className="alert-banner danger" style={{ marginBottom: '14px' }}>
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="alert-banner success" style={{ marginBottom: '14px' }}>
            <CheckCircle2 size={18} />
            <span>Configuration saved! Tracker blocks are now active below.</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            
            <div className="form-group">
              <label className="form-label">Monthly Income ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 50000"
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
                placeholder="e.g. 35000"
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
                placeholder="e.g. 200 or 10000"
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
                placeholder="e.g. 10 or 500"
                className="form-input"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                required
              />
            </div>

          </div>

          {/* Mathematical Duration Preview */}
          {liveGoal > 0 && liveStep > 0 && (
            <div className="calc-preview-box">
              <div>
                <span>Mathematical Forecast: </span>
                <span className="calc-preview-highlight">
                  Saving {currency}{round2(liveStep)} per {unitName} covers {currency}{round2(liveGoal)} in exactly {liveCalculatedSteps} {liveCalculatedSteps === 1 ? unitName : unitPlural}.
                </span>
              </div>
              {exceedsMaxSteps ? (
                <span style={{ color: 'var(--color-danger)', fontWeight: '800', fontSize: '0.86rem' }}>
                  ⚠️ Exceeds 365 steps ceiling (Max 365)
                </span>
              ) : (
                <span style={{ color: 'var(--growth-green)', fontWeight: '800', fontSize: '0.86rem' }}>
                  ✓ {liveCalculatedSteps} interactive blocks will load
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
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

      {/* 50 / 30 / 20 Budget Breakdown */}
      {income > 0 && (
        <div className="harmony-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Compass size={22} color="var(--growth-green)" />
                <span>50 / 30 / 20 Growth Allocation</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--charcoal-muted)', marginTop: '2px' }}>
                Balanced proportion based on your {currency}{income.toLocaleString('en-US', { minimumFractionDigits: 2 })} monthly income.
              </div>
            </div>
          </div>

          <div className="rule-grid">
            <div className="rule-box needs">
              <div>
                <div className="rule-percentage">50%</div>
                <div className="rule-title">Needs</div>
                <div className="rule-desc">Essentials: Rent, groceries, utility bills, health, commute.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{needsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--charcoal-muted)', marginTop: '4px' }}>
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
                <div className="rule-desc">Lifestyle: Dining out, leisure, subscriptions, hobbies.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{wantsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--charcoal-muted)', marginTop: '4px' }}>
                  Spent: {currency}{totalWantsWithOther.toFixed(2)} ({wantsTarget > 0 ? ((totalWantsWithOther / wantsTarget) * 100).toFixed(0) : 0}%)
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, wantsTarget > 0 ? (totalWantsWithOther / wantsTarget) * 100 : 0)}%`,
                      background: 'var(--terracotta)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rule-box savings">
              <div>
                <div className="rule-percentage">20%</div>
                <div className="rule-title">Savings & Growth</div>
                <div className="rule-desc">Future: Emergency fund, investments, retirement, debt payoff.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--charcoal-muted)', marginTop: '4px' }}>
                  Saved so far: {currency}{actualSavings.toFixed(2)} ({savingsTarget > 0 ? ((actualSavings / savingsTarget) * 100).toFixed(0) : 0}%)
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, savingsTarget > 0 ? (actualSavings / savingsTarget) * 100 : 0)}%`,
                      background: 'var(--growth-green)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Goal Tracker — Blur-Lock Protected */}
      <div className="savings-tracker-wrapper">
        
        {isSettingsLocked && (
          <div className="blur-lock-overlay">
            <div className="blur-lock-card">
              <div className="blur-lock-icon">🔒</div>
              <h4>Savings Goal Tracker Locked</h4>
              <p>
                Enter your target savings amount and the amount to save per {unitName} above, then click <strong>"Save Settings & Unlock Tracker"</strong> to generate your milestone blocks.
              </p>
            </div>
          </div>
        )}

        <div className={`savings-matrix-container ${isSettingsLocked ? 'is-blurred' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={22} color="var(--growth-green)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Savings Goal Milestones
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--charcoal-muted)', marginTop: '4px' }}>
                Goal: {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} in {totalActiveSteps} steps of {currency}{activeStep.toLocaleString('en-US', { minimumFractionDigits: 2 })} each. Click any block when you save!
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {currency}{totalSavedFromMatrix.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.88rem', color: 'var(--charcoal-muted)', fontWeight: '600' }}>/ {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--growth-green)' }}>
                {savedBoxes.length} of {totalActiveSteps} done ({matrixProgressPercent}%)
              </div>
            </div>
          </div>

          <div className="progress-bar-bg" style={{ height: '12px', marginTop: '16px', marginBottom: '22px' }}>
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
