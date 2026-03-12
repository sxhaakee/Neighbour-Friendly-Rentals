export function rateLimit(options: { interval: number; uniqueTokenPerInterval: number }) {
  const tokenCache = new Map<string, number[]>();
  let lastInterval = Date.now();

  return {
    check: (limit: number, token: string) => {
      const now = Date.now();
      
      // Clear cache if interval has passed
      if (now - lastInterval > options.interval) {
        tokenCache.clear();
        lastInterval = now;
      }

      // Evict or block if cache is too large and the token isn't in it
      if (tokenCache.size >= options.uniqueTokenPerInterval && !tokenCache.has(token)) {
        return { isRateLimited: true, currentUsage: 0 };
      }

      const tokenCount = tokenCache.get(token) || [0];
      
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;

      return {
        isRateLimited,
        currentUsage,
      };
    },
  };
}
