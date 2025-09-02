import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { apiService } from '../../utils/apiPath';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import IncomeExpenseChart from '../../components/Charts/IncomeExpenseChart';
import CategoryPieChart from '../../components/Charts/CategoryPieChart';
import MonthlyTrendChart from '../../components/Charts/MonthlyTrendChart';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('year');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboard, patterns, trends] = await Promise.all([
        apiService.analytics.getDashboard({ timeframe }),
        apiService.analytics.getPatterns({ timeframe }),
        apiService.analytics.getTrends({ timeframe })
      ]);
      
      setAnalyticsData({
        dashboard: dashboard.data,
        patterns: patterns.data,
        trends: trends.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="large" message="Loading analytics..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Detailed insights into your financial data
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Income vs Expenses
            </h3>
            <IncomeExpenseChart 
              data={analyticsData?.dashboard?.incomeExpenseData || []} 
              timeframe={timeframe}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Expense Breakdown
            </h3>
            <CategoryPieChart 
              data={analyticsData?.patterns || []} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Financial Trends
          </h3>
          <MonthlyTrendChart 
            data={analyticsData?.trends || []} 
            showArea={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
