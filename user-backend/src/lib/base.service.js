import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'
import prisma from '@/src/lib/prisma.js'

export class BaseService {
  constructor(args = {}, context = {}) {
    this.args = args
    this.context = context
    this.logger = context.logger
    this.traceId = context.traceId
    this.userId = context.userId
    this.user = context.user
  }

  static async execute(args = {}, context = {}) {
    const serviceName = this.name
    const startTime = Date.now()

    context.logger.info({ traceId: context.traceId, args: sanitizeArgs(args) }, `[${serviceName}] Started`)

    try {
      const instance = new this(args, context)

      if (typeof instance.validate === 'function') {
        instance.validate()
      }

      const result = await instance.run()

      context.logger.info({
        traceId: context.traceId,
        duration: `${Date.now() - startTime}ms`,
        result: sanitizeResult(result),
      }, `[${serviceName}] Completed`)

      return result

    } catch (error) {
      context.logger.error({
        traceId: context.traceId,
        duration: `${Date.now() - startTime}ms`,
        args: sanitizeArgs(args),
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      }, `[${serviceName}] Failed`)

      throw error instanceof AppError
        ? error
        : AppError.wrap(error, context.traceId)
    }
  }

  async run() {
    throw new AppError(Errors.INTERNAL_ERROR, {
      traceId: this.traceId,
      message: `run() not implemented in ${this.constructor.name}`,
    })
  }

  validate() {}

  async callService(ServiceClass, args = {}) {
    return ServiceClass.execute(args, this.context)
  }

  get db() {
    return prisma
  }
}

function sanitizeArgs(args) {
  const SENSITIVE = ['password', 'token', 'secret', 'accessToken', 'refreshToken', 'cardNumber']
  const result = { ...args }
  for (const key of SENSITIVE) {
    if (key in result) result[key] = '***'
  }
  return result
}

function sanitizeResult(result) {
  if (!result || typeof result !== 'object') return result
  const summary = {}
  for (const key of Object.keys(result)) {
    const val = result[key]
    if (['accessToken', 'refreshToken', 'password', 'secret'].includes(key)) {
      summary[key] = '***'
    } else if (val && typeof val === 'object' && 'id' in val) {
      summary[key] = { id: val.id }
    } else {
      summary[key] = val
    }
  }
  return summary
}

export default BaseService