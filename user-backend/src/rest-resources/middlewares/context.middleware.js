// context.middleware.js

import { v4 as uuid } from 'uuid'
import logger from '@/src/lib/logger.js'

export function contextMiddleware() {
  return (req, res, next) => {
    const traceId = req.headers['x-trace-id'] || uuid()
    const contextLogger = logger.child({ traceId })

    req.context = {
      traceId,
      logger: contextLogger,
      req,
      res,
      userId: null,
      user: null,
    }

    res.setHeader('x-trace-id', traceId)
    next()
  }
}