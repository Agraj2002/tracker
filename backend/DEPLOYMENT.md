# Deployment Guide - Render Platform

This guide walks you through deploying the Personal Finance Tracker API on Render with PostgreSQL and Redis.

## 🚀 Quick Deploy to Render

### Option 1: One-Click Deploy (Recommended)

1. **Fork this repository** to your GitHub account

2. **Click the Deploy Button** (if available):
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

3. **Configure Services** in Render Dashboard:
   - The `render.yaml` file will automatically configure all services
   - PostgreSQL database (free tier)
   - Redis instance (free tier)
   - Web service for the API

### Option 2: Manual Setup

#### Step 1: Create Render Account
1. Sign up at [render.com](https://render.com)
2. Connect your GitHub account

#### Step 2: Create PostgreSQL Database
1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configure:
   - **Name**: `finance-tracker-db`
   - **Database**: `finance_tracker`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free
3. Click **Create Database**
4. **Save the connection details** (you'll need DATABASE_URL)

#### Step 3: Create Redis Instance
1. Go to Render Dashboard → **New** → **Redis**
2. Configure:
   - **Name**: `finance-tracker-redis`
   - **Plan**: Free
   - **Region**: Same as your database
3. Click **Create Redis**
4. **Save the Redis URL**

#### Step 4: Deploy Web Service
1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finance-tracker-api`
   - **Environment**: `Node`
   - **Region**: Same as database/Redis
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run migrate`
   - **Start Command**: `npm start`

#### Step 5: Environment Variables
Add these environment variables in the Render dashboard:

```bash
# Required
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL connection string from Step 2]
REDIS_URL=[Your Redis URL from Step 3]
JWT_SECRET=[Generate a secure random string - use: openssl rand -hex 32]

# Optional (with defaults)
JWT_EXPIRES_IN=7d
ENABLE_RATE_LIMIT=true
PORT=10000
```

## 🔗 Getting Your URLs

After deployment, you'll have:

- **API Base URL**: `https://your-service-name.onrender.com`
- **API Documentation**: `https://your-service-name.onrender.com/api-docs`
- **Health Check**: `https://your-service-name.onrender.com/health`

## 📋 Demo Credentials

The migration script automatically creates demo users:

| Role | Email | Password |
|------|--------|----------|
| **Admin** | admin@financetracker.com | admin123 |
| **User** | user@financetracker.com | user123 |
| **Read-only** | readonly@financetracker.com | readonly123 |

## ⚙️ Environment Variables Reference

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Render)
- `REDIS_URL` - Redis connection string (auto-provided by Render)
- `JWT_SECRET` - Secret key for JWT tokens (generate with: `openssl rand -hex 32`)

### Optional Variables
- `NODE_ENV` - Set to `production`
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `ENABLE_RATE_LIMIT` - Enable API rate limiting (default: true)
- `PORT` - Server port (Render auto-assigns)

## 🔧 Custom Domain (Optional)

1. Go to your web service in Render Dashboard
2. Click **Settings** → **Custom Domains**
3. Add your domain and configure DNS
4. Update `FRONTEND_URL` environment variable

## 📊 Monitoring & Logs

### View Logs
1. Go to your web service in Render Dashboard
2. Click **Logs** tab to view real-time logs

### Monitor Performance
1. Check **Metrics** tab for:
   - CPU usage
   - Memory usage
   - Request volume
   - Response times

## 🔄 Automatic Deployments

Render automatically deploys when you push to your main branch:

1. **Push changes** to GitHub
2. **Render detects** the push
3. **Builds and deploys** automatically
4. **Zero downtime** deployment

## 🚨 Troubleshooting

### Common Issues

1. **Migration Fails**
   ```bash
   # Check DATABASE_URL is correctly set
   # Ensure PostgreSQL service is running
   ```

2. **Redis Connection Error**
   ```bash
   # Verify REDIS_URL environment variable
   # Check Redis service status
   ```

3. **JWT Errors**
   ```bash
   # Ensure JWT_SECRET is set and sufficiently random
   # Check JWT_EXPIRES_IN format (e.g., "7d", "24h")
   ```

4. **CORS Issues**
   ```bash
   # Update FRONTEND_URL to match your frontend domain
   ```

### Debugging Steps

1. **Check Logs**:
   - Go to Render Dashboard → Your Service → Logs

2. **Verify Environment Variables**:
   - Dashboard → Your Service → Environment

3. **Test Database Connection**:
   - Use `/health` endpoint to check services

4. **API Testing**:
   - Use `/api-docs` for interactive testing

## 🔐 Security Considerations

### Production Security Checklist

- ✅ Use strong JWT_SECRET (32+ random characters)
- ✅ Enable rate limiting
- ✅ Use HTTPS (auto-enabled on Render)
- ✅ Validate all environment variables
- ✅ Monitor API usage and logs
- ✅ Regular security updates

### Database Security
- ✅ Use connection strings (never expose credentials)
- ✅ Enable SSL connections
- ✅ Regular backups (Render handles this)

## 💰 Cost Optimization

### Free Tier Limits
- **Web Service**: 750 hours/month (free)
- **PostgreSQL**: 1GB storage (free)
- **Redis**: 25MB storage (free)

### Scaling Options
- **Paid Plans**: For production workloads
- **Auto-scaling**: Available on paid plans
- **Database Scaling**: Upgrade storage/performance

## 📞 Support

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

### Application Support
- Check `/health` endpoint for service status
- Review logs in Render Dashboard
- Use `/api-docs` for API reference

## 🔄 Updates & Maintenance

### Regular Updates
1. **Dependencies**: `npm audit` and update packages
2. **Database**: Monitor PostgreSQL performance
3. **Logs**: Regular log review for errors
4. **Security**: Keep all packages updated

### Backup Strategy
- **Database**: Render automatically backs up PostgreSQL
- **Code**: Git repository serves as code backup
- **Environment**: Document all environment variables

## 📈 Performance Tips

1. **Caching**: Redis is configured for optimal performance
2. **Database**: Use indexes for frequently queried fields
3. **API**: Monitor response times in Render dashboard
4. **Rate Limiting**: Properly configured to prevent abuse

---

**🎉 Your Personal Finance Tracker API is now deployed on Render!**

Visit your API documentation at: `https://your-service-name.onrender.com/api-docs`
