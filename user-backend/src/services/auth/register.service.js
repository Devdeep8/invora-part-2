import bcrypt from 'bcryptjs'
import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'
import config from '@/src/configs/app.config.js'
import { generateAccessToken, generateRefreshToken } from '@/src/helpers/auth.helper.js'
import prisma from '@/src/lib/prisma.js'

export default class RegisterService extends BaseService {
  validate() {
    const { email, password } = this.args
    const errors = []

    if (!email) errors.push({ field: 'email', message: 'Email is required' })
    if (!password || password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' })
    }

    if (errors.length > 0) throw AppError.validation(errors, this.traceId)
  }

  async run() {
    const { email, password } = this.args

    const hashedPassword = await bcrypt.hash(
      password,
      config.get('bcrypt.saltRounds')
    )

    const { user, profile } = await prisma.$transaction(async (tx) => {
      const existingEmail = await tx.user.findUnique({
        where: { email: email.toLowerCase() }
      })
      if (existingEmail) {
        throw new AppError(Errors.USER_EMAIL_EXISTS, { traceId: this.traceId })
      }

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          authProvider: 'LOCAL',
        },
      })

      return { user, profile }
    })

    const accessToken = generateAccessToken({ userId: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email })

    const { password: _, providerId: __, ...safeUser } = user

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    }
  }
}