import React, { useState } from 'react';
import { Plus, Download, Trash2, Edit3, Search, X, AlertCircle, CheckCircle2, DollarSign, Tag, Calendar } from 'lucide-react';
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
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onExportCSV,
  currency = '₹'
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
      
      {/* Inline Quick-Add Card */}
      <div className="harmony-card">
        <div className="card-header">
          <div className="card-title">
            <Plus size={20} color="var(--coffee-primary)" />
            <span>Quick Add Transaction</span>
          </div>
          <span style={{ fontSize: '0.84rem', color: 'var(--mocha-muted)' }}>
            Record an expense directly into your ledger
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
              <label className="form-label">What did you spend on?</label>
              <input
                type="text"
                placeholder="e.g. Morning Coffee, Rent, Dinner"
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

            <button type="submit" className="btn-primary" style={{ height: '44px' }}>
              <Plus size={18} /> Add
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Ledger Card */}
      <div className="harmony-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <span>Expenses Ledger</span>
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--mocha-muted)', marginTop: '2px' }}>
              Showing {filteredExpenses.length} entries — Total: <strong>{currency}{totalFiltered.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={onExportCSV} title="Export to CSV spreadsheet">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mocha-light)' }} />
            <input
              type="text"
              placeholder="Search expenses by description or category..."
              className="form-input"
              style={{ paddingLeft: '40px' }}
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
            <div className="hint">Type an expense above to populate your financial ledger!</div>
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
                      <td style={{ fontWeight: '600', color: 'var(--mocha-muted)' }}>
                        {exp.date}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--coffee-dark)' }}>
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
                      <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--coffee-primary)' }}>
                        {currency}{Number(exp.amount).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-icon"
                            title="Edit Expense"
                            onClick={() => handleOpenEdit(exp)}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Delete Expense"
                            onClick={() => setDeleteConfirmId(exp.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="modal-backdrop" onClick={() => setEditingExpense(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--coffee-dark)' }}>
                Edit Expense
              </h3>
              <button className="btn-icon" onClick={() => setEditingExpense(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">What did you spend on?</label>
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
            <p style={{ color: 'var(--mocha-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
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
