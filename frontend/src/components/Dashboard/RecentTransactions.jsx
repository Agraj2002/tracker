import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash } from 'react-icons/fa';
import moment from 'moment';

const RecentTransactions = ({ transactions, onEdit, onDelete }) => {
  const { formatCurrency, formatDate } = useTheme();
  const { canPerformAction } = useAuth();

  // Memoized transaction data for performance
  const processedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions
      .slice(0, 5) // Show only 5 most recent
      .map(transaction => ({
        ...transaction,
        formattedDate: formatDate(transaction.date),
        formattedAmount: formatCurrency(Math.abs(transaction.amount)),
        isIncome: transaction.type === 'income' || transaction.amount > 0
      }));
  }, [transactions, formatDate, formatCurrency]);

  // Get category icon based on category name
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food': '🍔',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Bills': '📄',
      'Health': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Salary': '💰',
      'Freelance': '💼',
      'Investment': '📈',
      'Other': '📝'
    };
    
    return iconMap[category] || '📝';
  };

  if (!processedTransactions.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📝</div>
        <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Add your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {processedTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {/* Transaction Info */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Category Icon */}
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
              {getCategoryIcon(transaction.category)}
            </div>
            
            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {transaction.description || transaction.title || 'No description'}
                </p>
                {transaction.isIncome ? (
                  <FaArrowUp className="w-3 h-3 text-green-500" />
                ) : (
                  <FaArrowDown className="w-3 h-3 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.category}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.formattedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Amount and Actions */}
          <div className="flex items-center space-x-4">
            {/* Amount */}
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                transaction.isIncome 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {transaction.isIncome ? '+' : '-'}{transaction.formattedAmount}
              </p>
            </div>

            {/* Action Buttons - Only for users who can perform actions */}
            {canPerformAction('update') && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit && onEdit(transaction)}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit transaction"
                >
                  <FaEdit className="w-3 h-3" />
                </button>
                
                {canPerformAction('delete') && (
                  <button
                    onClick={() => onDelete && onDelete(transaction)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete transaction"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* View All Link */}
      <div className="text-center pt-4">
        <button
          onClick={() => window.location.href = '/transactions'}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View all transactions →
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;
