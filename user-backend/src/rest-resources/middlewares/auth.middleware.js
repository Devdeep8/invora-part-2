import { AppError } from "@/src/errors/app.error.js";
import { Errors } from "@/src/errors/errorCodes.js";
import prisma from "../../lib/prisma";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/src/helpers/auth.helper.js";
import redis from "@/src/lib/redis.js";
import { REDIS_KEYS } from "@/src/constants/redis.constants.js";
import { setAuthCookies } from "@/src/helpers/cookie.helper.js";

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60

export function authMiddleware() {
  return async (req, res, next) => {
    try {
      req.context = req.context || {};

      let token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
      let decoded = null;

      // 1. Try to verify Access Token
      if (token) {
        try {
          decoded = verifyAccessToken(token);
        } catch (err) {
          decoded = null // Token expired or invalid, will try refresh below
        }
      }

      // 2. If Access Token is valid -> GET USER FROM REDIS (ZERO DB CALLS)
      if (decoded?.userId) {
        const cachedUser = await redis.get(REDIS_KEYS.USER_SESSION(decoded.userId));
        
        if (cachedUser) {
          const user = JSON.parse(cachedUser);
          if (user.isActive) {
            req.context.user = user;
            return next(); // ✅ Fast path complete, no database used!
          }
        }
      }

      // 3. If Access Token failed -> Use Refresh Token
      const incomingRefreshToken = req.cookies?.refreshToken;
      if (!incomingRefreshToken) {
        throw new AppError(Errors.AUTH_UNAUTHORIZED, { traceId: req.context?.traceId });
      }

      let refreshDecoded;
      try {
        refreshDecoded = verifyRefreshToken(incomingRefreshToken);
      } catch (err) {
        throw new AppError(Errors.AUTH_UNAUTHORIZED, { traceId: req.context?.traceId });
      }

      // 4. Check Redis if Refresh Token matches (Security Check)
      const redisKey = REDIS_KEYS.USER_REFRESH_TOKEN(refreshDecoded.userId);
      const storedRefreshToken = await redis.get(redisKey);

      if (storedRefreshToken !== incomingRefreshToken) {
        throw new AppError(Errors.AUTH_UNAUTHORIZED, { traceId: req.context?.traceId });
      }

      // 5. Refresh Token is valid! Fetch fresh user from DB (1 DB call per 7 days)
      const user = await prisma.user.findUnique({
        where: { id: refreshDecoded.userId },
        select: { id: true, email: true, username: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new AppError(Errors.AUTH_UNAUTHORIZED, { traceId: req.context?.traceId });
      }

      // 6. Generate NEW Tokens (Token Rotation)
      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
      const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      // 7. Update Redis with new tokens and fresh user data
      await redis.set(redisKey, newRefreshToken, 'EX', SEVEN_DAYS_IN_SECONDS);
      await redis.set(REDIS_KEYS.USER_SESSION(user.id), JSON.stringify(user), 'EX', SEVEN_DAYS_IN_SECONDS);

      // 8. Set new cookies on the response
      setAuthCookies(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });

      // 9. Inject user into context
      req.context.user = user;
      next();

    } catch (error) {
      next(error);
    }
  };
}