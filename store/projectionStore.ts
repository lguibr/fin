import { Projection, Transaction, ProjectionSettings } from '../types';

// Action Types
export const enum ActionType {
  LOAD_PROJECTIONS_START = 'LOAD_PROJECTIONS_START',
  LOAD_PROJECTIONS_SUCCESS = 'LOAD_PROJECTIONS_SUCCESS',
  LOAD_PROJECTIONS_ERROR = 'LOAD_PROJECTIONS_ERROR',
  
  ADD_PROJECTION = 'ADD_PROJECTION',
  UPDATE_PROJECTION = 'UPDATE_PROJECTION',
  DELETE_PROJECTION = 'DELETE_PROJECTION',
  
  ADD_TRANSACTION = 'ADD_TRANSACTION',
  UPDATE_TRANSACTION = 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION = 'DELETE_TRANSACTION',
  TOGGLE_TRANSACTION = 'TOGGLE_TRANSACTION',
  
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  UPDATE_PROJECTION_NAME = 'UPDATE_PROJECTION_NAME',
  
  SET_ACTIVE_PROJECTION = 'SET_ACTIVE_PROJECTION',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

// Action Interfaces
export interface LoadProjectionsStartAction {
  type: ActionType.LOAD_PROJECTIONS_START;
}

export interface LoadProjectionsSuccessAction {
  type: ActionType.LOAD_PROJECTIONS_SUCCESS;
  payload: Projection[];
}

export interface LoadProjectionsErrorAction {
  type: ActionType.LOAD_PROJECTIONS_ERROR;
  payload: string;
}

export interface AddProjectionAction {
  type: ActionType.ADD_PROJECTION;
  payload: Projection;
}

export interface UpdateProjectionAction {
  type: ActionType.UPDATE_PROJECTION;
  payload: Projection;
}

export interface DeleteProjectionAction {
  type: ActionType.DELETE_PROJECTION;
  payload: string; // projection ID
}

export interface AddTransactionAction {
  type: ActionType.ADD_TRANSACTION;
  payload: {
    projectionId: string;
    transaction: Transaction;
  };
}

export interface UpdateTransactionAction {
  type: ActionType.UPDATE_TRANSACTION;
  payload: {
    projectionId: string;
    transactionId: string;
    transaction: Transaction;
  };
}

export interface DeleteTransactionAction {
  type: ActionType.DELETE_TRANSACTION;
  payload: {
    projectionId: string;
    transactionId: string;
  };
}

export interface ToggleTransactionAction {
  type: ActionType.TOGGLE_TRANSACTION;
  payload: {
    projectionId: string;
    transactionId: string;
  };
}

export interface UpdateSettingsAction {
  type: ActionType.UPDATE_SETTINGS;
  payload: {
    projectionId: string;
    settings: ProjectionSettings;
  };
}

export interface UpdateProjectionNameAction {
  type: ActionType.UPDATE_PROJECTION_NAME;
  payload: {
    projectionId: string;
    name: string;
  };
}

export interface SetActiveProjectionAction {
  type: ActionType.SET_ACTIVE_PROJECTION;
  payload: string | null;
}

export interface SetErrorAction {
  type: ActionType.SET_ERROR;
  payload: string;
}

export interface ClearErrorAction {
  type: ActionType.CLEAR_ERROR;
}

export type ProjectionAction =
  | LoadProjectionsStartAction
  | LoadProjectionsSuccessAction
  | LoadProjectionsErrorAction
  | AddProjectionAction
  | UpdateProjectionAction
  | DeleteProjectionAction
  | AddTransactionAction
  | UpdateTransactionAction
  | DeleteTransactionAction
  | ToggleTransactionAction
  | UpdateSettingsAction
  | UpdateProjectionNameAction
  | SetActiveProjectionAction
  | SetErrorAction
  | ClearErrorAction;

// State Interface
export interface ProjectionState {
  projections: Projection[];
  activeProjectionId: string | null;
  loading: boolean;
  error: string | null;
}

// Initial State
export const initialState: ProjectionState = {
  projections: [],
  activeProjectionId: null,
  loading: false,
  error: null,
};

// Reducer
export function projectionReducer(
  state: ProjectionState,
  action: ProjectionAction
): ProjectionState {
  switch (action.type) {
    case ActionType.LOAD_PROJECTIONS_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ActionType.LOAD_PROJECTIONS_SUCCESS:
      return {
        ...state,
        projections: action.payload,
        loading: false,
        error: null,
      };

    case ActionType.LOAD_PROJECTIONS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ActionType.ADD_PROJECTION:
      return {
        ...state,
        projections: [action.payload, ...state.projections],
        error: null,
      };

    case ActionType.UPDATE_PROJECTION:
      return {
        ...state,
        projections: state.projections.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
        error: null,
      };

    case ActionType.DELETE_PROJECTION:
      return {
        ...state,
        projections: state.projections.filter(p => p.id !== action.payload),
        activeProjectionId:
          state.activeProjectionId === action.payload
            ? null
            : state.activeProjectionId,
        error: null,
      };

    case ActionType.ADD_TRANSACTION:
      return {
        ...state,
        projections: state.projections.map(p =>
          p.id === action.payload.projectionId
            ? { ...p, transactions: [...p.transactions, action.payload.transaction] }
            : p
        ),
        error: null,
      };

    case ActionType.UPDATE_TRANSACTION:
      return {
        ...state,
        projections: state.projections.map(p =>
          p.id === action.payload.projectionId
            ? {
                ...p,
                transactions: p.transactions.map(t =>
                  t.id === action.payload.transactionId
                    ? action.payload.transaction
                    : t
                ),
              }
            : p
        ),
        error: null,
      };

    case ActionType.DELETE_TRANSACTION:
      return {
        ...state,
        projections: state.projections.map(p =>
          p.id === action.payload.projectionId
            ? {
                ...p,
                transactions: p.transactions.filter(
                  t => t.id !== action.payload.transactionId
                ),
              }
            : p
        ),
        error: null,
      };

    case ActionType.TOGGLE_TRANSACTION:
      return {
        ...state,
        projections: state.projections.map(p =>
          p.id === action.payload.projectionId
            ? {
                ...p,
                transactions: p.transactions.map(t =>
                  t.id === action.payload.transactionId
                    ? { ...t, enabled: !t.enabled }
                    : t
                ),
              }
            : p
        ),
        error: null,
      };

    case ActionType.UPDATE_SETTINGS:
      return {
        ...state,
        projections: state.projections.map(p =>
          p.id === action.payload.projectionId
            ? { ...p, settings: action.payload.settings }
            : p
        ),
        error: null,
      };

    case ActionType.UPDATE_PROJECTION_NAME:
      return {
        ...state,
        projections: state.projections.map(p =>
          p.id === action.payload.projectionId
            ? { ...p, name: action.payload.name }
            : p
        ),
        error: null,
      };

    case ActionType.SET_ACTIVE_PROJECTION:
      return {
        ...state,
        activeProjectionId: action.payload,
      };

    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

