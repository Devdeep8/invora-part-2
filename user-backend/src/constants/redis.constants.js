export const REDIS_KEYS = {
  USER_SESSION: (userId) => `auth:session:${userId}`,
  USER_REFRESH_TOKEN: (userId) => `auth:refresh:${userId}`
}