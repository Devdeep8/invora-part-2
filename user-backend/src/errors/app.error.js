import { Errors } from './errorCodes.js'

export class AppError extends Error {
  constructor(errorDef, options = {}) {
    super(options.message || errorDef.message)

    this.name = errorDef.code
    this.code = errorDef.code
    this.httpStatus = errorDef.httpStatus
    this.isCritical = errorDef.isCritical || false
    this.traceId = options.traceId || null
    this.details = options.details || null
    this.timestamp = new Date().toISOString()

    Error.captureStackTrace(this, this.constructor)
  }

  toResponse() {
    const response = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        timestamp: this.timestamp,
      },
    }

    if (this.traceId) response.error.traceId = this.traceId
    if (this.details?.length) response.error.details = this.details

    return response
  }

  static validation(details, traceId) {
    return new AppError(Errors.VALIDATION_ERROR, { details, traceId })
  }

  static wrap(error, traceId) {
    if (error instanceof AppError) return error
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new AppError(Errors.INTERNAL_ERROR, { message, traceId })
  }
}