export const formatCurrency = (
  value: string | number,
  currency: string = 'USD',
  decimals: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return '0'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue)
}

export const formatNumber = (
  value: string | number,
  decimals: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return '0'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue)
}

export const formatPercentage = (
  value: string | number,
  decimals: number = 1
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return '0%'

  return `${formatNumber(numValue, decimals)}%`
}

export const formatTokenAmount = (
  value: string | number,
  decimals: number = 18,
  displayDecimals: number = 4
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return '0'

  const formatted = numValue / Math.pow(10, decimals)
  return formatNumber(formatted, displayDecimals)
}

export const truncateAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return past.toLocaleDateString()
}