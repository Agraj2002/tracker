import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowUp, FaArrowDown, FaWallet, FaChartLine } from 'react-icons/fa';

const DashboardStats = ({ stats }) => {
  const { formatCurrency } = useTheme();

  // Memoized stat cards for performance
  const statCards = useMemo(() => [
    {
      title: 'Total Income',
      value: formatCurrency(stats.totalIncome),
      icon: FaArrowUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: stats.incomeChange,
      changeType: stats.incomeChange >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses),
      icon: FaArrowDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      change: stats.expenseChange,
      changeType: stats.expenseChange >= 0 ? 'negative' : 'positive'
    },
    {
      title: 'Balance',
      value: formatCurrency(stats.balance),
      icon: FaWallet,
      color: stats.balance >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: stats.balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20',
      change: stats.balanceChange,
      changeType: stats.balanceChange >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Savings Rate',
      value: `${stats.savingsRate.toFixed(1)}%`,
      icon: FaChartLine,
      color: stats.savingsRate >= 20 ? 'text-green-600' : stats.savingsRate >= 0 ? 'text-yellow-600' : 'text-red-600',
      bgColor: stats.savingsRate >= 20 ? 'bg-green-50 dark:bg-green-900/20' : stats.savingsRate >= 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20',
      subtitle: `${stats.transactionCount} transactions`
    }
  ], [stats, formatCurrency]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                
                {stat.subtitle && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {stat.subtitle}
                  </p>
                )}
                
                {stat.change !== undefined && (
                  <div className={`mt-2 flex items-center text-sm ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <FaArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <FaArrowDown className="w-3 h-3 mr-1" />
                    )}
                    <span>
                      {Math.abs(stat.change).toFixed(1)}% from last period
                    </span>
                  </div>
                )}
              </div>
              
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
