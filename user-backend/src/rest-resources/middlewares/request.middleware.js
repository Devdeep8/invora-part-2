import logger from '@/src/lib/logger.js'

export function requestLogger(req, res, next) {
  if (req.path === '/health') return next()

  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    
    logger[level](`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    })
  })

  next()
}

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('X-Frame-Options', 'DENY')
  next()
}