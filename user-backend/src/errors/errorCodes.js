export const Errors = {
  // Generic
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    httpStatus: 500,
    message: 'Internal server error',
    isCritical: true,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    httpStatus: 404,
    message: 'Resource not found',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    httpStatus: 400,
    message: 'Validation failed',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    httpStatus: 401,
    message: 'Authentication required',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    httpStatus: 403,
    message: 'Access denied',
  },
  CONFLICT: {
    code: 'CONFLICT',
    httpStatus: 409,
    message: 'Resource conflict',
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    httpStatus: 400,
    message: 'Bad request',
  },

  // Auth
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    httpStatus: 401,
    message: 'Invalid email or password',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    httpStatus: 401,
    message: 'Token expired',
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_TOKEN_INVALID',
    httpStatus: 401,
    message: 'Invalid token',
  },
  AUTH_UNAUTHORIZED:{
    code: 'AUTH_UNAUTHORIZED',
    httpStatus: 401,
    message: 'Unauthorized',
  },


  // User
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    httpStatus: 404,
    message: 'User not found',
  },
  USER_EMAIL_EXISTS: {
    code: 'USER_EMAIL_EXISTS',
    httpStatus: 409,
    message: 'Email already registered',
  },
  USER_USERNAME_EXISTS: {
    code: 'USER_USERNAME_EXISTS',
    httpStatus: 409,
    message: 'Username already taken',
  },
  USER_ACCOUNT_LOCKED: {
    code: 'USER_ACCOUNT_LOCKED',
    httpStatus: 403,
    message: 'Account is locked',
  },
  BUSINESS_NAME_REQUIRED: {
    code: 'BUSINESS_NAME_REQUIRED',
    httpStatus: 400,
    message: 'Business name is required',
  },
  BUSINESS_NOT_FOUND: {
    code: 'BUSINESS_NOT_FOUND',
    httpStatus: 404,
    message: 'Business not found',
  },

  // Client
  CLIENT_NOT_FOUND: {
    code: 'CLIENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Client not found',
  },
  CLIENT_EMAIL_EXISTS: {
    code: 'CLIENT_EMAIL_EXISTS',
    httpStatus: 409,
    message: 'Client with this email already exists',
  },
  CLIENT_HAS_INVOICES: {
    code: 'CLIENT_HAS_INVOICES',
    httpStatus: 400,
    message: 'Cannot delete client with existing invoices',
  },

  // Invoice
  INVOICE_NOT_FOUND: {
    code: 'INVOICE_NOT_FOUND',
    httpStatus: 404,
    message: 'Invoice not found',
  },
  INVOICE_NOT_DRAFT: {
    code: 'INVOICE_NOT_DRAFT',
    httpStatus: 400,
    message: 'Can only modify draft invoices',
  },
  INVOICE_ALREADY_SENT: {
    code: 'INVOICE_ALREADY_SENT',
    httpStatus: 400,
    message: 'Invoice has already been sent',
  },
  INVALID_INVOICE_STATUS: {
    code: 'INVALID_INVOICE_STATUS',
    httpStatus: 400,
    message: 'Invalid invoice status',
  },
}