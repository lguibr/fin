import { Projection, Transaction, ProjectionSettings } from '../types';

/**
 * Mutation Interface for AI Tools
 * 
 * This module provides write access to projection data.
 * All mutations go through the proper action dispatcher with optimistic updates
 * and error rollback. Safe to expose to AI tools.
 */

// Reference to the action dispatcher - initialized by ProjectionContext
let actionDispatcher: {
  createProjection: (projection: Projection) => Promise<void>;
  updateProjection: (projection: Projection) => Promise<void>;
  deleteProjection: (id: string) => Promise<void>;
  duplicateProjection: (id: string) => Promise<Projection | null>;
  addTransaction: (projectionId: string, transaction: Transaction) => Promise<void>;
  updateTransaction: (projectionId: string, transaction: Transaction) => Promise<void>;
  deleteTransaction: (projectionId: string, transactionId: string) => Promise<void>;
  toggleTransaction: (projectionId: string, transactionId: string) => Promise<void>;
  updateSettings: (projectionId: string, settings: ProjectionSettings) => Promise<void>;
  updateProjectionName: (projectionId: string, name: string) => Promise<void>;
} | null = null;

/**
 * Initialize the mutation interface with action dispatcher
 * Called internally by ProjectionContext
 */
export function initializeMutationInterface(dispatcher: typeof actionDispatcher) {
  actionDispatcher = dispatcher;
}

function ensureInitialized() {
  if (!actionDispatcher) {
    throw new Error('Mutation interface not initialized. Must be called within ProjectionProvider.');
  }
}

/**
 * Create a new projection
 * @param data - Projection data (without ID - will be generated)
 * @returns Promise that resolves when projection is created
 */
export async function createProjection(data: Omit<Projection, 'id'>): Promise<string> {
  ensureInitialized();
  
  const id = crypto.randomUUID();
  const projection: Projection = {
    ...data,
    id,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  await actionDispatcher!.createProjection(projection);
  return id;
}

/**
 * Update an existing projection
 * @param id - Projection ID
 * @param data - Partial projection data to update
 * @returns Promise that resolves when projection is updated
 */
export async function updateProjection(id: string, data: Partial<Omit<Projection, 'id'>>): Promise<void> {
  ensureInitialized();
  
  // Note: This requires getting the current projection first
  // In a real AI scenario, the AI tool would fetch current state first
  throw new Error('Use updateProjectionName or updateSettings for specific updates');
}

/**
 * Delete a projection
 * @param id - Projection ID
 * @returns Promise that resolves when projection is deleted
 */
export async function deleteProjection(id: string): Promise<void> {
  ensureInitialized();
  await actionDispatcher!.deleteProjection(id);
}

/**
 * Duplicate a projection
 * @param id - Projection ID to duplicate
 * @returns Promise that resolves with new projection ID
 */
export async function duplicateProjection(id: string): Promise<string | null> {
  ensureInitialized();
  const newProjection = await actionDispatcher!.duplicateProjection(id);
  return newProjection ? newProjection.id : null;
}

/**
 * Add a transaction to a projection
 * @param projectionId - Projection ID
 * @param data - Transaction data (without ID - will be generated)
 * @returns Promise that resolves with transaction ID
 */
export async function addTransaction(
  projectionId: string,
  data: Omit<Transaction, 'id' | 'enabled'>
): Promise<string> {
  ensureInitialized();
  
  const id = crypto.randomUUID();
  const transaction: Transaction = {
    ...data,
    id,
    enabled: true,
  };

  await actionDispatcher!.addTransaction(projectionId, transaction);
  return id;
}

/**
 * Update a transaction
 * @param projectionId - Projection ID
 * @param transactionId - Transaction ID
 * @param data - Partial transaction data to update
 * @returns Promise that resolves when transaction is updated
 */
export async function updateTransaction(
  projectionId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, 'id'>>
): Promise<void> {
  ensureInitialized();
  
  // Note: This requires getting the current transaction first
  throw new Error('This operation requires fetching current transaction state first');
}

/**
 * Delete a transaction
 * @param projectionId - Projection ID
 * @param transactionId - Transaction ID
 * @returns Promise that resolves when transaction is deleted
 */
export async function deleteTransaction(projectionId: string, transactionId: string): Promise<void> {
  ensureInitialized();
  await actionDispatcher!.deleteTransaction(projectionId, transactionId);
}

/**
 * Toggle a transaction's enabled state
 * @param projectionId - Projection ID
 * @param transactionId - Transaction ID
 * @returns Promise that resolves when transaction is toggled
 */
export async function toggleTransaction(projectionId: string, transactionId: string): Promise<void> {
  ensureInitialized();
  await actionDispatcher!.toggleTransaction(projectionId, transactionId);
}

/**
 * Update projection settings
 * @param projectionId - Projection ID
 * @param settings - New settings
 * @returns Promise that resolves when settings are updated
 */
export async function updateProjectionSettings(
  projectionId: string,
  settings: ProjectionSettings
): Promise<void> {
  ensureInitialized();
  await actionDispatcher!.updateSettings(projectionId, settings);
}

/**
 * Update projection name
 * @param projectionId - Projection ID
 * @param name - New name
 * @returns Promise that resolves when name is updated
 */
export async function updateProjectionName(projectionId: string, name: string): Promise<void> {
  ensureInitialized();
  await actionDispatcher!.updateProjectionName(projectionId, name);
}

/**
 * Batch create multiple transactions
 * @param projectionId - Projection ID
 * @param transactions - Array of transaction data
 * @returns Promise that resolves with array of transaction IDs
 */
export async function batchAddTransactions(
  projectionId: string,
  transactions: Array<Omit<Transaction, 'id' | 'enabled'>>
): Promise<string[]> {
  ensureInitialized();
  
  const ids: string[] = [];
  for (const data of transactions) {
    const id = await addTransaction(projectionId, data);
    ids.push(id);
  }
  return ids;
}

/**
 * Batch delete multiple transactions
 * @param projectionId - Projection ID
 * @param transactionIds - Array of transaction IDs to delete
 * @returns Promise that resolves when all transactions are deleted
 */
export async function batchDeleteTransactions(
  projectionId: string,
  transactionIds: string[]
): Promise<void> {
  ensureInitialized();
  
  for (const transactionId of transactionIds) {
    await deleteTransaction(projectionId, transactionId);
  }
}

