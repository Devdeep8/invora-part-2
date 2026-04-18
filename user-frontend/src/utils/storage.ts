import Cookies from 'js-cookie'

export const storage = {
  getToken: () => Cookies.get('accessToken'),
  getRefreshToken: () => Cookies.get('refreshToken'),
  clearTokens: () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
  },
}
