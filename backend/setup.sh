#!/bin/bash

# Personal Finance Tracker Backend Setup Script

echo "🚀 Setting up Personal Finance Tracker Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher."
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is not installed. Please install Redis v6 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting
ENABLE_RATE_LIMIT=true

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOL
    echo "⚠️  Please update the database password in .env file"
else
    echo "✅ .env file already exists"
fi

# Create database
echo "🗄️  Setting up database..."
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "Enter PostgreSQL password: " DB_PASSWORD
echo

createdb -U $DB_USER finance_tracker 2>/dev/null && echo "✅ Database created successfully" || echo "⚠️  Database might already exist"

# Update .env with actual credentials
sed -i "s/DB_USER=postgres/DB_USER=$DB_USER/" .env
sed -i "s/DB_PASSWORD=your_password/DB_PASSWORD=$DB_PASSWORD/" .env

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Default demo users created:"
echo "  Admin: admin@financetracker.com / admin123"
echo "  User: user@financetracker.com / user123"
echo "  Read-only: readonly@financetracker.com / readonly123"
echo ""
echo "To start the server:"
echo "  npm run dev"
echo ""
echo "API Documentation will be available at:"
echo "  http://localhost:5000/api-docs"
echo ""
echo "Health check:"
echo "  http://localhost:5000/health"
echo ""
