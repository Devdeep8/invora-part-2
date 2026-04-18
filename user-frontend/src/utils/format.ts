export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date))

export const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + '…' : str

export const slugify = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
