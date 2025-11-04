export type TransactionType = 'income' | 'expense';
export type TransactionFrequency = 'once' | 'monthly' | 'yearly';
export type TimePeriod = 'monthly' | 'yearly';
export type DisplayMode = 'relative' | 'absolute';
export type MainView = 'projection' | 'transactions' | 'calendar';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  frequency: TransactionFrequency;
  startDate: string; // ISO string 'YYYY-MM-DD'
  endDate?: string; // ISO string 'YYYY-MM-DD'
  color: string;
  enabled: boolean;
}

export interface ProjectionSettings {
  initialBalance: number;
  projectionYears: number;
  monthlyReturnRate: number; // as a percentage, e.g., 0.5 for 0.5%
  investmentAllocation: number; // as a percentage, e.g., 75 for 75%
}

export interface Projection {
    id: string;
    name: string;
    createdAt: string;
    settings: ProjectionSettings;
    transactions: Transaction[];
}

export interface UnifiedDataPoint {
  date: Date;
  dateLabel: string;
  cash: number;
  invested: number;
  total: number;
  totalIncome: number;
  totalExpense: number; // Stored as a negative number
  netCashFlow: number;
  investmentReturn: number;
  incomeBreakdown: { [transactionId: string]: number };
  expenseBreakdown: { [transactionId: string]: number }; // Stored as positive numbers
  [key: string]: any; // Allow dynamic keys for transaction breakdowns
}

// Fix: Add missing type definitions to resolve import errors.
export interface ProjectionDataPoint {
  dateLabel: string;
  cash: number;
  invested: number;
  total: number;
}

export interface CashFlowDataPoint {
  dateLabel: string;
  [key: string]: string | number;
}

export interface CompositionDataPoint {
  dateLabel: string;
  [key: string]: string | number;
}