import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const MonthlyTrendChart = ({ data, showArea = false }) => {
  const { formatCurrency, isDark } = useTheme();

  // Memoized chart data formatting for performance
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      income: Math.abs(item.income || 0),
      expense: Math.abs(item.expense || 0),
      balance: (item.income || 0) - (item.expense || 0),
      month: item.month || item.period
    }));
  }, [data]);

  // Custom tooltip with proper formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Chart colors based on theme
  const chartColors = {
    income: '#10b981', // green
    expense: '#ef4444', // red
    balance: '#875cf5', // primary purple
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#d1d5db' : '#6b7280'
  };

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">No trend data</p>
          <p className="text-sm">Add transactions over multiple months to see trends</p>
        </div>
      </div>
    );
  }

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: chartColors.text, fontSize: 12 }}
            axisLine={{ stroke: chartColors.grid }}
          />
          <YAxis 
            tick={{ fill: chartColors.text, fontSize: 12 }}
            axisLine={{ stroke: chartColors.grid }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: chartColors.text }}
          />
          
          {showArea ? (
            <>
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke={chartColors.income}
                fill={chartColors.income}
                fillOpacity={0.3}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="2"
                stroke={chartColors.expense}
                fill={chartColors.expense}
                fillOpacity={0.3}
                name="Expenses"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="income"
                stroke={chartColors.income}
                strokeWidth={2}
                dot={{ fill: chartColors.income, strokeWidth: 2, r: 4 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke={chartColors.expense}
                strokeWidth={2}
                dot={{ fill: chartColors.expense, strokeWidth: 2, r: 4 }}
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke={chartColors.balance}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: chartColors.balance, strokeWidth: 2, r: 4 }}
                name="Balance"
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
