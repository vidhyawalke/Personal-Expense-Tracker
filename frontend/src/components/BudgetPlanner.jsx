import React, { useState } from 'react';
import { Compass, TrendingUp, Save, Settings, Lock, Unlock, CheckCircle2, AlertTriangle, Calendar, DollarSign, PieChart } from 'lucide-react';
import confetti from 'canvas-confetti';

const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

export default function BudgetPlanner({ budgetData, onUpdateBudget, expenses, currency = '₹' }) {
  const savingsConfig = budgetData?.savings_target || {};
  
  // Cadence: 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [cadence, setCadence] = useState(savingsConfig.cadence || 'daily');
  const [incomeInput, setIncomeInput] = useState(budgetData?.monthly_income ? String(budgetData.monthly_income) : '');
  const [budgetInput, setBudgetInput] = useState(budgetData?.monthly_budget ? String(budgetData.monthly_budget) : '');
  const [goalInput, setGoalInput] = useState(savingsConfig.goal ? String(savingsConfig.goal) : '');
  const [stepInput, setStepInput] = useState(savingsConfig.target_box_amount ? String(savingsConfig.target_box_amount) : '');
  
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Active saved settings
  const savedBoxes = savingsConfig.saved_boxes || [];
  const activeGoal = Number(savingsConfig.goal) || 0;
  const activeStep = Number(savingsConfig.target_box_amount) || 0;
  const activeCadence = savingsConfig.cadence || 'daily';
  const isSettingsLocked = !(activeGoal > 0 && activeStep > 0 && savingsConfig.isConfigSaved);

  // Parse input values
  const parsedIncome = parseFloat(incomeInput) || 0;
  const parsedBudget = parseFloat(budgetInput) || 0;
  const liveGoal = parseFloat(goalInput) || 0;
  const liveStep = parseFloat(stepInput) || 0;

  // Financial Analyst Metrics: Money in Hand
  const disposableMonthly = Math.max(0, parsedIncome - parsedBudget);
  const disposableDaily = round2(disposableMonthly / 30.42);
  const disposableWeekly = round2(disposableMonthly / 4.33);
  const disposableYearly = round2(disposableMonthly * 12);

  // Equivalent monthly savings requirement based on chosen cadence
  let monthlyRequiredForStep = 0;
  let periodCapacity = 0;
  let maxHorizonSteps = 365;

  if (cadence === 'daily') {
    monthlyRequiredForStep = round2(liveStep * 30.42);
    periodCapacity = disposableDaily;
    maxHorizonSteps = 365; // 1 year of days
  } else if (cadence === 'weekly') {
    monthlyRequiredForStep = round2(liveStep * 4.33);
    periodCapacity = disposableWeekly;
    maxHorizonSteps = 52; // 1 year of weeks
  } else if (cadence === 'monthly') {
    monthlyRequiredForStep = liveStep;
    periodCapacity = disposableMonthly;
    maxHorizonSteps = 12; // 1 year of months
  } else if (cadence === 'yearly') {
    monthlyRequiredForStep = round2(liveStep / 12);
    periodCapacity = disposableYearly;
    maxHorizonSteps = 5; // 5 years
  }

  // Live steps calculation
  const liveCalculatedSteps = (liveGoal > 0 && liveStep > 0) ? Math.ceil(round2(liveGoal / liveStep)) : 0;
  const exceedsMaxSteps = liveCalculatedSteps > maxHorizonSteps;

  // Cashflow over-allocation check
  const isOverAllocatingCashflow = liveStep > 0 && periodCapacity > 0 && liveStep > periodCapacity;

  // Active matrix calculation
  const activeMaxHorizon = activeCadence === 'daily' ? 365 : activeCadence === 'weekly' ? 52 : activeCadence === 'monthly' ? 12 : 5;
  const totalActiveSteps = (activeGoal > 0 && activeStep > 0) ? Math.min(activeMaxHorizon, Math.ceil(round2(activeGoal / activeStep))) : 0;
  const totalSavedFromMatrix = round2(Math.min(activeGoal, savedBoxes.length * activeStep));
  const matrixProgressPercent = activeGoal > 0 ? Math.min(100, round2((totalSavedFromMatrix / activeGoal) * 100)) : 0;

  // 50/30/20 Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const needsTarget = round2(parsedIncome * 0.50);
  const wantsTarget = round2(parsedIncome * 0.30);
  const savingsTarget = round2(parsedIncome * 0.20);

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
  const actualSavings = round2(Math.max(0, parsedIncome - totalSpent));

  // Cadence labels
  const unitName = cadence === 'daily' ? 'day' : cadence === 'weekly' ? 'week' : cadence === 'monthly' ? 'month' : 'year';
  const unitPlural = cadence === 'daily' ? 'days' : cadence === 'weekly' ? 'weeks' : cadence === 'monthly' ? 'months' : 'years';
  const activeUnitPrefix = activeCadence === 'daily' ? 'Day' : activeCadence === 'weekly' ? 'Wk' : activeCadence === 'monthly' ? 'Mo' : 'Yr';

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setValidationError('');

    if (isNaN(parsedIncome) || parsedIncome <= 0) {
      setValidationError("Please enter your positive monthly income.");
      return;
    }
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setValidationError("Please enter your monthly spending limit.");
      return;
    }
    if (parsedBudget > parsedIncome) {
      setValidationError(`Spending limit (${currency}${parsedBudget}) exceeds monthly income (${currency}${parsedIncome})! You cannot save with negative cashflow.`);
      return;
    }
    if (isNaN(liveGoal) || liveGoal <= 0) {
      setValidationError("Please enter a valid savings goal amount.");
      return;
    }
    if (isNaN(liveStep) || liveStep <= 0) {
      setValidationError(`Please enter the amount you can save per ${unitName}.`);
      return;
    }

    // Financial Analyst Verification: Check Money in Hand
    if (liveStep > periodCapacity) {
      setValidationError(`Financial Deficit: Saving ${currency}${liveStep}/${unitName} requires ${currency}${monthlyRequiredForStep}/month. Your disposable money in hand (Income ${currency}${parsedIncome} - Limit ${currency}${parsedBudget}) is only ${currency}${disposableMonthly}/month (${currency}${periodCapacity}/${unitName}). Please reduce your save amount to stay solvent.`);
      return;
    }

    // Financial Analyst Horizon Verification
    const calculatedSteps = Math.ceil(round2(liveGoal / liveStep));
    if (calculatedSteps > maxHorizonSteps) {
      const minStepToFit = Math.ceil(round2(liveGoal / maxHorizonSteps));
      const horizonYears = (calculatedSteps / (cadence === 'daily' ? 365 : cadence === 'weekly' ? 52 : 12)).toFixed(1);
      setValidationError(`Timeline Exceeded: Saving ${currency}${liveStep} per ${unitName} would take ${calculatedSteps} ${unitPlural} (${horizonYears} years) to reach ${currency}${liveGoal}! For a realistic 1-year ${cadence} target (max ${maxHorizonSteps} steps), you need to save at least ${currency}${minStepToFit} per ${unitName}.`);
      return;
    }

    const isSameTarget = liveGoal === activeGoal && liveStep === activeStep && cadence === activeCadence;
    const finalSavedBoxes = isSameTarget ? savedBoxes : [];

    onUpdateBudget({
      monthly_income: round2(parsedIncome),
      monthly_budget: round2(parsedBudget),
      savings_target: {
        goal: round2(liveGoal),
        target_box_amount: round2(liveStep),
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
          colors: ['#b86b28', '#523222', '#e07a5f', '#3b82f6', '#10b981', '#ec4899', '#f59e0b']
        });
      } catch {
        // Fallback
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
            <Settings size={22} color="var(--coffee-primary)" />
            <span>Budget & Financial Milestone Configuration</span>
          </div>
          {activeGoal > 0 && activeStep > 0 && savingsConfig.isConfigSaved && (
            <span style={{ fontSize: '0.84rem', color: 'var(--coffee-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
              <Unlock size={16} /> Tracker Active
            </span>
          )}
        </div>

        {/* Disposable Money in Hand Metric Bar */}
        {parsedIncome > 0 && (
          <div style={{
            background: 'var(--coffee-light)',
            border: '1px solid var(--coffee-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--coffee-dark)', fontWeight: '600' }}>
              <span>Disposable Money in Hand: </span>
              <strong>{currency}{disposableMonthly.toFixed(2)}/mo</strong>
              <span style={{ color: 'var(--mocha-muted)', fontSize: '0.82rem', marginLeft: '6px' }}>
                ({currency}{disposableDaily.toFixed(2)}/day · {currency}{disposableWeekly.toFixed(2)}/week)
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--caramel-accent)', fontWeight: '700' }}>
              Max safe saving rate: {parsedIncome > 0 ? ((disposableMonthly / parsedIncome) * 100).toFixed(0) : 0}% of income
            </span>
          </div>
        )}

        {validationError && (
          <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
            <AlertTriangle size={20} />
            <div style={{ lineHeight: 1.4 }}>{validationError}</div>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="alert-banner success" style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={20} />
            <span>Settings saved! Your milestone tracker is active below.</span>
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
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'yearly' ? 'active' : ''}`}
                  onClick={() => setCadence('yearly')}
                >
                  Yearly
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

          {/* Financial Analyst Forecast Box */}
          {liveGoal > 0 && liveStep > 0 && (
            <div className="calc-preview-box">
              <div className="calc-preview-row">
                <div>
                  <strong>Financial Forecast: </strong>
                  <span>
                    Saving {currency}{round2(liveStep)} per {unitName} ({currency}{monthlyRequiredForStep}/mo) will reach {currency}{round2(liveGoal)} in <strong>{liveCalculatedSteps} {liveCalculatedSteps === 1 ? unitName : unitPlural}</strong>.
                  </span>
                </div>
                {exceedsMaxSteps ? (
                  <span style={{ color: 'var(--color-danger)', fontWeight: '800', fontSize: '0.86rem' }}>
                    ⚠️ Exceeds {maxHorizonSteps}-step {cadence} limit ({liveCalculatedSteps} {unitPlural})
                  </span>
                ) : isOverAllocatingCashflow ? (
                  <span style={{ color: 'var(--color-danger)', fontWeight: '800', fontSize: '0.86rem' }}>
                    ⚠️ Exceeds money in hand ({currency}{periodCapacity}/{unitName})
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-success)', fontWeight: '800', fontSize: '0.86rem' }}>
                    ✓ Feasible & solvent ({liveCalculatedSteps} blocks)
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={exceedsMaxSteps || isOverAllocatingCashflow}
            >
              <Save size={16} /> Save Settings & Unlock Tracker
            </button>
          </div>
        </form>
      </div>

      {/* 50 / 30 / 20 Growth Breakdown */}
      {parsedIncome > 0 && (
        <div className="harmony-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Compass size={22} color="var(--coffee-primary)" />
                <span>50 / 30 / 20 Allocation Model</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--mocha-muted)', marginTop: '2px' }}>
                Ideal distribution on {currency}{parsedIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} monthly income.
              </div>
            </div>
          </div>

          <div className="rule-grid">
            <div className="rule-box needs">
              <div>
                <div className="rule-percentage">50%</div>
                <div className="rule-title">Needs</div>
                <div className="rule-desc">Essentials: Rent, groceries, utilities, commute, insurance.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{needsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--mocha-muted)', marginTop: '4px' }}>
                  Spent: {currency}{actualNeeds.toFixed(2)} ({needsTarget > 0 ? ((actualNeeds / needsTarget) * 100).toFixed(0) : 0}%)
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, needsTarget > 0 ? (actualNeeds / needsTarget) * 100 : 0)}%`,
                      background: 'var(--cat-housing)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rule-box wants">
              <div>
                <div className="rule-percentage">30%</div>
                <div className="rule-title">Wants</div>
                <div className="rule-desc">Lifestyle: Coffee, restaurants, entertainment, subscriptions.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{wantsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--mocha-muted)', marginTop: '4px' }}>
                  Spent: {currency}{totalWantsWithOther.toFixed(2)} ({wantsTarget > 0 ? ((totalWantsWithOther / wantsTarget) * 100).toFixed(0) : 0}%)
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, wantsTarget > 0 ? (totalWantsWithOther / wantsTarget) * 100 : 0)}%`,
                      background: 'var(--caramel-accent)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rule-box savings">
              <div>
                <div className="rule-percentage">20%</div>
                <div className="rule-title">Savings & Growth</div>
                <div className="rule-desc">Future: Emergency fund, investments, debt acceleration.</div>
              </div>
              <div>
                <div className="rule-target-amount">
                  Target: {currency}{savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--mocha-muted)', marginTop: '4px' }}>
                  Retained: {currency}{actualSavings.toFixed(2)} ({savingsTarget > 0 ? ((actualSavings / savingsTarget) * 100).toFixed(0) : 0}%)
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, savingsTarget > 0 ? (actualSavings / savingsTarget) * 100 : 0)}%`,
                      background: 'var(--coffee-primary)'
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
                Enter your target savings goal and the amount to save per {unitName} above, then click <strong>"Save Settings & Unlock Tracker"</strong> to generate your milestone blocks.
              </p>
            </div>
          </div>
        )}

        <div className={`savings-matrix-container ${isSettingsLocked ? 'is-blurred' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={22} color="var(--coffee-primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--coffee-dark)' }}>
                  Savings Goal Milestones
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--mocha-muted)', marginTop: '4px' }}>
                Goal: {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} in {totalActiveSteps} steps of {currency}{activeStep.toLocaleString('en-US', { minimumFractionDigits: 2 })} each. Click any block when you save!
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--coffee-dark)' }}>
                {currency}{totalSavedFromMatrix.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.88rem', color: 'var(--mocha-muted)', fontWeight: '600' }}>/ {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--coffee-primary)' }}>
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
