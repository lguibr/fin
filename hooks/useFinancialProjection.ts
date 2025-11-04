import { useMemo } from 'react';
import { Transaction, ProjectionSettings, TimePeriod, DisplayMode, UnifiedDataPoint } from '../types';

const getMonthsDifference = (d1: Date, d2: Date) => {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

export const useFinancialProjection = (
  transactions: Transaction[],
  settings: ProjectionSettings,
  timePeriod: TimePeriod,
  displayMode: DisplayMode
) => {
  const { unifiedData, monthlyData } = useMemo(() => {
    const activeTransactions = transactions.filter(t => t.enabled);
    
    const monthlyDataPoints: UnifiedDataPoint[] = [];
    const initialInvested = settings.initialBalance * (settings.investmentAllocation / 100);
    const initialCash = settings.initialBalance - initialInvested;
    let cash = initialCash;
    let invested = initialInvested;
    const startDate = new Date();
    startDate.setDate(1);
    const numMonths = settings.projectionYears * 12;

    for (let i = 0; i < numMonths; i++) {
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const dateLabel = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const incomeBreakdown: { [id: string]: number } = {};
      const expenseBreakdown: { [id: string]: number } = {};
      const flattenedBreakdowns: { [key: string]: number } = {};
      
      // Only apply investment returns starting from month 1 (not the initial month)
      const investmentReturn = i > 0 ? invested * (settings.monthlyReturnRate / 100) : 0;
      invested += investmentReturn;

      let transactionIncome = 0;
      let transactionExpense = 0;

      activeTransactions.forEach(t => {
        const tStartDate = new Date(t.startDate.replace(/-/g, '/'));
        const tEndDate = t.endDate ? new Date(t.endDate.replace(/-/g, '/')) : null;
        let isActive = false;
        if (currentDate >= tStartDate && (!tEndDate || currentDate <= tEndDate)) {
          if (t.frequency === 'once' && getMonthsDifference(tStartDate, currentDate) === 0) isActive = true;
          else if (t.frequency === 'monthly') isActive = true;
          else if (t.frequency === 'yearly' && getMonthsDifference(tStartDate, currentDate) % 12 === 0) isActive = true;
        }
        
        if (isActive) {
          if (t.type === 'income') {
            transactionIncome += t.amount;
            incomeBreakdown[t.id] = t.amount;
            flattenedBreakdowns[t.id] = t.amount;
          } else {
            transactionExpense += t.amount;
            expenseBreakdown[t.id] = t.amount;
            flattenedBreakdowns[t.id] = -t.amount;
          }
        }
      });

      const transactionalNetCashFlow = transactionIncome - transactionExpense;
      cash += transactionalNetCashFlow;

      // If cash becomes negative, withdraw from invested first
      if (cash < 0 && invested > 0) {
        const deficit = Math.abs(cash);
        const withdrawFromInvested = Math.min(deficit, invested);
        invested -= withdrawFromInvested;
        cash += withdrawFromInvested;
      }

      // Only invest surplus (positive cash flow)
      const surplusToInvest = (transactionalNetCashFlow > 0) ? transactionalNetCashFlow : 0;
      const amountToInvest = surplusToInvest * (settings.investmentAllocation / 100);

      if (amountToInvest > 0) {
        cash -= amountToInvest;
        invested += amountToInvest;
      }

      const totalIncomeForReporting = transactionIncome + (investmentReturn > 0 ? investmentReturn : 0);
      const netCashFlowForReporting = totalIncomeForReporting - transactionExpense;
      if (investmentReturn > 0) {
        incomeBreakdown['investmentReturn'] = investmentReturn;
        flattenedBreakdowns['investmentReturn'] = investmentReturn;
      }
      
      monthlyDataPoints.push({
        date: currentDate,
        dateLabel,
        cash: Math.round(cash),
        invested: Math.round(invested),
        total: Math.round(cash + invested),
        totalIncome: totalIncomeForReporting,
        totalExpense: -transactionExpense,
        netCashFlow: netCashFlowForReporting,
        investmentReturn: Math.round(investmentReturn),
        incomeBreakdown,
        expenseBreakdown,
        ...flattenedBreakdowns,
      });
    }

    // Aggregate by time period
    let baseData = monthlyDataPoints;
    
    if (timePeriod === 'yearly') {
      const yearlyDataMap = monthlyDataPoints.reduce((acc, point) => {
        const year = point.date.getFullYear().toString();
        if (!acc[year]) {
          acc[year] = { ...point, dateLabel: year, totalIncome: 0, totalExpense: 0, netCashFlow: 0, investmentReturn: 0, incomeBreakdown: {}, expenseBreakdown: {} };
          activeTransactions.forEach(t => { acc[year][t.id] = 0; });
          acc[year]['investmentReturn'] = 0;
        }
        acc[year].cash = point.cash;
        acc[year].invested = point.invested;
        acc[year].total = point.total;
        acc[year].totalIncome += point.totalIncome;
        acc[year].totalExpense += point.totalExpense;
        acc[year].netCashFlow += point.netCashFlow;
        acc[year].investmentReturn += point.investmentReturn;
        
        Object.keys(point.incomeBreakdown).forEach(id => {
          const key = id === 'investmentReturn' ? 'investmentReturn' : id;
          acc[year][key] = (acc[year][key] || 0) + point[key];
          acc[year].incomeBreakdown[id] = (acc[year].incomeBreakdown[id] || 0) + (point.incomeBreakdown[id] || 0);
        });
        Object.keys(point.expenseBreakdown).forEach(id => {
            acc[year][id] = (acc[year][id] || 0) + point[id];
            acc[year].expenseBreakdown[id] = (acc[year].expenseBreakdown[id] || 0) + (point.expenseBreakdown[id] || 0);
        });

        return acc;
      }, {} as { [key: string]: UnifiedDataPoint });
      baseData = Object.values(yearlyDataMap);
    }
    
    // Apply display mode (relative vs absolute)
    if (displayMode === 'absolute') {
      // Absolute mode shows cumulative cash flow sums
      let cumulativeTotalIncome = 0;
      let cumulativeTotalExpense = 0;
      let cumulativeNetCashFlow = 0;
      let cumulativeInvestmentReturn = 0;
      const cumulativeTransactionTotals: { [key: string]: number } = {};
      
      const absoluteData = baseData.map(point => {
        cumulativeTotalIncome += point.totalIncome;
        cumulativeTotalExpense += point.totalExpense;
        cumulativeNetCashFlow += point.netCashFlow;
        cumulativeInvestmentReturn += point.investmentReturn;
        
        // Cumulative transaction breakdowns
        const cumulativeIncomeBreakdown: { [id: string]: number } = {};
        const cumulativeExpenseBreakdown: { [id: string]: number } = {};
        const cumulativeFlattened: { [key: string]: number } = {};
        
        Object.keys(point.incomeBreakdown).forEach(id => {
          cumulativeTransactionTotals[id] = (cumulativeTransactionTotals[id] || 0) + point.incomeBreakdown[id];
          cumulativeIncomeBreakdown[id] = cumulativeTransactionTotals[id];
          cumulativeFlattened[id] = cumulativeTransactionTotals[id];
        });
        
        Object.keys(point.expenseBreakdown).forEach(id => {
          cumulativeTransactionTotals[id] = (cumulativeTransactionTotals[id] || 0) - point.expenseBreakdown[id];
          cumulativeExpenseBreakdown[id] = Math.abs(cumulativeTransactionTotals[id]);
          cumulativeFlattened[id] = cumulativeTransactionTotals[id];
        });
        
        return {
          ...point,
          totalIncome: cumulativeTotalIncome,
          totalExpense: cumulativeTotalExpense,
          netCashFlow: cumulativeNetCashFlow,
          investmentReturn: cumulativeInvestmentReturn,
          incomeBreakdown: cumulativeIncomeBreakdown,
          expenseBreakdown: cumulativeExpenseBreakdown,
          ...cumulativeFlattened,
        };
      });
      
      return { unifiedData: absoluteData, monthlyData: monthlyDataPoints };
    }
    
    return { unifiedData: baseData, monthlyData: monthlyDataPoints };
  }, [transactions, settings, timePeriod, displayMode]);

  return { unifiedData, monthlyData };
};