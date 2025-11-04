import { useContext, useMemo } from 'react';
import { ProjectionContext } from '../context/ProjectionContext';

/**
 * Hook to access projection state and actions
 * Throws if used outside ProjectionProvider
 */
export function useProjectionContext() {
  const context = useContext(ProjectionContext);
  if (!context) {
    throw new Error('useProjectionContext must be used within ProjectionProvider');
  }
  return context;
}

/**
 * Hook to get all projections
 */
export function useProjections() {
  const { state } = useProjectionContext();
  return {
    projections: state.projections,
    loading: state.loading,
    error: state.error,
  };
}

/**
 * Hook to get a single projection by ID
 */
export function useProjection(id: string | undefined) {
  const { state } = useProjectionContext();
  
  const projection = useMemo(() => {
    if (!id) return null;
    return state.projections.find(p => p.id === id) || null;
  }, [state.projections, id]);

  return {
    projection,
    loading: state.loading,
    error: state.error,
  };
}

/**
 * Hook to get projection actions
 */
export function useProjectionActions() {
  const { actions } = useProjectionContext();
  return actions;
}

/**
 * Hook to get active projection
 */
export function useActiveProjection() {
  const { state } = useProjectionContext();
  
  const activeProjection = useMemo(() => {
    if (!state.activeProjectionId) return null;
    return state.projections.find(p => p.id === state.activeProjectionId) || null;
  }, [state.projections, state.activeProjectionId]);

  return {
    activeProjection,
    activeProjectionId: state.activeProjectionId,
  };
}

