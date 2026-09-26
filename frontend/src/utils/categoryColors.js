// Category color definitions for badges and charts
export const CATEGORY_COLORS = {
  'Food & Dining':       { color: '#e07a5f', bg: '#fdf1ed', label: 'Food & Dining' },
  'Housing & Utilities': { color: '#3b82f6', bg: '#eff6ff', label: 'Housing & Utilities' },
  'Transportation':     { color: '#06b6d4', bg: '#ecfeff', label: 'Transportation' },
  'Health & Wellness':   { color: '#10b981', bg: '#ecfdf5', label: 'Health & Wellness' },
  'Entertainment':       { color: '#8b5cf6', bg: '#f5f3ff', label: 'Entertainment' },
  'Personal & Shopping': { color: '#ec4899', bg: '#fdf2f8', label: 'Personal & Shopping' },
  'Education & Career':  { color: '#d97706', bg: '#fffbeb', label: 'Education & Career' },
  'Fixed Expenses':      { color: '#78350f', bg: '#fef3c7', label: 'Fixed Expenses' },
  'Other':               { color: '#78716c', bg: '#f5f5f4', label: 'Other' },
};

export function getCategoryColor(categoryName) {
  return CATEGORY_COLORS[categoryName] || { color: '#78716c', bg: '#f5f5f4', label: categoryName || 'Other' };
}
