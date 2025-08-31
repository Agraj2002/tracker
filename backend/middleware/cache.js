const { getCache, setCache, deleteCache, deleteCachePattern } = require('../config/redis');

// Generic cache middleware
const cacheMiddleware = (keyGenerator, expiration = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey = keyGenerator(req);
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache hit for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache miss for key: ${cacheKey}`);
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.success !== false) {
          setCache(cacheKey, data, expiration).catch(err => {
            console.error('Failed to cache data:', err);
          });
        }
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without caching if error occurs
    }
  };
};

// Cache key generators
const analyticsKeyGenerator = (req) => {
  const { id: userId } = req.user;
  const { period = 'month' } = req.query;
  return `analytics:${userId}:${period}`;
};

const transactionsKeyGenerator = (req) => {
  const { id: userId } = req.user;
  const { page = 1, limit = 10, category, type, search } = req.query;
  return `transactions:${userId}:${page}:${limit}:${category || 'all'}:${type || 'all'}:${search || 'none'}`;
};

const categoriesKeyGenerator = (req) => {
  return 'categories:all';
};

const userAnalyticsKeyGenerator = (req) => {
  const { id: userId } = req.user;
  return `user_analytics:${userId}`;
};

// Specific cache middleware for different endpoints
const cacheAnalytics = cacheMiddleware(analyticsKeyGenerator, 15 * 60); // 15 minutes
const cacheTransactions = cacheMiddleware(transactionsKeyGenerator, 5 * 60); // 5 minutes
const cacheCategories = cacheMiddleware(categoriesKeyGenerator, 60 * 60); // 1 hour
const cacheUserAnalytics = cacheMiddleware(userAnalyticsKeyGenerator, 15 * 60); // 15 minutes

// Cache invalidation helpers
const invalidateUserCache = async (userId) => {
  try {
    await deleteCachePattern(`analytics:${userId}:*`);
    await deleteCachePattern(`transactions:${userId}:*`);
    await deleteCachePattern(`user_analytics:${userId}*`);
    console.log(`✅ Invalidated cache for user: ${userId}`);
  } catch (error) {
    console.error('Failed to invalidate user cache:', error);
  }
};

const invalidateCategoriesCache = async () => {
  try {
    await deleteCache('categories:all');
    console.log('✅ Invalidated categories cache');
  } catch (error) {
    console.error('Failed to invalidate categories cache:', error);
  }
};

const invalidateAllUserCaches = async () => {
  try {
    await deleteCachePattern('analytics:*');
    await deleteCachePattern('transactions:*');
    await deleteCachePattern('user_analytics:*');
    console.log('✅ Invalidated all user caches');
  } catch (error) {
    console.error('Failed to invalidate all user caches:', error);
  }
};

// Middleware to invalidate cache after data modifications
const invalidateCacheAfterModification = (invalidationFunction) => {
  return async (req, res, next) => {
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to invalidate cache after successful response
    res.json = async function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && data.success !== false) {
        try {
          await invalidationFunction(req);
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

// Specific cache invalidation middleware
const invalidateUserCacheAfterTransaction = invalidateCacheAfterModification(
  async (req) => await invalidateUserCache(req.user.id)
);

const invalidateCategoriesCacheAfterModification = invalidateCacheAfterModification(
  async () => await invalidateCategoriesCache()
);

module.exports = {
  cacheMiddleware,
  cacheAnalytics,
  cacheTransactions,
  cacheCategories,
  cacheUserAnalytics,
  invalidateUserCache,
  invalidateCategoriesCache,
  invalidateAllUserCaches,
  invalidateUserCacheAfterTransaction,
  invalidateCategoriesCacheAfterModification
};
