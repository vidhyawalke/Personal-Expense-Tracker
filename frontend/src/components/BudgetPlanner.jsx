import React, { useState } from 'react';
import { Compass, TrendingUp, Save, Settings, CheckCircle2, AlertTriangle, Calendar, DollarSign, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';

const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

export default function BudgetPlanner({ budgetData, onUpdateBudget, expenses, currency = '₹' }) {
  const savingsConfig = budgetData?.savings_target || {};
  
  // Cadence: 'month' | 'year' (Direct user requirement: goal saving for month and year)
  const [cadence, setCadence] = useState(savingsConfig.cadence === 'year' ? 'year' : 'month');
  const [incomeInput, setIncomeInput] = useState(budgetData?.monthly_income ? String(budgetData.monthly_income) : '');
  const [budgetInput, setBudgetInput] = useState(budgetData?.monthly_budget ? String(budgetData.monthly_budget) : '');
  const [goalInput, setGoalInput] = useState(savingsConfig.goal ? String(savingsConfig.goal) : '');
  const [durationInput, setDurationInput] = useState(savingsConfig.duration ? String(savingsConfig.duration) : (cadence === 'year' ? '1' : '12'));
  
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Active saved configuration
  const savedBoxes = savingsConfig.saved_boxes || [];
  const activeGoal = Number(savingsConfig.goal) || 0;
  const activeCadence = savingsConfig.cadence === 'year' ? 'year' : 'month';
  const activeDuration = Number(savingsConfig.duration) || (activeCadence === 'year' ? 1 : 12);

  // Live parsed numbers
  const parsedIncome = parseFloat(incomeInput) || 0;
  const parsedBudget = parseFloat(budgetInput) || 0;
  const liveGoal = parseFloat(goalInput) || 0;
  const liveDuration = parseInt(durationInput, 10) || (cadence === 'year' ? 1 : 12);

  // Financial Analyst Math Formulas
  const disposableMonthly = Math.max(0, parsedIncome - parsedBudget);
  const disposableAnnual = round2(disposableMonthly * 12);

  // Timeframe calculation
  let totalMonths = 0;
  let targetPerPeriod = 0;
  let targetPerMonth = 0;
  let periodUnitLabel = '';
  let periodTotalUnits = 0;

  if (cadence === 'month') {
    totalMonths = Math.max(1, liveDuration);
    periodTotalUnits = totalMonths;
    periodUnitLabel = 'Month';
    targetPerPeriod = liveGoal > 0 ? round2(liveGoal / totalMonths) : 0;
    targetPerMonth = targetPerPeriod;
  } else {
    // Yearly goal
    const years = Math.max(1, liveDuration);
    totalMonths = years * 12;
    // If 1 year, we break into 12 monthly blocks; if multi-year, we break into year blocks
    periodTotalUnits = years === 1 ? 12 : years;
    periodUnitLabel = years === 1 ? 'Month' : 'Year';
    targetPerPeriod = liveGoal > 0 ? round2(liveGoal / periodTotalUnits) : 0;
    targetPerMonth = liveGoal > 0 ? round2(liveGoal / totalMonths) : 0;
  }

  // Solvency & Capacity Math Check
  const hasCashflowDeficit = liveGoal > 0 && targetPerMonth > disposableMonthly;
  const totalStepsToLoad = Math.min(36, periodTotalUnits); // Up to 36 blocks (3 years)

  // Active Matrix Calculations
  const activeTotalUnits = activeCadence === 'year' && activeDuration === 1 ? 12 : activeDuration;
  const activeTargetPerBlock = activeGoal > 0 && activeTotalUnits > 0 ? round2(activeGoal / activeTotalUnits) : 0;
  const totalSavedFromMatrix = round2(Math.min(activeGoal, savedBoxes.length * activeTargetPerBlock));
  const matrixProgressPercent = activeGoal > 0 ? Math.min(100, round2((totalSavedFromMatrix / activeGoal) * 100)) : 0;

  // 50/30/20 Math Calculations
  const totalSpent = round2(expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));
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
      setValidationError(`Spending limit (${currency}${parsedBudget}) cannot exceed monthly income (${currency}${parsedIncome}).`);
      return;
    }
    if (isNaN(liveGoal) || liveGoal <= 0) {
      setValidationError("Please enter your target savings goal.");
      return;
    }
    if (liveDuration <= 0) {
      setValidationError(`Please enter a valid duration (minimum 1 ${cadence}).`);
      return;
    }

    // Mathematical Solvency Constraint Check
    if (targetPerMonth > disposableMonthly) {
      const deficit = round2(targetPerMonth - disposableMonthly);
      setValidationError(
        `Mathematical Deficit: To save ${currency}${liveGoal} in ${cadence === 'month' ? `${liveDuration} months` : `${liveDuration} year(s)`} requires ${currency}${targetPerMonth}/month. Your disposable monthly savings capacity (Income ${currency}${parsedIncome} - Spending Limit ${currency}${parsedBudget}) is ${currency}${disposableMonthly}/month. Shortfall: ${currency}${deficit}/month.`
      );
      return;
    }

    const isSameTarget = liveGoal === activeGoal && cadence === activeCadence && liveDuration === activeDuration;
    const finalSavedBoxes = isSameTarget ? savedBoxes : [];

    onUpdateBudget({
      monthly_income: round2(parsedIncome),
      monthly_budget: round2(parsedBudget),
      savings_target: {
        goal: round2(liveGoal),
        cadence: cadence,
        duration: liveDuration,
        target_box_amount: targetPerPeriod,
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
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed']
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
      <div className="finance-card">
        <div className="card-header">
          <div className="card-title">
            <Calculator size={20} color="var(--primary)" />
            <span>Budget & Goal Savings Setup</span>
          </div>
          {activeGoal > 0 && savingsConfig.isConfigSaved && (
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
              <CheckCircle2 size={16} /> Target Saved & Active
            </span>
          )}
        </div>

        {validationError && (
          <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
            <AlertTriangle size={18} />
            <div style={{ lineHeight: 1.4 }}>{validationError}</div>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="alert-banner success" style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={18} />
            <span>Settings saved successfully! Goal milestone blocks updated below.</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            
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
              <label className="form-label">Monthly Spending Limit ({currency})</label>
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
              <label className="form-label">Savings Goal Target ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 60000"
                className="form-input"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Timeframe Type</label>
              <div className="cadence-selector">
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'month' ? 'active' : ''}`}
                  onClick={() => {
                    setCadence('month');
                    setDurationInput('12');
                  }}
                >
                  Monthly Goal
                </button>
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'year' ? 'active' : ''}`}
                  onClick={() => {
                    setCadence('year');
                    setDurationInput('1');
                  }}
                >
                  Yearly Goal
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Target Duration ({cadence === 'month' ? 'Months' : 'Years'})
              </label>
              <input
                type="number"
                min="1"
                max={cadence === 'month' ? "36" : "5"}
                placeholder={cadence === 'month' ? "e.g. 6 or 12" : "e.g. 1 or 2"}
                className="form-input"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                required
              />
            </div>

          </div>

          {/* Mathematical Formula Preview */}
          {liveGoal > 0 && liveDuration > 0 && (
            <div className="calc-formula-box">
              <div className="calc-formula-row">
                <div>
                  <strong>Mathematical Breakdown: </strong>
                  <span>
                    To reach {currency}{round2(liveGoal)} in {liveDuration} {cadence === 'month' ? (liveDuration === 1 ? 'month' : 'months') : (liveDuration === 1 ? 'year' : 'years')}:
                  </span>
                </div>
                <div>
                  Required: <strong>{currency}{targetPerMonth.toFixed(2)}/month</strong> ({currency}{targetPerPeriod.toFixed(2)} per {periodUnitLabel})
                </div>
              </div>

              <div className="calc-formula-row" style={{ borderTop: '1px solid var(--border-card)', paddingTop: '6px', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Monthly Savings Capacity (Income {currency}{parsedIncome} - Limit {currency}{parsedBudget}): <strong>{currency}{disposableMonthly.toFixed(2)}/month</strong>
                </span>
                {hasCashflowDeficit ? (
                  <span style={{ color: 'var(--color-danger)', fontWeight: '700' }}>
                    ⚠️ Deficit of {currency}{round2(targetPerMonth - disposableMonthly)}/mo
                  </span>
                ) : (
                  <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                    ✓ Solvency Verified ({periodTotalUnits} milestone blocks)
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={hasCashflowDeficit}
            >
              <Save size={16} /> Save Settings & Generate Blocks
            </button>
          </div>
        </form>
      </div>

      {/* Goal Savings Milestones (Month & Year Blocks) */}
      <div className="finance-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <TrendingUp size={20} color="var(--primary)" />
              <span>Goal Savings Milestones ({activeCadence === 'year' ? `${activeDuration} Year Plan` : `${activeDuration} Month Plan`})</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Target: {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Each block represents {currency}{activeTargetPerBlock.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Click a block when you deposit savings.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {currency}{totalSavedFromMatrix.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-green)' }}>
              {savedBoxes.length} of {activeTotalUnits} blocks completed ({matrixProgressPercent}%)
            </div>
          </div>
        </div>

        <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '16px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${matrixProgressPercent}%`, background: 'var(--accent-green)' }}
          />
        </div>

        {activeGoal > 0 ? (
          <div className="matrix-grid">
            {Array.from({ length: activeTotalUnits }).map((_, idx) => {
              const blockNum = idx + 1;
              const isSaved = savedBoxes.includes(blockNum);
              const label = activeCadence === 'year' && activeDuration > 1 ? `Year ${blockNum}` : `Month ${blockNum}`;
              return (
                <div
                  key={blockNum}
                  className={`matrix-box ${isSaved ? 'saved' : ''}`}
                  onClick={() => handleToggleBox(blockNum)}
                  title={`${label}: ${currency}${activeTargetPerBlock}`}
                >
                  <span>{isSaved ? '✓ Done' : label}</span>
                  <span className="matrix-box-sub">{currency}{activeTargetPerBlock.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No savings goal set yet.</p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Set your target amount and duration above to generate your milestone schedule.
            </div>
          </div>
        )}
      </div>

      {/* 50 / 30 / 20 Budget Allocation */}
      {parsedIncome > 0 && (
        <div className="finance-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Compass size={20} color="var(--primary)" />
                <span>50 / 30 / 20 Budget Allocation</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Mathematical benchmark based on {currency}{parsedIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} monthly income.
              </div>
            </div>
          </div>

          <div className="rule-grid">
            <div className="rule-box needs">
              <div>
                <div className="rule-percentage">50%</div>
                <div className="rule-title">Needs</div>
                <div className="rule-desc">Essential living expenses: Rent, groceries, bills, healthcare.</div>
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
                <div className="rule-desc">Discretionary spending: Dining out, leisure, shopping, subscriptions.</div>
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
                      background: 'var(--cat-food)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rule-box savings">
              <div>
                <div className="rule-percentage">20%</div>
                <div className="rule-title">Savings & Investments</div>
                <div className="rule-desc">Capital accumulation: Emergency funds, retirement, debt payoff.</div>
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
                      background: 'var(--accent-green)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
