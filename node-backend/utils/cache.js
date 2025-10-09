class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = null) {
    // Clear existing timer if key exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set TTL timer if provided
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  deletePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
      }
    }
  }
}

// Create a singleton instance
const cache = new MemoryCache();

module.exports = cache;
