# Personal Finance Tracker - Backend API

A comprehensive RESTful API for managing personal finances with user authentication, role-based access control, transaction management, and analytics.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, User, Read-only)
  - Protected routes with middleware

- **Transaction Management**
  - CRUD operations for income/expense transactions
  - Category-based organization
  - Advanced filtering and search
  - Pagination support

- **Analytics & Reporting**
  - Dashboard analytics with spending overview
  - Monthly/yearly trends analysis
  - Category-wise breakdowns
  - Spending patterns and budget analysis

- **Security Features**
  - XSS protection
  - SQL injection prevention
  - Rate limiting
  - Input validation and sanitization
  - Security headers with Helmet

- **Performance Optimization**
  - Redis caching for frequently accessed data
  - Database query optimization
  - Compression middleware

- **API Documentation**
  - Comprehensive Swagger/OpenAPI documentation
  - Interactive API explorer

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, express-rate-limit, XSS protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=finance_tracker
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
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
   ```

4. **Database Setup**
   
   Create PostgreSQL database:
   ```sql
   CREATE DATABASE finance_tracker;
   ```

   Run migrations:
   ```bash
   npm run migrate
   ```

5. **Start Redis Server**
   ```bash
   redis-server
   ```

6. **Start the Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get specific transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get transaction summary

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)
- `GET /api/categories/stats` - Get category statistics

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/trends` - Monthly trends
- `GET /api/analytics/patterns` - Spending patterns
- `GET /api/analytics/budget` - Budget analysis

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - System statistics

## 👥 User Roles

### Admin
- Full access to all features
- User management capabilities
- Can view/edit any user's data
- Category management

### User
- Can manage their own transactions
- View their own analytics
- Limited to personal data

### Read-only
- Can only view their own transactions
- Can view their own analytics
- Cannot create, edit, or delete data

## 📊 Default Users

The migration creates default users for testing:

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@financetracker.com | admin123 |
| User | user@financetracker.com | user123 |
| Read-only | readonly@financetracker.com | readonly123 |

## 🔒 Security Features

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- Transaction endpoints: 100 requests per hour
- Analytics endpoints: 50 requests per hour
- General API: 1000 requests per hour

### Data Protection
- XSS sanitization on all inputs
- SQL injection prevention
- Input validation
- Secure HTTP headers
- JWT token expiration

### Access Control
- Role-based permissions
- Data ownership verification
- Protected routes

## 📈 Caching Strategy

### Redis Caching
- Analytics data: 15 minutes
- Category lists: 1 hour
- Transaction lists: 5 minutes
- Automatic cache invalidation on data updates

## 📚 API Documentation

Interactive API documentation is available at:
- Development: `http://localhost:5000/api-docs`
- Production: `https://your-domain.com/api-docs`

## 🧪 Testing

```bash
# Run tests
npm test

# Test with coverage
npm run test:coverage
```

## 📝 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm test           # Run tests
```

## 🗄️ Database Schema

### Users Table
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password (VARCHAR)
- name (VARCHAR)
- role (VARCHAR - admin/user/read-only)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Categories Table
- id (SERIAL PRIMARY KEY)
- name (VARCHAR UNIQUE)
- type (VARCHAR - income/expense)
- color (VARCHAR)
- created_at (TIMESTAMP)

### Transactions Table
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FOREIGN KEY)
- category_id (INTEGER FOREIGN KEY)
- amount (DECIMAL)
- description (TEXT)
- type (VARCHAR - income/expense)
- date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## 🚀 Deployment

### Render Deployment (Recommended)

Deploy to Render with one click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

#### Required Environment Variables for Render:
```env
NODE_ENV=production
DATABASE_URL=postgresql://[render-provided]
REDIS_URL=redis://[render-provided]
JWT_SECRET=[generate-secure-32-char-string]
JWT_EXPIRES_IN=7d
ENABLE_RATE_LIMIT=true
```

### Alternative: PM2 Deployment
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@financetracker.com or create an issue in the repository.
