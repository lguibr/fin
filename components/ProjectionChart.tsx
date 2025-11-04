// Fix: Corrected import from '../types' which is now a valid module.
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ProjectionDataPoint } from '../types';
import Card from './ui/Card';

interface ProjectionChartProps {
  data: ProjectionDataPoint[];
}

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
        return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value}`;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-gray-200">{label}</p>
        <p className="text-sky-400">Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total)}</p>
        <p className="text-indigo-400">Invested: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.invested)}</p>
        <p className="text-teal-400">Cash: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.cash)}</p>
      </div>
    );
  }
  return null;
};

const ProjectionChart: React.FC<ProjectionChartProps> = ({ data }) => {
  // Calculate consistent Y-axis domain from entire dataset
  const calculateDomain = (): [number, number] => {
    if (data.length === 0) return [0, 100];
    
    let minValue = 0;
    let maxValue = 0;
    
    data.forEach(point => {
      maxValue = Math.max(maxValue, point.total, point.cash, point.invested);
      minValue = Math.min(minValue, 0); // Keep min at 0 for wealth
    });
    
    // Add 10% padding
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    return [minValue - padding, maxValue + padding];
  };

  const yDomain = calculateDomain();

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-gray-100">Financial Projection</h2>
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          {data.length > 0 ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="dateLabel" stroke="#9ca3af" fontSize={12} tick={{ fill: '#d1d5db' }} />
              <YAxis 
                tickFormatter={formatCurrency} 
                stroke="#9ca3af" 
                fontSize={12} 
                tick={{ fill: '#d1d5db' }}
                domain={yDomain}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#d1d5db' }} />
              <Area type="monotone" dataKey="cash" stackId="1" stroke="#2dd4bf" fill="#14b8a6" name="Cash" />
              <Area type="monotone" dataKey="invested" stackId="1" stroke="#818cf8" fill="#6366f1" name="Invested" />
            </AreaChart>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
                <p>No data to display. Add transactions and configure settings to see your projection.</p>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProjectionChart;
