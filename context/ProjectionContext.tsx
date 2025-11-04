import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import {
  ProjectionState,
  ProjectionAction,
  ActionType,
  projectionReducer,
  initialState,
} from '../store/projectionStore';
import { Projection, Transaction, ProjectionSettings } from '../types';
import * as db from '../utils/db';
import { initializeQueryInterface } from '../store/queryInterface';
import { initializeMutationInterface } from '../store/mutationInterface';

interface ProjectionContextType {
  state: ProjectionState;
  dispatch: React.Dispatch<ProjectionAction>;
  actions: {
    loadProjections: () => Promise<void>;
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
    setActiveProjection: (id: string | null) => void;
  };
}

export const ProjectionContext = createContext<ProjectionContextType | undefined>(
  undefined
);

export const ProjectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(projectionReducer, initialState);

  // Update query interface whenever state changes
  useEffect(() => {
    initializeQueryInterface(state.projections);
  }, [state.projections]);

  // Load projections from DB on mount
  const loadProjections = useCallback(async () => {
    dispatch({ type: ActionType.LOAD_PROJECTIONS_START });
    try {
      const projections = await db.getProjections();
      const sorted = projections.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      dispatch({ type: ActionType.LOAD_PROJECTIONS_SUCCESS, payload: sorted });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load projections';
      dispatch({ type: ActionType.LOAD_PROJECTIONS_ERROR, payload: message });
      console.error('Failed to load projections:', error);
    }
  }, []);

  useEffect(() => {
    loadProjections();
  }, [loadProjections]);

  // Create new projection
  const createProjection = useCallback(async (projection: Projection) => {
    // Optimistic update
    dispatch({ type: ActionType.ADD_PROJECTION, payload: projection });
    
    try {
      await db.saveProjection(projection);
    } catch (error) {
      // Rollback on error
      dispatch({ type: ActionType.DELETE_PROJECTION, payload: projection.id });
      const message = error instanceof Error ? error.message : 'Failed to create projection';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, []);

  // Update existing projection
  const updateProjection = useCallback(async (projection: Projection) => {
    // Get current state for rollback
    const current = state.projections.find(p => p.id === projection.id);
    
    // Optimistic update
    dispatch({ type: ActionType.UPDATE_PROJECTION, payload: projection });
    
    try {
      await db.saveProjection(projection);
    } catch (error) {
      // Rollback on error
      if (current) {
        dispatch({ type: ActionType.UPDATE_PROJECTION, payload: current });
      }
      const message = error instanceof Error ? error.message : 'Failed to update projection';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Delete projection
  const deleteProjection = useCallback(async (id: string) => {
    // Get current state for rollback
    const current = state.projections.find(p => p.id === id);
    
    // Optimistic update
    dispatch({ type: ActionType.DELETE_PROJECTION, payload: id });
    
    try {
      await db.deleteProjection(id);
    } catch (error) {
      // Rollback on error
      if (current) {
        dispatch({ type: ActionType.ADD_PROJECTION, payload: current });
      }
      const message = error instanceof Error ? error.message : 'Failed to delete projection';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Duplicate projection
  const duplicateProjection = useCallback(async (id: string): Promise<Projection | null> => {
    try {
      const original = await db.getProjection(id);
      if (!original) return null;

      const newProjection: Projection = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
      };

      await createProjection(newProjection);
      return newProjection;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to duplicate projection';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [createProjection]);

  // Add transaction
  const addTransaction = useCallback(async (projectionId: string, transaction: Transaction) => {
    // Optimistic update
    dispatch({
      type: ActionType.ADD_TRANSACTION,
      payload: { projectionId, transaction },
    });

    try {
      const projection = state.projections.find(p => p.id === projectionId);
      if (!projection) throw new Error('Projection not found');

      const updated = {
        ...projection,
        transactions: [...projection.transactions, transaction],
      };
      await db.saveProjection(updated);
    } catch (error) {
      // Rollback on error
      dispatch({
        type: ActionType.DELETE_TRANSACTION,
        payload: { projectionId, transactionId: transaction.id },
      });
      const message = error instanceof Error ? error.message : 'Failed to add transaction';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Update transaction
  const updateTransaction = useCallback(async (projectionId: string, transaction: Transaction) => {
    // Get current state for rollback
    const projection = state.projections.find(p => p.id === projectionId);
    const currentTransaction = projection?.transactions.find(t => t.id === transaction.id);

    // Optimistic update
    dispatch({
      type: ActionType.UPDATE_TRANSACTION,
      payload: { projectionId, transactionId: transaction.id, transaction },
    });

    try {
      if (!projection) throw new Error('Projection not found');

      const updated = {
        ...projection,
        transactions: projection.transactions.map(t =>
          t.id === transaction.id ? transaction : t
        ),
      };
      await db.saveProjection(updated);
    } catch (error) {
      // Rollback on error
      if (currentTransaction) {
        dispatch({
          type: ActionType.UPDATE_TRANSACTION,
          payload: { projectionId, transactionId: transaction.id, transaction: currentTransaction },
        });
      }
      const message = error instanceof Error ? error.message : 'Failed to update transaction';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Delete transaction
  const deleteTransaction = useCallback(async (projectionId: string, transactionId: string) => {
    // Get current state for rollback
    const projection = state.projections.find(p => p.id === projectionId);
    const currentTransaction = projection?.transactions.find(t => t.id === transactionId);

    // Optimistic update
    dispatch({
      type: ActionType.DELETE_TRANSACTION,
      payload: { projectionId, transactionId },
    });

    try {
      if (!projection) throw new Error('Projection not found');

      const updated = {
        ...projection,
        transactions: projection.transactions.filter(t => t.id !== transactionId),
      };
      await db.saveProjection(updated);
    } catch (error) {
      // Rollback on error
      if (currentTransaction) {
        dispatch({
          type: ActionType.ADD_TRANSACTION,
          payload: { projectionId, transaction: currentTransaction },
        });
      }
      const message = error instanceof Error ? error.message : 'Failed to delete transaction';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Toggle transaction enabled/disabled
  const toggleTransaction = useCallback(async (projectionId: string, transactionId: string) => {
    // Optimistic update
    dispatch({
      type: ActionType.TOGGLE_TRANSACTION,
      payload: { projectionId, transactionId },
    });

    try {
      const projection = state.projections.find(p => p.id === projectionId);
      if (!projection) throw new Error('Projection not found');

      const updated = {
        ...projection,
        transactions: projection.transactions.map(t =>
          t.id === transactionId ? { ...t, enabled: !t.enabled } : t
        ),
      };
      await db.saveProjection(updated);
    } catch (error) {
      // Rollback on error (toggle back)
      dispatch({
        type: ActionType.TOGGLE_TRANSACTION,
        payload: { projectionId, transactionId },
      });
      const message = error instanceof Error ? error.message : 'Failed to toggle transaction';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Update projection settings
  const updateSettings = useCallback(async (projectionId: string, settings: ProjectionSettings) => {
    // Get current state for rollback
    const projection = state.projections.find(p => p.id === projectionId);
    const currentSettings = projection?.settings;

    // Optimistic update
    dispatch({
      type: ActionType.UPDATE_SETTINGS,
      payload: { projectionId, settings },
    });

    try {
      if (!projection) throw new Error('Projection not found');

      const updated = { ...projection, settings };
      await db.saveProjection(updated);
    } catch (error) {
      // Rollback on error
      if (currentSettings) {
        dispatch({
          type: ActionType.UPDATE_SETTINGS,
          payload: { projectionId, settings: currentSettings },
        });
      }
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Update projection name
  const updateProjectionName = useCallback(async (projectionId: string, name: string) => {
    // Get current state for rollback
    const projection = state.projections.find(p => p.id === projectionId);
    const currentName = projection?.name;

    // Optimistic update
    dispatch({
      type: ActionType.UPDATE_PROJECTION_NAME,
      payload: { projectionId, name },
    });

    try {
      if (!projection) throw new Error('Projection not found');

      const updated = { ...projection, name };
      await db.saveProjection(updated);
    } catch (error) {
      // Rollback on error
      if (currentName) {
        dispatch({
          type: ActionType.UPDATE_PROJECTION_NAME,
          payload: { projectionId, name: currentName },
        });
      }
      const message = error instanceof Error ? error.message : 'Failed to update name';
      dispatch({ type: ActionType.SET_ERROR, payload: message });
      throw error;
    }
  }, [state.projections]);

  // Set active projection (no DB operation needed)
  const setActiveProjection = useCallback((id: string | null) => {
    dispatch({ type: ActionType.SET_ACTIVE_PROJECTION, payload: id });
  }, []);

  const actions = {
    loadProjections,
    createProjection,
    updateProjection,
    deleteProjection,
    duplicateProjection,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTransaction,
    updateSettings,
    updateProjectionName,
    setActiveProjection,
  };

  // Initialize mutation interface once
  useEffect(() => {
    initializeMutationInterface(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProjectionContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </ProjectionContext.Provider>
  );
};

