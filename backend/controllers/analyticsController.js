const { query } = require('../config/database');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.user_id || req.user.id : req.user.id;
    const { period = 'month' } = req.query;

    // Calculate date range based on period
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND date >= $2 AND date <= $3
      GROUP BY type
    `;

    const summaryResult = await query(summaryQuery, [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

    const summary = {
      income: { count: 0, total: 0 },
      expense: { count: 0, total: 0 },
      balance: 0
    };

    summaryResult.rows.forEach(row => {
      summary[row.type] = {
        count: parseInt(row.count),
        total: parseFloat(row.total)
      };
    });

    summary.balance = summary.income.total - summary.expense.total;

    // Get category breakdown
    const categoryQuery = `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.color,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_amount,
        ROUND((SUM(t.amount) * 100.0 / NULLIF(
          (SELECT SUM(amount) FROM transactions WHERE user_id = $1 AND type = c.type AND date >= $2 AND date <= $3), 0
        )), 2) as percentage
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id 
        AND t.user_id = $1 
        AND t.date >= $2 
        AND t.date <= $3
      WHERE EXISTS (
        SELECT 1 FROM transactions 
        WHERE category_id = c.id 
        AND user_id = $1 
        AND date >= $2 
        AND date <= $3
      )
      GROUP BY c.id, c.name, c.type, c.color
      ORDER BY total_amount DESC
    `;

    const categoryResult = await query(categoryQuery, [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

    const categoryBreakdown = categoryResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      transactionCount: parseInt(row.transaction_count),
      totalAmount: parseFloat(row.total_amount),
      percentage: parseFloat(row.percentage) || 0
    }));

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        },
        summary,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get monthly trends
const getMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.user_id || req.user.id : req.user.id;
    const { months = 12 } = req.query;

    const monthsBack = Math.min(24, Math.max(1, parseInt(months)));

    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', date) as month,
        type,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 
        AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${monthsBack} months')
      GROUP BY DATE_TRUNC('month', date), type
      ORDER BY month ASC
    `;

    const result = await query(trendsQuery, [userId]);

    // Process data into chart-friendly format
    const monthlyData = {};
    
    result.rows.forEach(row => {
      const monthKey = row.month.toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, balance: 0 };
      }
      monthlyData[monthKey][row.type] = parseFloat(row.total);
    });

    // Calculate balance and fill missing months
    const trends = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    for (let i = 0; i < monthsBack; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      const monthKey = currentDate.toISOString().slice(0, 7);
      
      const monthData = monthlyData[monthKey] || { income: 0, expense: 0 };
      monthData.balance = monthData.income - monthData.expense;
      
      trends.push({
        month: monthKey,
        ...monthData
      });
    }

    res.json({
      success: true,
      data: {
        trends
      }
    });

  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get spending patterns by day of week
const getSpendingPatterns = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.user_id || req.user.id : req.user.id;
    const { period = 'month' } = req.query;

    // Calculate date range
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const patternsQuery = `
      SELECT 
        EXTRACT(DOW FROM date) as day_of_week,
        EXTRACT(HOUR FROM created_at) as hour_of_day,
        type,
        COUNT(*) as transaction_count,
        COALESCE(AVG(amount), 0) as avg_amount,
        COALESCE(SUM(amount), 0) as total_amount
      FROM transactions
      WHERE user_id = $1 AND date >= $2
      GROUP BY EXTRACT(DOW FROM date), EXTRACT(HOUR FROM created_at), type
      ORDER BY day_of_week, hour_of_day
    `;

    const result = await query(patternsQuery, [userId, startDate.toISOString().split('T')[0]]);

    // Process data
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const patterns = {
      byDayOfWeek: {},
      byHourOfDay: {},
      byType: { income: 0, expense: 0 }
    };

    // Initialize day of week data
    dayNames.forEach((day, index) => {
      patterns.byDayOfWeek[day] = { income: 0, expense: 0, count: 0 };
    });

    // Initialize hour of day data
    for (let hour = 0; hour < 24; hour++) {
      patterns.byHourOfDay[hour] = { income: 0, expense: 0, count: 0 };
    }

    result.rows.forEach(row => {
      const dayName = dayNames[parseInt(row.day_of_week)];
      const hour = parseInt(row.hour_of_day);
      const type = row.type;
      const count = parseInt(row.transaction_count);
      const total = parseFloat(row.total_amount);

      // Day of week patterns
      patterns.byDayOfWeek[dayName][type] += total;
      patterns.byDayOfWeek[dayName].count += count;

      // Hour of day patterns
      patterns.byHourOfDay[hour][type] += total;
      patterns.byHourOfDay[hour].count += count;

      // Type totals
      patterns.byType[type] += total;
    });

    res.json({
      success: true,
      data: {
        period,
        patterns
      }
    });

  } catch (error) {
    console.error('Get spending patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get budget analysis (comparing actual vs expected spending)
const getBudgetAnalysis = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.user_id || req.user.id : req.user.id;
    const { period = 'month' } = req.query;

    // For this demo, we'll calculate average spending per category as "budget"
    // In a real app, users would set their own budgets

    // Get current period spending
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get historical average for "budget" calculation
    const historicalStartDate = new Date(startDate);
    historicalStartDate.setFullYear(historicalStartDate.getFullYear() - 1);

    const budgetQuery = `
      WITH current_spending AS (
        SELECT 
          c.id,
          c.name,
          c.color,
          COALESCE(SUM(t.amount), 0) as current_amount
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id 
          AND t.user_id = $1 
          AND t.type = 'expense'
          AND t.date >= $2 
          AND t.date <= $3
        WHERE c.type = 'expense'
        GROUP BY c.id, c.name, c.color
      ),
      historical_average AS (
        SELECT 
          c.id,
          COALESCE(AVG(monthly_amount), 0) as avg_amount
        FROM categories c
        LEFT JOIN (
          SELECT 
            category_id,
            DATE_TRUNC('month', date) as month,
            SUM(amount) as monthly_amount
          FROM transactions
          WHERE user_id = $1 
            AND type = 'expense'
            AND date >= $4
          GROUP BY category_id, DATE_TRUNC('month', date)
        ) monthly ON c.id = monthly.category_id
        WHERE c.type = 'expense'
        GROUP BY c.id
      )
      SELECT 
        cs.id,
        cs.name,
        cs.color,
        cs.current_amount,
        ha.avg_amount as budget_amount,
        CASE 
          WHEN ha.avg_amount > 0 THEN ROUND((cs.current_amount * 100.0 / ha.avg_amount), 2)
          ELSE 0
        END as budget_percentage
      FROM current_spending cs
      JOIN historical_average ha ON cs.id = ha.id
      ORDER BY cs.current_amount DESC
    `;

    const result = await query(budgetQuery, [
      userId, 
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0],
      historicalStartDate.toISOString().split('T')[0]
    ]);

    const budgetAnalysis = result.rows.map(row => ({
      categoryId: row.id,
      categoryName: row.name,
      categoryColor: row.color,
      currentAmount: parseFloat(row.current_amount),
      budgetAmount: parseFloat(row.budget_amount),
      budgetPercentage: parseFloat(row.budget_percentage),
      status: parseFloat(row.budget_percentage) > 100 ? 'over' : 
              parseFloat(row.budget_percentage) > 80 ? 'warning' : 'good'
    }));

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        },
        budgetAnalysis
      }
    });

  } catch (error) {
    console.error('Get budget analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getMonthlyTrends,
  getSpendingPatterns,
  getBudgetAnalysis
};
