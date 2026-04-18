export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // <--- FIX: use 'lax' for local dev
    path: '/',
    maxAge: 15 * 60 * 1000
  })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // <--- FIX: use 'lax' for local dev
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}