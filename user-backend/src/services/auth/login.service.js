import bcrypt from 'bcryptjs'
import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'
import { generateAccessToken, generateRefreshToken } from '@/src/helpers/auth.helper.js'

export default class LoginService extends BaseService {
  validate() {
    const { email, password } = this.args
    const errors = []

    if (!email) errors.push({ field: 'email', message: 'Email is required' })
    if (!password) errors.push({ field: 'password', message: 'Password is required' })

    if (errors.length > 0) throw AppError.validation(errors, this.traceId)
  }

  async run() {
    const { email, password } = this.args
    const db = this.db

    // 1. Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      throw new AppError(Errors.AUTH_INVALID_CREDENTIALS, { traceId: this.traceId })
    }

    // 2. Check account is active
    if (!user.isActive) {
      throw new AppError(Errors.USER_ACCOUNT_LOCKED, { traceId: this.traceId })
    }

    if (user.authProvider !== 'LOCAL') {
      throw new AppError(Errors.AUTH_INVALID_CREDENTIALS, { traceId: this.traceId })
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError(Errors.AUTH_INVALID_CREDENTIALS, { traceId: this.traceId })
    }

    // 5. Generate tokens
    const payload = { userId: user.id, email: user.email }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // 6. Safe response
    const { password: _, providerId: __, ...safeUser } = user


    return {
      user: safeUser,
      accessToken,
      refreshToken,
    }
  }
}