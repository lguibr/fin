import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CompositionDataPoint, Transaction } from '../types';
import Card from './ui/Card';
import SwitchHorizontalIcon from './icons/SwitchHorizontalIcon';

interface CompositionChartProps {
  data: CompositionDataPoint[];
  transactions: Transaction[];
  title: string;
  compositionType: 'expense' | 'income';
  setCompositionType: (type: 'expense' | 'income') => void;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, transactions }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.payload[entry.dataKey], 0);
    return (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-gray-200 mb-2">{label}</p>
        {payload.map((p: any) => {
          const transaction = transactions.find(t => t.id === p.dataKey);
          if (!transaction || p.value === 0) return null;
          const percentage = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={p.dataKey} className="flex items-center justify-between space-x-4">
                <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.fill }}></span>
                    <span className="text-gray-300">{p.name}:</span>
                </div>
                <span className="font-semibold text-gray-200">
                    {`${percentage}% (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.value)})`}
                </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const CompositionChart: React.FC<CompositionChartProps> = ({ data, transactions, title, compositionType, setCompositionType }) => {
  const transactionMap = transactions.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as { [id: string]: Transaction });
  
  const keys = transactions.map(t => t.id);

  const toggleCompositionType = () => {
    setCompositionType(compositionType === 'expense' ? 'income' : 'expense');
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100 capitalize">{title}</h2>
        <button onClick={toggleCompositionType} className="flex items-center space-x-2 text-sm bg-gray-800 hover:bg-gray-700 text-sky-400 font-semibold py-2 px-3 rounded-md transition-colors">
          <SwitchHorizontalIcon className="w-5 h-5" />
          <span>View {compositionType === 'expense' ? 'Income' : 'Expenses'}</span>
        </button>
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={data} stackOffset="expand" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="dateLabel" stroke="#9ca3af" fontSize={12} tick={{ fill: '#d1d5db' }} />
            <YAxis tickFormatter={(tick) => `${Math.round(tick * 100)}%`} stroke="#9ca3af" fontSize={12} tick={{ fill: '#d1d5db' }} />
            <Tooltip content={<CustomTooltip transactions={transactions} />} />
            <Legend formatter={(value, entry) => <span style={{ color: '#d1d5db' }}>{transactionMap[value]?.description}</span>}/>
            {keys.map(key => {
              const transaction = transactionMap[key];
              if (!transaction) return null;
              return <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={transaction.color} fill={transaction.color} name={transaction.description} />;
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CompositionChart;
