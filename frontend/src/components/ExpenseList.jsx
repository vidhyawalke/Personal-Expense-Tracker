import React, { useState } from 'react';
import { Plus, Download, Trash2, Edit3, Search, X, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Housing & Utilities',
  'Food & Dining',
  'Transportation',
  'Health & Wellness',
  'Entertainment',
  'Personal & Shopping',
  'Education & Career',
  'Other'
];

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filtered List
  const filteredExpenses = expenses.filter(exp => {
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch = !s ||
      (exp.description && exp.description.toLowerCase().includes(s)) ||
      (exp.category && exp.category.toLowerCase().includes(s));
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setDescription('');
    setAmount('');
    setCategory('Food & Dining');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingExpense(exp);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setCategory(exp.category || 'Food & Dining');
    setDate(exp.date || new Date().toISOString().split('T')[0]);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const cleanDesc = description.trim();
    const numAmount = parseFloat(amount);

    if (!cleanDesc) {
      alert("Please type what you spent on.");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter how much you spent.");
      return;
    }

    onAddExpense({
      description: cleanDesc,
      amount: numAmount,
      category,
      date
    });
    setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const cleanDesc = description.trim();
    const numAmount = parseFloat(amount);

    if (!cleanDesc) {
      alert("Please type what you spent on.");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter how much you spent.");
      return;
    }

    onUpdateExpense(editingExpense.id, {
      description: cleanDesc,
      amount: numAmount,
      category,
      date
    });
    setEditingExpense(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      onDeleteExpense(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="harmony-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="e.g. groceries, rent, uber..."
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-input"
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> Add Expense
          </button>

          <button className="btn-secondary" onClick={onExportCSV}>
            <Download size={18} /> Download CSV
          </button>
        </div>
      </div>

      <div className="harmony-card">
        <div className="card-header">
          <div>
            <div className="card-title">Your Expenses</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {filteredExpenses.length} item(s) — Total: {currency}{totalFiltered.toFixed(2)}
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: '500' }}>No expenses found. Try adding one above!</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>What</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
                      {exp.date}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      {exp.description}
                    </td>
                    <td>
                      <span className="badge-category">
                        {exp.category || 'Other'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--mint-light)' }}>
                      {currency}{Number(exp.amount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          title="Edit"
                          onClick={() => handleOpenEditModal(exp)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => setDeleteConfirmId(exp.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Add Expense
              </h3>
              <button
                className="btn-icon"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd}>
              <div className="form-group">
                <label className="form-label">What did you spend on?</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly groceries"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">How much? ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45.50"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">When?</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingExpense && (
        <div className="modal-backdrop" onClick={() => setEditingExpense(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Edit Expense
              </h3>
              <button
                className="btn-icon"
                onClick={() => setEditingExpense(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label className="form-label">What did you spend on?</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly rent"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">How much? ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 120.00"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">When?</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--forest-900)' }}>
                  Delete this expense?
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  This can't be undone.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--color-danger)' }}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
