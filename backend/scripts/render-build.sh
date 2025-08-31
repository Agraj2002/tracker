#!/bin/bash

echo "🚀 Starting Render deployment build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗄️ Running database migrations..."
npm run migrate

echo "✅ Build completed successfully!"
