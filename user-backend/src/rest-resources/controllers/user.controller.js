import { sendResponse } from "../../helpers/response.helpers"
import RegisterService from "../../services/auth/register.service"
import LoginService from "../../services/auth/login.service"
import { setAuthCookies } from "@/src/helpers/cookie.helper.js"
import redis from "@/src/lib/redis.js"
import { REDIS_KEYS } from "@/src/constants/redis.constants.js"
import prisma from "@/src/lib/prisma.js"

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60

export default class UserController {
  static async register(req, res, next) {
    try {
      const result = await RegisterService.execute(req.body, req.context)
      
      // ✅ Save Refresh Token and User Session to Redis
      await redis.set(REDIS_KEYS.USER_REFRESH_TOKEN(result.user.id), result.refreshToken, 'EX', SEVEN_DAYS_IN_SECONDS)
      await redis.set(REDIS_KEYS.USER_SESSION(result.user.id), JSON.stringify(result.user), 'EX', SEVEN_DAYS_IN_SECONDS)
      
      setAuthCookies(res, { accessToken: result.accessToken, refreshToken: result.refreshToken })
      sendResponse({ req, res, next }, result)
    } catch (error) { next(error) }
  }

  static async login(req, res, next) {
    try {
      const result = await LoginService.execute(req.body, req.context)
      
      // ✅ Save Refresh Token and User Session to Redis
      await redis.set(REDIS_KEYS.USER_REFRESH_TOKEN(result.user.id), result.refreshToken, 'EX', SEVEN_DAYS_IN_SECONDS)
      await redis.set(REDIS_KEYS.USER_SESSION(result.user.id), JSON.stringify(result.user), 'EX', SEVEN_DAYS_IN_SECONDS)
      
      setAuthCookies(res, { accessToken: result.accessToken, refreshToken: result.refreshToken })
      sendResponse({ req, res, next }, result)
    } catch (error) { next(error) }
  }

  static async getMe(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.context.user.id },
        include: { business: true }
      });
      sendResponse({ req, res, next }, { user })
    } catch (error) { next(error) }
  }
}