// src/errors/prisma.error.js

import { AppError } from './app.error.js'
import { Errors } from './errorCodes.js'
export function handlePrismaError(error, traceId) {
  switch (error.code) {
    case 'P2002':
      return new AppError(Errors.CONFLICT, {
        message: 'Duplicate field value',
        traceId,
      })

    case 'P2025':
      return new AppError(Errors.NOT_FOUND, {
        message: 'Record not found',
        traceId,
      })

    default:
      return new AppError(Errors.INTERNAL_ERROR, {
        message: error.message,
        traceId,
      })
  }
}