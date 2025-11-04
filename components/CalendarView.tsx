import React, { useState, useMemo, useContext } from 'react';
import { Transaction, UnifiedDataPoint } from '../types';
import { LanguageContext } from '../context/LanguageContext';
import { cn } from '../lib/utils';

interface CalendarViewProps {
  transactions: Transaction[];
  monthlyData: UnifiedDataPoint[];
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const CalendarSummary: React.FC<{ data: UnifiedDataPoint | undefined }> = ({ data }) => {
    const { t } = useContext(LanguageContext);
    const summary = {
        totalIncome: data?.totalIncome || 0,
        totalExpense: data ? -data.totalExpense : 0,
        netFlow: data?.netCashFlow || 0,
        investmentReturn: data?.investmentReturn || 0,
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 text-center">
            <div className="border border-border rounded-lg p-2 backdrop-blur-sm bg-card/30">
                <p className="text-xs sm:text-sm text-muted-foreground">{t('calendar_total_income')}</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400">{formatCurrency(summary.totalIncome)}</p>
            </div>
            <div className="border border-border rounded-lg p-2 backdrop-blur-sm bg-card/30">
                <p className="text-xs sm:text-sm text-muted-foreground">{t('calendar_total_expenses')}</p>
                <p className="text-lg sm:text-2xl font-bold text-red-400">{formatCurrency(summary.totalExpense)}</p>
            </div>
            <div className="border border-border rounded-lg p-2 backdrop-blur-sm bg-card/30">
                <p className="text-xs sm:text-sm text-muted-foreground">{t('calendar_net_flow')}</p>
                <p className={`text-lg sm:text-2xl font-bold ${summary.netFlow >= 0 ? 'text-sky-400' : 'text-orange-400'}`}>{formatCurrency(summary.netFlow)}</p>
            </div>
            <div className="border border-border rounded-lg p-2 backdrop-blur-sm bg-card/30">
                <p className="text-xs sm:text-sm text-muted-foreground">{t('calendar_investment_returns')}</p>
                <p className="text-lg sm:text-2xl font-bold text-amber-400">{formatCurrency(summary.investmentReturn)}</p>
            </div>
        </div>
    );
};


const CalendarView: React.FC<CalendarViewProps> = ({ transactions, monthlyData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { language } = useContext(LanguageContext);

  const { days, weekDays } = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dayList = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        dayList.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const weekDayList = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        weekDayList.push(d.toLocaleString(language, { weekday: 'short' }));
    }

    return { days: dayList, weekDays: weekDayList };
  }, [currentDate, language]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const currentMonthData = useMemo(() => {
    return monthlyData.find(d => {
        const dataDate = new Date(d.date);
        return dataDate.getFullYear() === currentDate.getFullYear() && dataDate.getMonth() === currentDate.getMonth();
    });
  }, [currentDate, monthlyData]);

  const getTransactionsForDay = (date: Date) => {
    return transactions.filter(t => {
      const tStart = new Date(t.startDate.replace(/-/g, '/'));
      const tEnd = t.endDate ? new Date(t.endDate.replace(/-/g, '/')) : null;
      if (date < tStart || (tEnd && date > tEnd)) return false;

      if (t.frequency === 'once') return tStart.toDateString() === date.toDateString();
      if (t.frequency === 'monthly') return tStart.getDate() === date.getDate();
      if (t.frequency === 'yearly') return tStart.getDate() === date.getDate() && tStart.getMonth() === date.getMonth();
      return false;
    });
  };

  return (
    <div className="border border-border rounded-lg shadow-lg p-2 sm:p-3 backdrop-blur-sm bg-card/20">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-accent/20">&lt;</button>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          {currentDate.toLocaleString(language, { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-accent/20">&gt;</button>
      </div>
      
      <CalendarSummary data={currentMonthData} />

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 gap-0.5 text-center font-semibold text-muted-foreground mb-1">
            {weekDays.map(d => <div key={d} className="text-xs sm:text-sm">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              const isCurrentMonth = d.getMonth() === currentDate.getMonth();
              const isToday = d.toDateString() === new Date().toDateString();
              const dayTransactions = getTransactionsForDay(d);
              return (
                <div key={i} className={cn(
                  "h-24 sm:h-28 border border-border rounded-md p-1 overflow-y-auto backdrop-blur-sm",
                  !isCurrentMonth ? 'bg-card/10 opacity-50' : 'bg-card/30'
                )}>
                  <div className={cn(
                    "text-right text-xs sm:text-sm font-bold",
                    isToday && 'bg-primary rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-primary-foreground ml-auto'
                  )}>
                    {d.getDate()}
                  </div>
                  <div className="text-left text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 mt-1">
                    {dayTransactions.map(t => (
                      <div key={t.id} className="flex items-center" title={`${t.description}: $${t.amount}`}>
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 flex-shrink-0" style={{backgroundColor: t.color}}></span>
                        <span className="truncate">{t.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;