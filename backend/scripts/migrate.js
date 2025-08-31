const { query } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🚀 Starting database migration...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'read-only')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        color VARCHAR(7) DEFAULT '#6366f1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id),
        amount DECIMAL(12, 2) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);

    // Insert default categories
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'income', color: '#10b981' },
      { name: 'Freelance', type: 'income', color: '#059669' },
      { name: 'Investment', type: 'income', color: '#047857' },
      { name: 'Other Income', type: 'income', color: '#065f46' },
      
      // Expense categories
      { name: 'Food & Dining', type: 'expense', color: '#ef4444' },
      { name: 'Transportation', type: 'expense', color: '#f97316' },
      { name: 'Shopping', type: 'expense', color: '#eab308' },
      { name: 'Entertainment', type: 'expense', color: '#8b5cf6' },
      { name: 'Bills & Utilities', type: 'expense', color: '#06b6d4' },
      { name: 'Healthcare', type: 'expense', color: '#ec4899' },
      { name: 'Education', type: 'expense', color: '#3b82f6' },
      { name: 'Other Expenses', type: 'expense', color: '#6b7280' }
    ];

    for (const category of defaultCategories) {
      await query(`
        INSERT INTO categories (name, type, color) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.type, category.color]);
    }

    // Create default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await query(`
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@financetracker.com', adminPassword, 'Admin User', 'admin']);

    // Create default regular user (password: user123)
    const userPassword = await bcrypt.hash('user123', 12);
    
    await query(`
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['user@financetracker.com', userPassword, 'Regular User', 'user']);

    // Create default read-only user (password: readonly123)
    const readOnlyPassword = await bcrypt.hash('readonly123', 12);
    
    await query(`
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['readonly@financetracker.com', readOnlyPassword, 'Read Only User', 'read-only']);

    console.log('✅ Database migration completed successfully!');
    console.log('📋 Default users created:');
    console.log('   Admin: admin@financetracker.com / admin123');
    console.log('   User: user@financetracker.com / user123');
    console.log('   Read-only: readonly@financetracker.com / readonly123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

createTables();
