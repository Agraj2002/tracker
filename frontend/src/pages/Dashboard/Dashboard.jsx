import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../utils/apiPath';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import IncomeExpenseChart from '../../components/Charts/IncomeExpenseChart';
import CategoryPieChart from '../../components/Charts/CategoryPieChart';
import MonthlyTrendChart from '../../components/Charts/MonthlyTrendChart';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month'); // month, quarter, year
  const { user } = useAuth();
  const { formatCurrency } = useTheme();

  // Fetch dashboard data with useCallback for optimization
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.analytics.getDashboard({ timeframe });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  // Fetch data on component mount and timeframe change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoized calculations for performance
  const statsData = useMemo(() => {
    if (!dashboardData) return null;

    return {
      totalIncome: dashboardData.totalIncome || 0,
      totalExpenses: dashboardData.totalExpenses || 0,
      balance: (dashboardData.totalIncome || 0) - (dashboardData.totalExpenses || 0),
      transactionCount: dashboardData.transactionCount || 0,
      savingsRate: dashboardData.totalIncome > 0 
        ? ((dashboardData.totalIncome - dashboardData.totalExpenses) / dashboardData.totalIncome * 100)
        : 0
    };
  }, [dashboardData]);

  // Handle timeframe change with useCallback
  const handleTimeframeChange = useCallback((newTimeframe) => {
    setTimeframe(newTimeframe);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overview of your financial activity
            </p>
          </div>
          
          {/* Timeframe selector */}
          <div className="mt-4 sm:mt-0">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {[
                { key: 'month', label: 'This Month' },
                { key: 'quarter', label: 'Quarter' },
                { key: 'year', label: 'Year' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleTimeframeChange(option.key)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeframe === option.key
                      ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {statsData && <DashboardStats stats={statsData} />}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Income vs Expenses
            </h3>
            <IncomeExpenseChart 
              data={dashboardData?.incomeExpenseData || []} 
              timeframe={timeframe}
            />
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Expense Categories
            </h3>
            <CategoryPieChart 
              data={dashboardData?.categoryBreakdown || []} 
            />
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Monthly Trends
          </h3>
          <MonthlyTrendChart 
            data={dashboardData?.monthlyTrends || []} 
          />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
            <button
              onClick={() => window.location.href = '/transactions'}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <RecentTransactions 
            transactions={dashboardData?.recentTransactions || []} 
          />
        </div>

        {/* Quick Actions - Only for admin and user roles */}
        {user?.role !== 'read-only' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => window.location.href = '/transactions?action=add&type=income'}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-green-600 text-2xl mb-2">💰</div>
                <div className="font-medium text-gray-900 dark:text-white">Add Income</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Record new income</div>
              </button>
              
              <button
                onClick={() => window.location.href = '/transactions?action=add&type=expense'}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-red-600 text-2xl mb-2">💸</div>
                <div className="font-medium text-gray-900 dark:text-white">Add Expense</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Record new expense</div>
              </button>
              
              <button
                onClick={() => window.location.href = '/analytics'}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-blue-600 text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-900 dark:text-white">View Analytics</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Detailed reports</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
