import { Projection, Transaction, ProjectionSettings } from '../types';

/**
 * Query Interface for AI Tools
 * 
 * This module provides read-only access to projection data.
 * All functions are safe to expose to AI tools for querying application state.
 */

let projectionsStore: Projection[] = [];

/**
 * Initialize the query interface with projection data
 * Called internally by ProjectionContext
 */
export function initializeQueryInterface(projections: Projection[]) {
  projectionsStore = projections;
}

/**
 * Get all projections
 * @returns Array of all projections sorted by creation date (newest first)
 */
export function getAllProjections(): Projection[] {
  return [...projectionsStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get a single projection by ID
 * @param id - Projection ID
 * @returns Projection or null if not found
 */
export function getProjection(id: string): Projection | null {
  return projectionsStore.find(p => p.id === id) || null;
}

/**
 * Get all transactions for a projection
 * @param projectionId - Projection ID
 * @returns Array of transactions or empty array if projection not found
 */
export function getTransactions(projectionId: string): Transaction[] {
  const projection = getProjection(projectionId);
  return projection ? [...projection.transactions] : [];
}

/**
 * Get a specific transaction
 * @param projectionId - Projection ID
 * @param transactionId - Transaction ID
 * @returns Transaction or null if not found
 */
export function getTransaction(projectionId: string, transactionId: string): Transaction | null {
  const projection = getProjection(projectionId);
  if (!projection) return null;
  return projection.transactions.find(t => t.id === transactionId) || null;
}

/**
 * Get projection settings
 * @param projectionId - Projection ID
 * @returns Settings or null if projection not found
 */
export function getSettings(projectionId: string): ProjectionSettings | null {
  const projection = getProjection(projectionId);
  return projection ? { ...projection.settings } : null;
}

/**
 * Search transactions across all projections
 * @param query - Search query (matches against description)
 * @returns Array of matching transactions with projection info
 */
export function searchTransactions(query: string): Array<{
  transaction: Transaction;
  projectionId: string;
  projectionName: string;
}> {
  const results: Array<{
    transaction: Transaction;
    projectionId: string;
    projectionName: string;
  }> = [];

  const lowerQuery = query.toLowerCase();

  projectionsStore.forEach(projection => {
    projection.transactions.forEach(transaction => {
      if (transaction.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          transaction: { ...transaction },
          projectionId: projection.id,
          projectionName: projection.name,
        });
      }
    });
  });

  return results;
}

/**
 * Get projection statistics
 * @param projectionId - Projection ID
 * @returns Statistics or null if projection not found
 */
export function getProjectionStats(projectionId: string): {
  totalTransactions: number;
  activeTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
  totalIncomeAmount: number;
  totalExpenseAmount: number;
} | null {
  const projection = getProjection(projectionId);
  if (!projection) return null;

  const stats = {
    totalTransactions: projection.transactions.length,
    activeTransactions: projection.transactions.filter(t => t.enabled).length,
    incomeTransactions: projection.transactions.filter(t => t.type === 'income').length,
    expenseTransactions: projection.transactions.filter(t => t.type === 'expense').length,
    totalIncomeAmount: projection.transactions
      .filter(t => t.type === 'income' && t.enabled)
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenseAmount: projection.transactions
      .filter(t => t.type === 'expense' && t.enabled)
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return stats;
}

/**
 * Get filtered transactions
 * @param projectionId - Projection ID
 * @param filters - Filter criteria
 * @returns Filtered transactions
 */
export function getFilteredTransactions(
  projectionId: string,
  filters: {
    type?: 'income' | 'expense';
    enabled?: boolean;
    frequency?: 'once' | 'monthly' | 'yearly';
  }
): Transaction[] {
  let transactions = getTransactions(projectionId);

  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }

  if (filters.enabled !== undefined) {
    transactions = transactions.filter(t => t.enabled === filters.enabled);
  }

  if (filters.frequency) {
    transactions = transactions.filter(t => t.frequency === filters.frequency);
  }

  return transactions;
}

/**
 * Get all projections count
 * @returns Total number of projections
 */
export function getProjectionsCount(): number {
  return projectionsStore.length;
}

/**
 * Check if a projection exists
 * @param id - Projection ID
 * @returns True if projection exists
 */
export function projectionExists(id: string): boolean {
  return projectionsStore.some(p => p.id === id);
}

