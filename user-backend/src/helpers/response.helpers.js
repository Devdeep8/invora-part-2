

export const sendResponse = ({ res }, data, message = 'success') => {
  res.payload = {
    success: true,
    message: message, // no translation, direct message
    data,
    locale: 'en',
    timestamp: new Date().toISOString() // standard format
  }

  return res.json(res.payload)
}