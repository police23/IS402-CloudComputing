const redis = require('../config/redis');

/**
 * Cache helper utilities for Redis
 * Usage: await cache.set(key, value, ttl)
 *        const value = await cache.get(key)
 *        await cache.del(key)
 */

class CacheHelper {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Parsed value or null if not found
   */
  static async get(key) {
    try {
      const value = await redis.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        // If not JSON, return as string
        return value;
      }
    } catch (err) {
      console.error(`Cache GET error for key ${key}:`, err);
      return null;
    }
  }

  /**
   * Set value to cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
   * @returns {Promise<boolean>} True if set successfully
   */
  static async set(key, value, ttl = 3600) {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl) {
        await redis.set(key, serialized, 'EX', ttl);
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (err) {
      console.error(`Cache SET error for key ${key}:`, err);
      return false;
    }
  }

  /**
   * Delete a cache key
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} True if deleted
   */
  static async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (err) {
      console.error(`Cache DEL error for key ${key}:`, err);
      return false;
    }
  }

  /**
   * Delete multiple cache keys
   * @param {string[]} keys - Array of cache keys to delete
   * @returns {Promise<boolean>} True if all deleted
   */
  static async delMany(keys) {
    try {
      if (keys.length === 0) return true;
      await redis.del(...keys);
      return true;
    } catch (err) {
      console.error(`Cache DEL MANY error:`, err);
      return false;
    }
  }

  /**
   * Clear all cache by pattern (careful with this!)
   * @param {string} pattern - Key pattern (e.g., 'books:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  static async clearPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      await redis.del(...keys);
      return keys.length;
    } catch (err) {
      console.error(`Cache CLEAR PATTERN error:`, err);
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  static async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (err) {
      console.error(`Cache EXISTS error for key ${key}:`, err);
      return false;
    }
  }

  /**
   * Get cache key with fallback to function if not cached
   * Useful pattern: const books = await cache.getOrSet('books', () => fetchBooks())
   * @param {string} key - Cache key
   * @param {Function} fn - Async function to call if cache miss
   * @param {number} ttl - TTL in seconds (default: 3600)
   * @returns {Promise<any>} Cached value or result from fn
   */
  static async getOrSet(key, fn, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        console.log(`Cache HIT: ${key}`);
        return cached;
      }

      // Cache miss: call function
      console.log(`Cache MISS: ${key}`);
      const value = await fn();

      // Store in cache
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl);
      }

      return value;
    } catch (err) {
      console.error(`Cache GET_OR_SET error for key ${key}:`, err);
      // Fallback: still call the function even if cache fails
      return await fn();
    }
  }

  /**
   * Increment a numeric cache value
   * @param {string} key - Cache key
   * @param {number} increment - Amount to increment (default: 1)
   * @returns {Promise<number>} New value
   */
  static async incr(key, increment = 1) {
    try {
      const result = await redis.incrBy(key, increment);
      return result;
    } catch (err) {
      console.error(`Cache INCR error for key ${key}:`, err);
      return null;
    }
  }

  /**
   * Get cache stats (for monitoring)
   * @returns {Promise<object>} Cache info
   */
  static async info() {
    try {
      const info = await redis.info();
      return info;
    } catch (err) {
      console.error(`Cache INFO error:`, err);
      return null;
    }
  }
}

module.exports = CacheHelper;
