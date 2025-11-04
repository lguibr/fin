import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { CashFlowDataPoint, Transaction } from '../types';
import Card from './ui/Card';

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
  transactions: Transaction[];
}

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, transactions }) => {
  if (active && payload && payload.length) {
    let totalIncome = 0;
    let totalExpense = 0;
    const items = payload.map(p => {
        const transaction = transactions.find(t => t.id === p.dataKey);
        if (transaction) {
            if(transaction.type === 'income') totalIncome += p.value;
            else totalExpense += p.value;
        }
        return { ...p, transaction };
    }).filter(p => p.transaction && p.value !== 0);

    return (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-gray-200 mb-2">{label}</p>
        {items.map(({ value, transaction }) => (
          <div key={transaction.id} className="flex items-center justify-between space-x-4">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: transaction.color }}></span>
              <span className="text-gray-300">{transaction.description}:</span>
            </div>
            <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
            </span>
          </div>
        ))}
        <hr className="my-2 border-gray-600" />
        <p className="text-sky-400 font-bold">Net: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome + totalExpense)}</p>
      </div>
    );
  }
  return null;
};


const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, transactions }) => {
  const transactionMap = transactions.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as { [id: string]: Transaction });
  
  const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'dateLabel') : [];

  // Calculate consistent Y-axis domain from entire dataset
  const calculateDomain = (): [number, number] => {
    if (data.length === 0) return [-100, 100];
    
    let minValue = 0;
    let maxValue = 0;
    
    data.forEach(point => {
      let incomeStack = 0;
      let expenseStack = 0;
      
      transactions.forEach(t => {
        const value = point[t.id] || 0;
        if (t.type === 'income') {
          incomeStack += value;
        } else {
          expenseStack += value;
        }
      });
      
      maxValue = Math.max(maxValue, incomeStack);
      minValue = Math.min(minValue, expenseStack);
    });
    
    // Add 10% padding
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    return [minValue - padding, maxValue + padding];
  };

  const yDomain = calculateDomain();

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-gray-100">Monthly Cash Flow</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="dateLabel" stroke="#9ca3af" fontSize={12} tick={{ fill: '#d1d5db' }} />
            <YAxis 
              tickFormatter={formatCurrency} 
              stroke="#9ca3af" 
              fontSize={12} 
              tick={{ fill: '#d1d5db' }}
              domain={yDomain}
            />
            <Tooltip content={<CustomTooltip transactions={transactions} />} wrapperStyle={{ zIndex: 10 }}/>
            <Legend formatter={(value, entry) => <span style={{ color: '#d1d5db' }}>{transactionMap[value]?.description}</span>}/>
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
            {keys.map(key => {
                const transaction = transactionMap[key];
                if (!transaction) return null;
                return <Bar key={key} dataKey={key} stackId="a" fill={transaction.color} name={transaction.description} />;
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CashFlowChart;
