import React, { useContext, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { UnifiedDataPoint, Transaction, TimePeriod, DisplayMode } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { LanguageContext } from '../context/LanguageContext';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface UnifiedProjectionChartProps {
  data: UnifiedDataPoint[];
  transactions: Transaction[];
  timePeriod: TimePeriod;
  displayMode: DisplayMode;
  onTimePeriodChange: (period: TimePeriod) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

const formatAxis = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, transactionMap, t }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as UnifiedDataPoint;
    const totalPositiveExpense = -data.totalExpense;
    const totalIncome = data.totalIncome;

    return (
      <div className="p-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl text-sm w-80">
        <p className="font-bold text-foreground mb-3 text-base">{label}</p>
        
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('tooltip_total_wealth')}</span>
            <span className="font-bold text-primary">{formatCurrency(data.total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('tooltip_invested')}</span>
            <span className="font-semibold text-accent">{formatCurrency(data.invested)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('tooltip_cash')}</span>
            <span className="font-semibold text-green-500">{formatCurrency(data.cash)}</span>
          </div>
        </div>

        <div className="h-px bg-border my-3" />
        
        <div className="flex justify-between items-center font-bold mb-3">
          <span className="text-foreground">{t('tooltip_net_flow')}:</span>
          <span className={data.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}>
            {formatCurrency(data.netCashFlow)}
          </span>
        </div>

        {Object.keys(data.incomeBreakdown).length > 0 && (
          <div className="mt-3">
            <p className="font-semibold text-green-500 mb-2 text-xs uppercase tracking-wide">{t('tooltip_income')}</p>
            <div className="space-y-1">
              {Object.entries(data.incomeBreakdown).map(([id, amount]) => (
                <div key={id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: transactionMap[id]?.color }}></div>
                    <span className="text-muted-foreground truncate">{transactionMap[id]?.description}</span>
                  </div>
                  <span className="text-foreground font-medium ml-2">
                    {formatCurrency(amount)} <span className="text-muted-foreground">({((amount / totalIncome) * 100).toFixed(0)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {Object.keys(data.expenseBreakdown).length > 0 && (
          <div className="mt-3">
            <p className="font-semibold text-red-500 mb-2 text-xs uppercase tracking-wide">{t('tooltip_expenses')}</p>
            <div className="space-y-1">
              {Object.entries(data.expenseBreakdown).map(([id, amount]) => (
                <div key={id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: transactionMap[id]?.color }}></div>
                    <span className="text-muted-foreground truncate">{transactionMap[id]?.description}</span>
                  </div>
                  <span className="text-foreground font-medium ml-2">
                    {formatCurrency(amount)} <span className="text-muted-foreground">({((amount / totalPositiveExpense) * 100).toFixed(0)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const UnifiedProjectionChart: React.FC<UnifiedProjectionChartProps> = ({ data, transactions, timePeriod, displayMode, onTimePeriodChange, onDisplayModeChange }) => {
  const { t } = useContext(LanguageContext);
  const [showWealth, setShowWealth] = useState(true);
  const [showCashFlow, setShowCashFlow] = useState(true);

  const INVESTMENT_RETURN_PSEUDO_TRANSACTION: Transaction = {
    id: 'investmentReturn',
    description: t('investment_returns'),
    amount: 0,
    type: 'income',
    frequency: 'monthly',
    startDate: '',
    color: '#fbbf24',
    enabled: true,
  };

  const barsToRender = [...transactions, INVESTMENT_RETURN_PSEUDO_TRANSACTION];
  const transactionMap = barsToRender.reduce((acc, t) => { acc[t.id] = t; return acc; }, {} as Record<string, Transaction>);

  // Calculate consistent Y-axis domain from entire dataset
  const calculateDomain = (): [number, number] => {
    if (data.length === 0) return [0, 100];
    
    let minValue = 0;
    let maxValue = 0;
    
    data.forEach(point => {
      // Consider wealth values
      if (showWealth) {
        maxValue = Math.max(maxValue, point.total, point.cash, point.invested);
      }
      
      // Consider cash flow values
      if (showCashFlow) {
        // Aggregate income and expense stacks
        let incomeStack = 0;
        let expenseStack = 0;
        
        barsToRender.forEach(t => {
          const value = point[t.id] || 0;
          if (t.type === 'income') {
            incomeStack += value;
          } else {
            expenseStack += value;
          }
        });
        
        maxValue = Math.max(maxValue, incomeStack);
        minValue = Math.min(minValue, expenseStack);
      }
    });
    
    // Add 10% padding
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    return [minValue - padding, maxValue + padding];
  };

  const yDomain = calculateDomain();

  return (
    <Card hover={false} padding="p-2 sm:p-3">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t('unified_chart_title')}</h2>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {/* Time Period Toggle */}
            <div className="flex gap-0.5 sm:gap-1 border border-border rounded-md p-0.5 sm:p-1">
              <Button
                size="sm"
                variant={timePeriod === 'monthly' ? 'default' : 'ghost'}
                onClick={() => onTimePeriodChange('monthly')}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              >
                {t('monthly')}
              </Button>
              <Button
                size="sm"
                variant={timePeriod === 'yearly' ? 'default' : 'ghost'}
                onClick={() => onTimePeriodChange('yearly')}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              >
                {t('yearly')}
              </Button>
            </div>
            {/* Display Mode Toggle */}
            <div className="flex gap-0.5 sm:gap-1 border border-border rounded-md p-0.5 sm:p-1">
              <Button
                size="sm"
                variant={displayMode === 'relative' ? 'default' : 'ghost'}
                onClick={() => onDisplayModeChange('relative')}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              >
                Rel
              </Button>
              <Button
                size="sm"
                variant={displayMode === 'absolute' ? 'default' : 'ghost'}
                onClick={() => onDisplayModeChange('absolute')}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              >
                Abs
              </Button>
            </div>
            {/* Wealth/Cash Flow Toggle */}
            <div className="flex gap-0.5 sm:gap-1">
              <Button
                size="sm"
                variant={showWealth ? 'default' : 'outline'}
                onClick={() => setShowWealth(!showWealth)}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              >
                {showWealth ? <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" /> : <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />}
                <span className="hidden sm:inline">{t('button_wealth')}</span>
              </Button>
              <Button
                size="sm"
                variant={showCashFlow ? 'default' : 'outline'}
                onClick={() => setShowCashFlow(!showCashFlow)}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              >
                {showCashFlow ? <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" /> : <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />}
                <span className="hidden sm:inline">{t('button_cash_flow')}</span>
              </Button>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer>
            {data.length > 0 ? (
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 20 }}>
                <defs>
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" opacity={0.5} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={11} 
                  tick={{ fill: 'rgba(255,255,255,0.7)' }} 
                />
                <YAxis 
                  tickFormatter={formatAxis} 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10} 
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  domain={yDomain}
                  width={50}
                />
                <Tooltip content={<CustomTooltip transactionMap={transactionMap} t={t} />} />
                <Legend 
                  wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '20px' }}
                  iconType="circle"
                />
                
                {showWealth && (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="cash" 
                      stackId="wealth" 
                      name={t('legend_cash')} 
                      fill="url(#cashGradient)" 
                      stroke="#14b8a6"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="invested" 
                      stackId="wealth" 
                      name={t('legend_invested')} 
                      fill="url(#investedGradient)" 
                      stroke="#6366f1"
                      strokeWidth={2}
                    />
                  </>
                )}

                {showCashFlow && barsToRender.map(t => (
                  <Bar 
                    key={t.id}
                    dataKey={t.id}
                    stackId={t.type}
                    name={t.description}
                    fill={t.color}
                    barSize={20}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </ComposedChart>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <TrendingUp className="w-12 h-12 opacity-20" />
                <p>{t('no_data_to_display')}</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default UnifiedProjectionChart;