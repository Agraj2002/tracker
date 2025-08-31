import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../utils/apiPath';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TransactionList from '../../components/Transactions/TransactionList';
import TransactionFilters from '../../components/Transactions/TransactionFilters';
import TransactionModal from '../../components/Transactions/TransactionModal';
import ExportModal from '../../components/Transactions/ExportModal';
import toast from 'react-hot-toast';
import { FaPlus, FaDownload, FaSync } from 'react-icons/fa';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { user, canPerformAction } = useAuth();
  const { formatCurrency } = useTheme();

  // Fetch transactions with useCallback for optimization
  const fetchTransactions = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: resetPage ? 1 : pagination.page,
        limit: pagination.limit
      };
      
      const response = await apiService.transactions.getAll(params);
      setTransactions(response.data.transactions || []);
      setPagination(prev => ({
        ...prev,
        page: resetPage ? 1 : prev.page,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiService.categories.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch transactions when filters or pagination change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle filter changes with useCallback
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle pagination change
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Handle transaction creation/update
  const handleSaveTransaction = useCallback(async (transactionData) => {
    try {
      if (selectedTransaction) {
        // Update existing transaction
        await apiService.transactions.update(selectedTransaction.id, transactionData);
        toast.success('Transaction updated successfully');
      } else {
        // Create new transaction
        await apiService.transactions.create(transactionData);
        toast.success('Transaction created successfully');
      }
      
      setShowModal(false);
      setSelectedTransaction(null);
      fetchTransactions(true); // Reset to first page
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    }
  }, [selectedTransaction, fetchTransactions]);

  // Handle transaction deletion
  const handleDeleteTransaction = useCallback(async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await apiService.transactions.delete(transactionId);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  }, [fetchTransactions]);

  // Handle transaction editing
  const handleEditTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  }, []);

  // Handle export
  const handleExport = useCallback(async (format) => {
    try {
      const response = await apiService.transactions.export(format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  }, []);

  // Memoized summary stats for performance
  const summaryStats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      total: transactions.length
    };
  }, [transactions]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transactions
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your income and expense transactions
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => fetchTransactions(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FaSync className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FaDownload className="w-4 h-4 mr-2" />
              Export
            </button>
            
            {canPerformAction('create') && (
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center px-3 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Transaction
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryStats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summaryStats.income)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(summaryStats.expenses)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
            <p className={`text-xl font-bold ${summaryStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summaryStats.balance)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
        />

        {/* Transaction List */}
        {loading ? (
          <LoadingSpinner size="large" message="Loading transactions..." />
        ) : (
          <TransactionList
            transactions={transactions}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            canEdit={canPerformAction('update')}
            canDelete={canPerformAction('delete')}
          />
        )}

        {/* Transaction Modal */}
        {showModal && (
          <TransactionModal
            transaction={selectedTransaction}
            categories={categories}
            onSave={handleSaveTransaction}
            onClose={() => {
              setShowModal(false);
              setSelectedTransaction(null);
            }}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            onExport={handleExport}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
