import React, { useState } from 'react';
import { Plus, Download, Trash2, Edit3, Search, X, AlertCircle, CheckCircle2, DollarSign, Tag, Calendar, Coins, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import { getCategoryColor } from '../utils/categoryColors';

const CATEGORIES = [
  'All',
  'Food & Dining',
  'Housing & Utilities',
  'Transportation',
  'Health & Wellness',
  'Entertainment',
  'Personal & Shopping',
  'Education & Career',
  'Fixed Expenses',
  'Other'
];

const round2 = (val) => Math.round((Number(val) || 0) * 100) / 100;

export default function ExpenseList({
  expenses,
  budgetData,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onExportCSV,
  currency = '₹',
  warning
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Inline quick-add form state
  const [quickDesc, setQuickDesc] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food & Dining');
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quickError, setQuickError] = useState('');
  const [quickSuccess, setQuickSuccess] = useState(false);

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Food & Dining');
  const [editDate, setEditDate] = useState('');

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filtered List
  const filteredExpenses = expenses.filter(exp => {
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch = !s ||
      (exp.description && exp.description.toLowerCase().includes(s)) ||
      (exp.category && exp.category.toLowerCase().includes(s));
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFiltered = round2(filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0));

  // Excel / Notion Financial Metrics
  const totalSpent = round2(expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0));
  const income = Number(budgetData?.monthly_income) || 0;
  const budget = Number(budgetData?.monthly_budget) || 0;
  const remainingBudget = round2(budget - totalSpent);
  const netCashflow = round2(income - totalSpent);
  const budgetUsedPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  // Quick Add Form Handler
  const handleQuickAdd = (e) => {
    e.preventDefault();
    setQuickError('');

    const trimmedDesc = quickDesc.trim();
    const parsedAmount = parseFloat(quickAmount);

    if (!trimmedDesc) {
      setQuickError('Please enter what you spent on (e.g. Groceries).');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setQuickError(`Please enter a valid amount greater than 0.`);
      return;
    }

    onAddExpense({
      description: trimmedDesc,
      amount: round2(parsedAmount),
      category: quickCategory,
      date: quickDate || new Date().toISOString().split('T')[0]
    });

    setQuickDesc('');
    setQuickAmount('');
    setQuickSuccess(true);
    setTimeout(() => setQuickSuccess(false), 2500);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setEditDesc(exp.description || '');
    setEditAmount(String(exp.amount || ''));
    setEditCategory(exp.category || 'Food & Dining');
    setEditDate(exp.date || new Date().toISOString().split('T')[0]);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const trimmed = editDesc.trim();
    const parsed = parseFloat(editAmount);

    if (!trimmed || isNaN(parsed) || parsed <= 0) {
      alert('Please enter a valid description and amount.');
      return;
    }

    onUpdateExpense(editingExpense.id, {
      description: trimmed,
      amount: round2(parsed),
      category: editCategory,
      date: editDate
    });

    setEditingExpense(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId !== null) {
      onDeleteExpense(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {warning && (
        <div className={`alert-banner ${totalSpent > budget ? 'danger' : 'warning'}`}>
          <AlertCircle size={18} />
          <span>{warning}</span>
        </div>
      )}

      {/* Notion / Excel Summary Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-income">
            <Coins size={22} />
          </div>
          <div>
            <div className="stat-label">Monthly Income</div>
            <div className="stat-value">
              {income > 0 ? `${currency}${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-budget">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="stat-label">Spending Limit</div>
            <div className="stat-value">
              {budget > 0 ? `${currency}${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-spent">
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">
              {currency}{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-remaining">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label">Budget Balance</div>
            <div className="stat-value" style={{ color: budget > 0 ? (remainingBudget >= 0 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-main)' }}>
              {budget > 0 ? `${currency}${remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-savings">
            <Coins size={22} />
          </div>
          <div>
            <div className="stat-label">Net Remaining</div>
            <div className="stat-value" style={{ color: income > 0 ? (netCashflow >= 0 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-main)' }}>
              {income > 0 ? `${currency}${netCashflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>
      </div>

      {budget > 0 && (
        <div className="finance-card" style={{ padding: '14px 20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              Budget Utilization
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {currency}{totalSpent.toFixed(2)} of {currency}{budget.toFixed(2)} ({budgetUsedPercent}%)
            </div>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: 0 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${budgetUsedPercent}%`,
                background: budgetUsedPercent > 90 ? 'var(--color-danger)' : budgetUsedPercent > 75 ? 'var(--color-warning)' : 'var(--primary)'
              }}
            />
          </div>
        </div>
      )}

      {/* Inline Quick-Add Card */}
      <div className="finance-card">
        <div className="card-header">
          <div className="card-title">
            <Plus size={18} color="var(--primary)" />
            <span>Add Expense</span>
          </div>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Record an expenditure into your ledger
          </span>
        </div>

        {quickError && (
          <div className="alert-banner danger" style={{ marginBottom: '14px' }}>
            <AlertCircle size={18} />
            <span>{quickError}</span>
          </div>
        )}

        {quickSuccess && (
          <div className="alert-banner success" style={{ marginBottom: '14px' }}>
            <CheckCircle2 size={18} />
            <span>Expense recorded in your ledger!</span>
          </div>
        )}

        <form onSubmit={handleQuickAdd}>
          <div className="quick-add-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <input
                type="text"
                placeholder="e.g. Groceries, Rent, Utilities"
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
                placeholder="e.g. 250.00"
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
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
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

            <button type="submit" className="btn-primary" style={{ height: '40px' }}>
              <Plus size={16} /> Add
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Ledger Card */}
      <div className="finance-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <span>Expenses Ledger</span>
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {filteredExpenses.length} entries — Total: <strong>{currency}{totalFiltered.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={onExportCSV} title="Export to CSV spreadsheet">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search expenses by description or category..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '220px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Table of expenses */}
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found matching your criteria.</p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enter an expense in the form above to record it in your ledger.
            </div>
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => {
                  const catStyle = getCategoryColor(exp.category);
                  return (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                        {exp.date}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                        {exp.description}
                      </td>
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
                      <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--text-main)' }}>
                        {currency}{Number(exp.amount).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-icon"
                            title="Edit Expense"
                            onClick={() => handleOpenEdit(exp)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Delete Expense"
                            onClick={() => setDeleteConfirmId(exp.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-surface)', fontWeight: '700', borderTop: '2px solid var(--border-card)' }}>
                  <td colSpan={3} style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                    Total ({filteredExpenses.length} transactions)
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 14px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {currency}{totalFiltered.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="modal-backdrop" onClick={() => setEditingExpense(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Edit Expense
              </h3>
              <button className="btn-icon" onClick={() => setEditingExpense(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingExpense(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-danger)', marginBottom: '8px' }}>
              Delete Expense
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '18px' }}>
              Are you sure you want to delete this expense? This action will adjust your remaining budget.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--color-danger)' }}
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
