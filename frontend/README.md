# Personal Finance Tracker - Frontend

A modern React-based frontend application for managing personal finances with role-based access control, real-time analytics, and responsive design.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
  - **Admin**: Full access to all features including user management
  - **User**: Can manage their own transactions and view analytics
  - **Read-only**: Can only view transactions and analytics (no CRUD operations)
- Protected routes with automatic redirects
- Session management with token refresh

### Transaction Management
- Add, edit, delete income/expense transactions (admin and user only)
- Transaction categorization with predefined categories
- Advanced search and filtering capabilities
- Date range filtering
- Real-time transaction validation
- Export functionality (CSV, Excel, PDF)

### Analytics Dashboard
- Monthly/yearly spending overview with interactive charts
- Category-wise expense breakdown (Pie chart)
- Income vs Expense trends (Bar chart)
- Monthly financial trends (Line chart)
- Real-time statistics and KPIs
- Responsive chart design with dark mode support

### Performance Features
- **Lazy Loading**: Route-based code splitting with React.lazy()
- **Optimization**: useCallback and useMemo for performance
- **Caching**: Client-side data caching for improved UX
- **Pagination**: Efficient data loading for large transaction lists
- **Virtual Scrolling**: Handles large datasets efficiently

### UI/UX Features
- Modern, responsive design with Tailwind CSS
- Dark/Light theme support with system preference detection
- Mobile-first responsive layout
- Loading states and error handling
- Toast notifications for user feedback
- Accessibility features

## 🛠 Tech Stack

- **React 18+** - Latest React with concurrent features
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Modern charting library
- **React Hot Toast** - Notification system
- **Axios** - HTTP client with interceptors
- **Moment.js** - Date manipulation
- **React Icons** - Icon library
- **Vite** - Fast build tool and dev server

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (LoadingSpinner, ErrorBoundary)
│   ├── layouts/        # Layout components (AuthLayout, DashboardLayout)
│   ├── Charts/         # Chart components (IncomeExpenseChart, CategoryPieChart)
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Inputs/         # Form input components
│   └── Transactions/   # Transaction-related components
├── context/            # React Context for state management
│   ├── AuthContext.jsx    # Authentication state
│   ├── ThemeContext.jsx   # Theme and preferences
│   └── AppContext.jsx     # Combined providers
├── pages/              # Page components
│   ├── Auth/           # Authentication pages
│   ├── Dashboard/      # Dashboard pages
│   ├── Transactions/   # Transaction management
│   ├── Analytics/      # Analytics and reports
│   ├── Profile/        # User profile
│   ├── Settings/       # App settings
│   ├── Admin/          # Admin panel
│   └── Error/          # Error pages (404, Unauthorized)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and API services
└── assets/             # Static assets
```

## 🔐 Role-Based Access Control

### Admin Role
- Full access to all features
- User management capabilities
- System statistics and monitoring
- Can perform all CRUD operations

### User Role
- Manage own transactions (create, read, update, delete)
- View personal analytics and dashboards
- Export personal data
- Profile and settings management

### Read-Only Role
- View transactions (no modifications)
- Access to analytics and dashboards
- Limited settings access
- No create/update/delete permissions

## 📊 Charts and Analytics

### Chart Types Implemented
1. **Bar Chart** - Income vs Expenses comparison
2. **Pie Chart** - Category-wise expense breakdown
3. **Line Chart** - Monthly trends and patterns

### Analytics Features
- Real-time data visualization
- Interactive tooltips and legends
- Responsive design for mobile devices
- Dark mode support for all charts
- Custom color schemes per theme

## 🎨 Theme System

### Dark/Light Mode
- System preference detection
- Manual theme toggle
- Persistent theme storage
- Smooth transitions between themes

### Customization
- Currency format support (USD, EUR, GBP, INR)
- Date format preferences
- Language support structure

## 🔧 Performance Optimizations

### React Optimizations
- **useCallback**: Optimized event handlers and API calls
- **useMemo**: Expensive calculations and data transformations
- **React.memo**: Component memoization for pure components
- **useReducer**: Complex state management

### Code Splitting
- Route-based lazy loading
- Component-level code splitting
- Dynamic imports for heavy libraries

### API Optimizations
- Request debouncing for search
- Response caching with TTL
- Optimistic updates for better UX
- Error boundary implementation

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running on localhost:5000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

### Demo Credentials

The application includes demo credentials for testing:

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123  
- **Read-Only**: readonly@example.com / readonly123

## 🧪 Testing

### Testing Strategy
- Component unit tests
- Integration tests for critical flows
- E2E tests for user journeys
- API integration tests

### Test Commands
```bash
npm run test           # Run unit tests
npm run test:coverage  # Run with coverage
npm run e2e           # Run E2E tests
```

## 📱 Responsive Design

### Breakpoints
- Mobile: 0-640px
- Tablet: 641-1024px
- Desktop: 1025px+

### Features
- Mobile-first design approach
- Touch-friendly interface elements
- Optimized navigation for small screens
- Responsive charts and tables

## 🔒 Security Features

### Frontend Security
- XSS protection through React's built-in sanitization
- CSRF protection with token validation
- Secure token storage practices
- Input validation and sanitization
- Protected route implementation

### API Security
- JWT token-based authentication
- Automatic token refresh
- Request interceptors for auth headers
- Error handling for unauthorized access

## 📈 Monitoring & Analytics

### Performance Monitoring
- Bundle size optimization
- Load time tracking
- User interaction metrics
- Error tracking and reporting

### User Analytics
- Feature usage statistics
- User journey tracking
- Performance bottleneck identification

## 🚀 Deployment

### Build Optimization
- Code splitting and lazy loading
- Asset optimization
- Bundle size analysis
- Progressive Web App features

### Environment Configuration
- Development, staging, and production builds
- Environment-specific API endpoints
- Feature flag management

## 🤝 Contributing

### Development Guidelines
- Follow React best practices
- Use TypeScript for new components
- Implement proper error boundaries
- Write comprehensive tests
- Follow accessibility guidelines

### Code Style
- ESLint and Prettier configuration
- Consistent naming conventions
- Component composition patterns
- Custom hooks for reusable logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Test with demo credentials
- Verify API connectivity

---

**Note**: This frontend application is designed to work with the Personal Finance Tracker backend API. Ensure the backend is running and accessible before starting the frontend development server.