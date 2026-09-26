import React, { useState } from 'react';
import { TrendingUp, Save, CheckCircle2, DollarSign, Calendar, Check, Clock, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

function formatDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatShortDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short'
  });
}

function getBlockDates(startDateStr, cadence, duration, index) {
  let y, m, d;
  if (startDateStr && startDateStr.includes('-')) {
    const parts = startDateStr.split('-').map(Number);
    y = parts[0];
    m = parts[1] - 1;
    d = parts[2];
  } else {
    const now = new Date();
    y = now.getFullYear();
    m = now.getMonth();
    d = now.getDate();
  }
  const base = new Date(y, m, d);

  if (cadence === 'week') {
    const start = new Date(base.getTime() + index * 7 * 86400000);
    const end = new Date(start.getTime() + 6 * 86400000);
    return {
      label: `Week ${index + 1}`,
      periodName: `Week ${index + 1}`,
      start,
      end
    };
  }

  // Monthly milestones
  const start = new Date(base.getFullYear(), base.getMonth() + index, base.getDate());
  const end = new Date(base.getFullYear(), base.getMonth() + index + 1, base.getDate() - 1);
  const monthName = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return {
    label: `Month ${index + 1}`,
    periodName: monthName,
    start,
    end
  };
}

export default function BudgetPlanner({ budgetData, onUpdateBudget, expenses = [], currency = '₹' }) {
  const savingsConfig = budgetData?.savings_target || {};
  
  // Frequency cadence: 'week' | 'month' | 'year'
  const [cadence, setCadence] = useState(savingsConfig.cadence || 'month');
  const [incomeInput, setIncomeInput] = useState(budgetData?.monthly_income ? String(budgetData.monthly_income) : '');
  const [budgetInput, setBudgetInput] = useState(budgetData?.monthly_budget ? String(budgetData.monthly_budget) : '');
  const [goalInput, setGoalInput] = useState(savingsConfig.goal ? String(savingsConfig.goal) : '');
  const [durationInput, setDurationInput] = useState(
    savingsConfig.duration ? String(savingsConfig.duration) : (cadence === 'week' ? '12' : (cadence === 'year' ? '1' : '12'))
  );
  
  // Goal schedule start date
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDateInput, setStartDateInput] = useState(savingsConfig.start_date || todayStr);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  // Active saved settings
  const savedBoxes = Array.isArray(savingsConfig.saved_boxes) ? savingsConfig.saved_boxes : [];
  const activeGoal = Number(savingsConfig.goal) || 0;
  const activeCadence = savingsConfig.cadence || 'month';
  const activeDuration = Number(savingsConfig.duration) || (activeCadence === 'week' ? 12 : (activeCadence === 'year' ? 1 : 12));
  const activeStartDate = savingsConfig.start_date || todayStr;

  // Parsed numerical values for live calculations
  const parsedIncome = parseFloat(incomeInput) || 0;
  const parsedBudget = parseFloat(budgetInput) || 0;
  const liveGoal = parseFloat(goalInput) || 0;
  const liveDuration = parseInt(durationInput, 10) || (cadence === 'week' ? 12 : (cadence === 'year' ? 1 : 12));

  // Monthly surplus estimate
  const disposableMonthly = Math.max(0, parsedIncome - parsedBudget);

  // Milestone breakdown calculations
  let periodTotalUnits = 0;
  let periodUnitLabel = 'Month';
  let targetPerPeriod = 0;
  let targetPerMonth = 0;

  if (cadence === 'week') {
    periodTotalUnits = Math.max(1, liveDuration);
    periodUnitLabel = 'Week';
    targetPerPeriod = liveGoal > 0 ? round2(liveGoal / periodTotalUnits) : 0;
    targetPerMonth = round2((targetPerPeriod * 52) / 12);
  } else if (cadence === 'year') {
    const years = Math.max(1, liveDuration);
    periodTotalUnits = years * 12; // 12 monthly milestones per year
    periodUnitLabel = 'Month';
    targetPerPeriod = liveGoal > 0 ? round2(liveGoal / periodTotalUnits) : 0;
    targetPerMonth = targetPerPeriod;
  } else {
    // cadence === 'month'
    periodTotalUnits = Math.max(1, liveDuration);
    periodUnitLabel = 'Month';
    targetPerPeriod = liveGoal > 0 ? round2(liveGoal / periodTotalUnits) : 0;
    targetPerMonth = targetPerPeriod;
  }

  // Active milestone schedule calculations
  let activeTotalUnits = 0;
  if (activeCadence === 'week') {
    activeTotalUnits = Math.max(1, activeDuration);
  } else if (activeCadence === 'year') {
    activeTotalUnits = Math.max(1, activeDuration) * 12;
  } else {
    activeTotalUnits = Math.max(1, activeDuration);
  }

  const activeTargetPerBlock = activeGoal > 0 && activeTotalUnits > 0 ? round2(activeGoal / activeTotalUnits) : 0;
  
  // Total saved across completed milestones
  const totalSavedFromMatrix = round2(
    savedBoxes.reduce((acc, item) => {
      if (typeof item === 'object' && item !== null && item.amount) {
        return acc + Number(item.amount);
      }
      return acc + activeTargetPerBlock;
    }, 0)
  );

  const matrixProgressPercent = activeGoal > 0 ? Math.min(100, round2((totalSavedFromMatrix / activeGoal) * 100)) : 0;

  // Identify most recently saved milestone
  const savedEntriesWithInfo = savedBoxes.map((item, index) => {
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id,
        savedAt: item.savedAt || null,
        amount: Number(item.amount) || activeTargetPerBlock,
        rawIndex: index
      };
    }
    return {
      id: Number(item),
      savedAt: null,
      amount: activeTargetPerBlock,
      rawIndex: index
    };
  });

  const lastAddedEntry = savedEntriesWithInfo.length > 0
    ? [...savedEntriesWithInfo].sort((a, b) => {
        const timeA = a.savedAt ? new Date(a.savedAt).getTime() : a.rawIndex;
        const timeB = b.savedAt ? new Date(b.savedAt).getTime() : b.rawIndex;
        return timeB - timeA;
      })[0]
    : null;

  const lastAddedId = lastAddedEntry ? lastAddedEntry.id : null;
  const lastAddedDateStr = lastAddedEntry && lastAddedEntry.savedAt
    ? formatDate(new Date(lastAddedEntry.savedAt))
    : (lastAddedEntry ? 'Recently' : null);

  // Overall schedule date range
  const planStartObj = activeTotalUnits > 0 ? getBlockDates(activeStartDate, activeCadence, activeDuration, 0).start : new Date();
  const planEndObj = activeTotalUnits > 0 ? getBlockDates(activeStartDate, activeCadence, activeDuration, activeTotalUnits - 1).end : new Date();

  // Next pending milestone block
  const savedIdsSet = new Set(savedEntriesWithInfo.map(e => e.id));
  let nextPendingBlockNum = null;
  for (let b = 1; b <= activeTotalUnits; b++) {
    if (!savedIdsSet.has(b)) {
      nextPendingBlockNum = b;
      break;
    }
  }

  // 50/30/20 budget framework calculations
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
  
  const needsPercent = needsTarget > 0 ? Math.min(100, Math.round((actualNeeds / needsTarget) * 100)) : 0;
  const wantsPercent = wantsTarget > 0 ? Math.min(100, Math.round((totalWantsWithOther / wantsTarget) * 100)) : 0;

  // Unspent monthly surplus available for savings
  const remainingSurplus = Math.max(0, round2(parsedIncome - totalSpent));
  const savingsAllocated = Math.min(savingsTarget, remainingSurplus);
  const savingsPercent = savingsTarget > 0 ? Math.min(100, Math.round((savingsAllocated / savingsTarget) * 100)) : 0;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setValidationError('');

    if (isNaN(parsedIncome) || parsedIncome <= 0) {
      setValidationError("Please enter a valid monthly income.");
      return;
    }
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setValidationError("Please enter your monthly spending limit.");
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

    const isSameTarget = liveGoal === activeGoal && cadence === activeCadence && liveDuration === activeDuration && startDateInput === activeStartDate;
    const finalSavedBoxes = isSameTarget ? savedBoxes : [];

    onUpdateBudget({
      monthly_income: round2(parsedIncome),
      monthly_budget: round2(parsedBudget),
      savings_target: {
        goal: round2(liveGoal),
        cadence: cadence,
        duration: liveDuration,
        start_date: startDateInput || todayStr,
        target_box_amount: targetPerPeriod,
        isConfigSaved: true,
        saved_boxes: finalSavedBoxes
      }
    });

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleToggleBox = (blockNum) => {
    const isCurrentlySaved = savedBoxes.some(b => (typeof b === 'object' && b !== null ? b.id : b) === blockNum);
    let updated;

    if (!isCurrentlySaved) {
      const newEntry = {
        id: blockNum,
        savedAt: new Date().toISOString(),
        amount: activeTargetPerBlock
      };
      updated = [...savedBoxes, newEntry];
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#059669', '#2563eb', '#10b981', '#3b82f6', '#f59e0b']
        });
      } catch {
        // Fallback
      }
    } else {
      updated = savedBoxes.filter(b => (typeof b === 'object' && b !== null ? b.id : b) !== blockNum);
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
      
      {/* Goal configuration form */}
      <div className="finance-card">
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <span>Budget & Goal Savings Setup</span>
            <button
              type="button"
              className={`btn-info-icon ${showInfo ? 'active' : ''}`}
              onClick={() => setShowInfo(!showInfo)}
              title="How this savings section works"
              aria-label="Section Information"
            >
              <Info size={15} />
            </button>
          </div>
          {activeGoal > 0 && savingsConfig.isConfigSaved && (
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
              <CheckCircle2 size={16} /> Target Saved & Active
            </span>
          )}
        </div>

        {showInfo && (
          <div className="info-guide-banner">
            <div className="info-guide-header">
              <div className="info-guide-title">
                <Info size={16} color="var(--primary)" />
                <strong>How this planner works</strong>
              </div>
              <button
                type="button"
                className="btn-close-info"
                onClick={() => setShowInfo(false)}
                aria-label="Close guide"
              >
                ✕
              </button>
            </div>
            <ul className="info-guide-list">
              <li>Enter monthly earnings plus your planned spending limit.</li>
              <li>Select your target amount, how often to save, and start date.</li>
              <li>The tool breaks everything into organized milestone cards.</li>
              <li>Tap any block whenever putting funds aside.</li>
              <li>A star marks your newest deposit to record progress.</li>
            </ul>
          </div>
        )}

        {validationError && (
          <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
            <div>{validationError}</div>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="alert-banner success" style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={18} />
            <span>Settings saved successfully! Goal milestone schedule updated below.</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig}>
          <div className="planner-form-grid">
            
            <div className="form-group">
              <label className="form-label">Monthly Income ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 20000"
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
                placeholder="e.g. 10000"
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
                placeholder="e.g. 5000"
                className="form-input"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">How Often to Save</label>
              <div className="cadence-selector">
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'week' ? 'active' : ''}`}
                  onClick={() => {
                    setCadence('week');
                    setDurationInput('12');
                  }}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'month' ? 'active' : ''}`}
                  onClick={() => {
                    setCadence('month');
                    setDurationInput('12');
                  }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`cadence-btn ${cadence === 'year' ? 'active' : ''}`}
                  onClick={() => {
                    setCadence('year');
                    setDurationInput('1');
                  }}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Duration ({cadence === 'week' ? 'Weeks' : cadence === 'year' ? 'Years' : 'Months'})
              </label>
              <input
                type="number"
                min="1"
                max={cadence === 'week' ? "104" : cadence === 'year' ? "5" : "60"}
                placeholder={cadence === 'week' ? "e.g. 12 or 52" : cadence === 'year' ? "e.g. 1 or 2" : "e.g. 6 or 12"}
                className="form-input"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Plan Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                required
              />
            </div>

          </div>

          {/* Target breakdown preview */}
          {liveGoal > 0 && liveDuration > 0 && (
            <div className="calc-formula-box">
              <div className="calc-formula-row">
                <div>
                  <strong>Mathematical Formulation: </strong>
                  <span>
                    To reach {currency}{round2(liveGoal).toLocaleString('en-US', { minimumFractionDigits: 2 })} over {liveDuration} {cadence === 'week' ? (liveDuration === 1 ? 'week' : 'weeks') : cadence === 'year' ? (liveDuration === 1 ? 'year (12 monthly milestones)' : `${liveDuration} years`) : (liveDuration === 1 ? 'month' : 'months')}:
                  </span>
                </div>
                <div>
                  Target: <strong>{currency}{targetPerPeriod.toFixed(2)} / {periodUnitLabel}</strong>
                  {cadence === 'week' && ` (~${currency}${targetPerMonth.toFixed(2)}/month)`}
                </div>
              </div>

              <div className="calc-formula-row" style={{ borderTop: '1px solid var(--border-card)', paddingTop: '6px', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Estimated Monthly Surplus: <strong>{currency}{disposableMonthly.toFixed(2)}/mo</strong> (Income {currency}{parsedIncome} – Limit {currency}{parsedBudget})
                </span>
                {targetPerMonth <= disposableMonthly ? (
                  <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                    ✓ Sustainable pace ({periodTotalUnits} milestones generated)
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-warning)', fontWeight: '600' }}>
                    💡 Flexible Pace: Requires ~{currency}{targetPerMonth.toFixed(0)}/mo ({periodTotalUnits} milestones)
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Settings & Generate Milestone Schedule
            </button>
          </div>
        </form>
      </div>

      {/* Savings milestone schedule */}
      <div className="finance-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <span>
                Goal Savings Milestones ({activeCadence === 'week' ? `${activeDuration} Week Plan` : activeCadence === 'year' ? `${activeDuration} Year Plan (${activeTotalUnits} Months)` : `${activeDuration} Month Plan`})
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              Target: {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} | Each block represents {currency}{activeTargetPerBlock.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Click any milestone to record your deposit.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {currency}{totalSavedFromMatrix.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {currency}{activeGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-green)' }}>
              {savedBoxes.length} of {activeTotalUnits} completed ({matrixProgressPercent}%)
            </div>
          </div>
        </div>

        {/* Milestone progress bar */}
        <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '16px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${matrixProgressPercent}%`, background: 'var(--accent-green)' }}
          />
        </div>

        {/* Milestone summary tiles */}
        {activeGoal > 0 && (
          <div className="milestone-summary-grid">
            <div className="milestone-summary-card">
              <div className="milestone-summary-label">Total Saved</div>
              <div className="milestone-summary-val" style={{ color: 'var(--accent-green)' }}>
                {currency}{totalSavedFromMatrix.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="milestone-summary-sub">
                {matrixProgressPercent}% of total goal
              </div>
            </div>

            <div className="milestone-summary-card">
              <div className="milestone-summary-label">Last Added Saving</div>
              <div className="milestone-summary-val" style={{ color: lastAddedEntry ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {lastAddedEntry ? `Block ${lastAddedId} (${currency}${lastAddedEntry.amount.toFixed(0)})` : 'None yet'}
              </div>
              <div className="milestone-summary-sub">
                {lastAddedDateStr ? `Saved on ${lastAddedDateStr}` : 'Tap a block below to log'}
              </div>
            </div>

            <div className="milestone-summary-card">
              <div className="milestone-summary-label">Next Up</div>
              <div className="milestone-summary-val">
                {nextPendingBlockNum ? `Block ${nextPendingBlockNum} (${currency}${activeTargetPerBlock.toFixed(0)})` : 'All Saved!'}
              </div>
              <div className="milestone-summary-sub">
                {nextPendingBlockNum 
                  ? `Due: ${formatShortDate(getBlockDates(activeStartDate, activeCadence, activeDuration, nextPendingBlockNum - 1).end)}` 
                  : 'Goal reached'}
              </div>
            </div>

            <div className="milestone-summary-card">
              <div className="milestone-summary-label">Plan Schedule</div>
              <div className="milestone-summary-val" style={{ fontSize: '0.92rem' }}>
                {formatShortDate(planStartObj)} – {formatDate(planEndObj)}
              </div>
              <div className="milestone-summary-sub">
                {activeTotalUnits} scheduled milestones
              </div>
            </div>
          </div>
        )}

        {/* Milestone cards grid */}
        {activeGoal > 0 ? (
          <div className="milestone-cards-grid">
            {Array.from({ length: activeTotalUnits }).map((_, idx) => {
              const blockNum = idx + 1;
              const isSaved = savedIdsSet.has(blockNum);
              const isLastAdded = blockNum === lastAddedId;
              const dates = getBlockDates(activeStartDate, activeCadence, activeDuration, idx);

              // Find saved entry timestamp
              const matchingSaved = savedEntriesWithInfo.find(e => e.id === blockNum);
              const savedDateText = matchingSaved && matchingSaved.savedAt
                ? formatDate(new Date(matchingSaved.savedAt))
                : null;

              return (
                <div
                  key={blockNum}
                  className={`milestone-block-card ${isSaved ? 'saved' : ''} ${isLastAdded ? 'last-added' : ''}`}
                  onClick={() => handleToggleBox(blockNum)}
                  title={`${dates.label}: ${formatDate(dates.start)} to ${formatDate(dates.end)}`}
                >
                  {/* Period label and status */}
                  <div className="milestone-card-top">
                    <span className="milestone-period-title">{dates.label}</span>
                    {isLastAdded ? (
                      <span className="milestone-pill last-saved">Last Added</span>
                    ) : isSaved ? (
                      <span className="milestone-pill saved">✓ Done</span>
                    ) : (
                      <span className="milestone-pill pending">Pending</span>
                    )}
                  </div>

                  {/* Month subtitle */}
                  {activeCadence !== 'week' && (
                    <div className="milestone-month-name">{dates.periodName}</div>
                  )}

                  {/* Milestone date range */}
                  <div className="milestone-date-range">
                    <div className="milestone-date-row">
                      <span className="date-tag">Start:</span>
                      <span className="date-text">{formatDate(dates.start)}</span>
                    </div>
                    <div className="milestone-date-row">
                      <span className="date-tag">End:</span>
                      <span className="date-text">{formatDate(dates.end)}</span>
                    </div>
                  </div>

                  {/* Target amount */}
                  <div className="milestone-amount-row">
                    <span className="milestone-amount">
                      {currency}{activeTargetPerBlock.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Card footer */}
                  <div className="milestone-card-footer">
                    {isSaved ? (
                      <span className="footer-status saved">
                        ✓ {savedDateText ? `Saved on ${savedDateText}` : 'Savings Logged'}
                      </span>
                    ) : (
                      <span className="footer-status pending">
                        + Click when saved
                      </span>
                    )}
                  </div>
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

      {/* 50/30/20 budget framework */}
      {parsedIncome > 0 && (
        <div className="finance-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <span>50 / 30 / 20 Budget Guide</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Recommended monthly split for {currency}{parsedIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} income
              </div>
            </div>
          </div>

          {/* Tri-color allocation split bar */}
          <div className="rule-split-bar" title="50% Needs / 30% Wants / 20% Savings">
            <div className="rule-split-segment needs" />
            <div className="rule-split-segment wants" />
            <div className="rule-split-segment savings" />
          </div>

          <div className="rule-grid">
            {/* Needs 50% */}
            <div className="rule-box">
              <div>
                <div className="rule-box-header">
                  <span className="rule-title">Needs</span>
                  <span className="rule-badge needs">50%</span>
                </div>
                <div className="rule-desc">
                  Rent, groceries, utilities, and essential bills
                </div>
              </div>

              <div>
                <div className="rule-amount-block">
                  <span className="rule-amount-label">Target Limit</span>
                  <span className="rule-amount-value">
                    {currency}{needsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="progress-bar-bg" style={{ height: '6px', margin: '10px 0 6px 0' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${needsPercent}%`,
                      background: '#2563eb'
                    }}
                  />
                </div>

                <div className="rule-status-row">
                  <span>Spent: <strong className="rule-status-val">{currency}{actualNeeds.toFixed(2)}</strong> ({needsPercent}%)</span>
                  <span>{currency}{Math.max(0, needsTarget - actualNeeds).toFixed(2)} left</span>
                </div>
              </div>
            </div>

            {/* Wants 30% */}
            <div className="rule-box">
              <div>
                <div className="rule-box-header">
                  <span className="rule-title">Wants</span>
                  <span className="rule-badge wants">30%</span>
                </div>
                <div className="rule-desc">
                  Dining out, entertainment, hobbies, and shopping
                </div>
              </div>

              <div>
                <div className="rule-amount-block">
                  <span className="rule-amount-label">Target Limit</span>
                  <span className="rule-amount-value">
                    {currency}{wantsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="progress-bar-bg" style={{ height: '6px', margin: '10px 0 6px 0' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${wantsPercent}%`,
                      background: '#ea580c'
                    }}
                  />
                </div>

                <div className="rule-status-row">
                  <span>Spent: <strong className="rule-status-val">{currency}{totalWantsWithOther.toFixed(2)}</strong> ({wantsPercent}%)</span>
                  <span>{currency}{Math.max(0, wantsTarget - totalWantsWithOther).toFixed(2)} left</span>
                </div>
              </div>
            </div>

            {/* Savings 20% */}
            <div className="rule-box">
              <div>
                <div className="rule-box-header">
                  <span className="rule-title">Savings & Growth</span>
                  <span className="rule-badge savings">20%</span>
                </div>
                <div className="rule-desc">
                  Emergency funds, deposits, and future investments
                </div>
              </div>

              <div>
                <div className="rule-amount-block">
                  <span className="rule-amount-label">Monthly Target</span>
                  <span className="rule-amount-value">
                    {currency}{savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="progress-bar-bg" style={{ height: '6px', margin: '10px 0 6px 0' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${savingsPercent}%`,
                      background: '#059669'
                    }}
                  />
                </div>

                <div className="rule-status-row">
                  <span>Covered: <strong className="rule-status-val">{currency}{savingsAllocated.toFixed(2)}</strong> ({savingsPercent}%)</span>
                  <span>{savingsPercent >= 100 ? 'Goal covered' : `${currency}${(savingsTarget - savingsAllocated).toFixed(2)} to go`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
