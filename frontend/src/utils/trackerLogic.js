/**
 * Core financial calculations and transaction state helpers.
 * Includes budget summaries, 50/30/20 allocation, and CSV export.
 */

export const STANDARD_CATEGORIES = [
  'Housing & Utilities',
  'Food & Dining',
  'Transportation',
  'Health & Wellness',
  'Entertainment',
  'Personal & Shopping',
  'Education & Career',
  'Other'
];

export const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

export function addExpense(expensesList, { description, amount, category = 'Other', date }) {
  const cleanedDesc = String(description || '').trim();
  if (!cleanedDesc) throw new Error('Description cannot be empty.');

  const numAmount = round2(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('Amount must be greater than zero.');

  const entry = {
    id: Date.now(),
    description: cleanedDesc,
    amount: numAmount,
    category: category || 'Other',
    date: date || new Date().toISOString().split('T')[0]
  };

  return [entry, ...expensesList];
}

export function updateExpense(expensesList, id, patch) {
  return expensesList.map((item) => {
    if (item.id !== id) return item;
    const updatedAmount = patch.amount !== undefined ? round2(patch.amount) : item.amount;
    return {
      ...item,
      ...patch,
      amount: updatedAmount
    };
  });
}

export function deleteExpense(expensesList, id) {
  return expensesList.filter((item) => item.id !== id);
}

export function filterExpenses(expensesList, { category, search, month, year } = {}) {
  return expensesList.filter((item) => {
    if (category && category !== 'All' && item.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }
    if (month || year) {
      if (!item.date) return false;
      const [itemY, itemM] = item.date.split('-').map(Number);
      if (year && itemY !== Number(year)) return false;
      if (month && itemM !== Number(month)) return false;
    }
    return true;
  });
}

export function calculateSummary(expensesList, monthlyBudget = 0) {
  const total = round2(expensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0));
  const count = expensesList.length;
  const budget = Number(monthlyBudget) || 0;
  const remaining = budget > 0 ? round2(budget - total) : null;
  const utilization = budget > 0 ? round2((total / budget) * 100) : 0;

  const categoryTotals = {};
  for (const item of expensesList) {
    const cat = item.category || 'Other';
    categoryTotals[cat] = round2((categoryTotals[cat] || 0) + (Number(item.amount) || 0));
  }

  return {
    total,
    count,
    budget,
    remaining,
    utilization,
    categoryTotals
  };
}

export function calculate503020Rule(expensesList, monthlyIncome = 0) {
  const income = Number(monthlyIncome) || 0;
  const needsTarget = round2(income * 0.50);
  const wantsTarget = round2(income * 0.30);
  const savingsTarget = round2(income * 0.20);

  const needsCategories = ['housing & utilities', 'food & dining', 'transportation', 'health & wellness', 'fixed expenses'];
  const wantsCategories = ['entertainment', 'personal & shopping', 'shopping'];

  let actualNeeds = 0;
  let actualWants = 0;
  let totalSpent = 0;

  for (const item of expensesList) {
    const amt = Number(item.amount) || 0;
    totalSpent += amt;
    const cat = (item.category || '').toLowerCase();
    if (needsCategories.includes(cat)) {
      actualNeeds += amt;
    } else if (wantsCategories.includes(cat)) {
      actualWants += amt;
    } else {
      actualWants += amt;
    }
  }

  const actualSavings = Math.max(0, income - totalSpent);

  return {
    needs: { target: needsTarget, actual: round2(actualNeeds) },
    wants: { target: wantsTarget, actual: round2(actualWants) },
    savings: { target: savingsTarget, actual: round2(actualSavings) }
  };
}

export function exportExpensesToCSV(expensesList) {
  const header = 'ID,Date,Description,Category,Amount';
  const rows = expensesList.map((e) =>
    `${e.id},${e.date},"${(e.description || '').replace(/"/g, '""')}",${e.category || 'Other'},${Number(e.amount).toFixed(2)}`
  );
  return [header, ...rows].join('\n');
}
