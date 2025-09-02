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
  const [error, setError] = useState(null);
  const [isServerError, setIsServerError] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsServerError(false);
      setIsDemoData(false);
      
      const [dashboard, patterns, trends] = await Promise.all([
        apiService.analytics.getDashboard({ timeframe }),
        apiService.analytics.getPatterns({ timeframe }),
        apiService.analytics.getTrends({ timeframe })
      ]);
      
      console.log('Raw API Data:', { dashboard: dashboard.data, patterns: patterns.data, trends: trends.data });
      
      // Transform the data to match chart component expectations
      try {
        const transformedData = {
        // For IncomeExpenseChart - create data based on timeframe
        incomeExpenseData: (() => {
          if (timeframe === 'month') {
            // For month view, show current month's data as a single period
            const summary = dashboard.data?.summary || { income: { total: 0 }, expense: { total: 0 } };
            const currentMonthData = {
              period: 'Current Month',
              income: summary.income?.total || 0,
              expense: summary.expense?.total || 0
            };
            return [currentMonthData];
          } else {
            // For quarter/year, use trends data
            const trendsArray = trends.data?.trends || [];
            return trendsArray
              .filter(trend => {
                if (!trend || !trend.month) return false;
                
                const trendYear = parseInt(trend.month.split('-')[0]);
                const trendMonth = parseInt(trend.month.split('-')[1]);
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth() + 1;
                
                if (timeframe === 'year') {
                  return trendYear === currentYear;
                } else if (timeframe === 'quarter') {
                  const quarterStart = Math.floor((currentMonth - 1) / 3) * 3 + 1;
                  return trendYear === currentYear && trendMonth >= quarterStart && trendMonth < quarterStart + 3;
                }
                return false;
              })
              .map(trend => ({
                period: new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                income: trend.income,
                expense: trend.expense
              }));
          }
        })(),
        
        // For CategoryPieChart - transform categoryBreakdown
        categoryData: (dashboard.data?.categoryBreakdown || []).map(category => ({
          category: category.name,
          amount: category.totalAmount,
          percentage: category.percentage,
          color: category.color
        })),
        
        // For MonthlyTrendChart - use trends data directly with formatted months
        trendsData: (trends.data?.trends || []).map(trend => ({
          month: trend.month ? new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown',
          income: trend.income || 0,
          expense: trend.expense || 0,
          balance: trend.balance || 0
        })),
        
        // Store original data for other uses
        dashboard: dashboard.data,
        patterns: patterns.data,
        trends: trends.data
      };
      
      console.log('Transformed Data:', transformedData);
      console.log('CategoryData for pie chart:', transformedData.categoryData);
      console.log('IncomeExpenseData for bar chart:', transformedData.incomeExpenseData);
      console.log('TrendsData for line chart:', transformedData.trendsData);
      
      setAnalyticsData(transformedData);
      } catch (transformError) {
        console.error('Error transforming data:', transformError);
        toast.error('Error processing analytics data');
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Check if it's a server error
      if (error.response?.status >= 500 || error.isNetworkError || error.isServerError) {
        setIsServerError(true);
        setError(error);
      } else {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  // Function to generate dummy data for demonstration
  const loadDummyData = () => {
    const dummyData = {
      incomeExpenseData: [
        { period: 'Jan 2025', income: 5000, expense: 3200 },
        { period: 'Feb 2025', income: 5200, expense: 2800 },
        { period: 'Mar 2025', income: 4800, expense: 3500 },
        { period: 'Apr 2025', income: 5500, expense: 3100 },
        { period: 'May 2025', income: 5300, expense: 3400 },
        { period: 'Jun 2025', income: 5700, expense: 2900 },
        { period: 'Jul 2025', income: 5400, expense: 3300 },
        { period: 'Aug 2025', income: 5600, expense: 3000 },
        { period: 'Sep 2025', income: 5100, expense: 3600 }
      ],
      categoryData: [
        { category: 'Food & Dining', amount: 1200, percentage: 35, color: '#ef4444' },
        { category: 'Transportation', amount: 800, percentage: 24, color: '#f59e0b' },
        { category: 'Bills & Utilities', amount: 600, percentage: 18, color: '#06b6d4' },
        { category: 'Shopping', amount: 400, percentage: 12, color: '#8b5cf6' },
        { category: 'Entertainment', amount: 300, percentage: 9, color: '#10b981' },
        { category: 'Healthcare', amount: 100, percentage: 3, color: '#ec4899' }
      ],
      trendsData: [
        { month: 'Jan 2025', income: 5000, expense: 3200, balance: 1800 },
        { month: 'Feb 2025', income: 5200, expense: 2800, balance: 2400 },
        { month: 'Mar 2025', income: 4800, expense: 3500, balance: 1300 },
        { month: 'Apr 2025', income: 5500, expense: 3100, balance: 2400 },
        { month: 'May 2025', income: 5300, expense: 3400, balance: 1900 },
        { month: 'Jun 2025', income: 5700, expense: 2900, balance: 2800 },
        { month: 'Jul 2025', income: 5400, expense: 3300, balance: 2100 },
        { month: 'Aug 2025', income: 5600, expense: 3000, balance: 2600 },
        { month: 'Sep 2025', income: 5100, expense: 3600, balance: 1500 }
      ]
    };

    console.log('Loading dummy data:', dummyData);
    setAnalyticsData(dummyData);
    setIsDemoData(true);
    setLoading(false);
    toast.success('Dummy data loaded for demonstration');
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Show server error page if there's a server error
  if (isServerError) {
    return (
      <ServerError 
        error={error} 
        onRetry={fetchAnalyticsData} 
      />
    );
  }

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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              {isDemoData && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                  Demo Data
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Detailed insights into your financial data
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            {isDemoData ? (
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Load Real Data
              </button>
            ) : (
              <button
                onClick={loadDummyData}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Demo Data
              </button>
            )}
            
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

        {/* Show demo data suggestion if no real data */}
        {(!analyticsData?.incomeExpenseData?.length && !analyticsData?.categoryData?.length) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Analytics Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have enough transaction data to generate meaningful analytics. Add some transactions or try our demo data to see how the analytics work.
            </p>
            <button
              onClick={loadDummyData}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Load Demo Data
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Income vs Expenses
            </h3>
            <IncomeExpenseChart 
              data={analyticsData?.incomeExpenseData || []} 
              timeframe={timeframe}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Expense Breakdown
            </h3>
            <CategoryPieChart 
              data={analyticsData?.categoryData || []} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Financial Trends
          </h3>
          <MonthlyTrendChart 
            data={analyticsData?.trendsData || []} 
            showArea={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
