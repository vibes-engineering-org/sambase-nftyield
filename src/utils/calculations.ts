export interface YieldCalculation {
  principal: number
  apy: number
  timeInDays: number
  compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'annually'
}

export interface YieldResult {
  totalValue: number
  interestEarned: number
  dailyYield: number
  monthlyYield: number
  yearlyYield: number
}

export const calculateYield = (params: YieldCalculation): YieldResult => {
  const { principal, apy, timeInDays, compoundFrequency } = params

  const annualRate = apy / 100
  const compoundsPerYear = getCompoundsPerYear(compoundFrequency)
  const timeInYears = timeInDays / 365

  const totalValue = principal * Math.pow(
    1 + annualRate / compoundsPerYear,
    compoundsPerYear * timeInYears
  )

  const interestEarned = totalValue - principal
  const dailyYield = (totalValue / timeInDays) - (principal / timeInDays)
  const monthlyYield = dailyYield * 30
  const yearlyYield = interestEarned * (365 / timeInDays)

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    interestEarned: Math.round(interestEarned * 100) / 100,
    dailyYield: Math.round(dailyYield * 100) / 100,
    monthlyYield: Math.round(monthlyYield * 100) / 100,
    yearlyYield: Math.round(yearlyYield * 100) / 100,
  }
}

const getCompoundsPerYear = (frequency: YieldCalculation['compoundFrequency']): number => {
  switch (frequency) {
    case 'daily':
      return 365
    case 'weekly':
      return 52
    case 'monthly':
      return 12
    case 'annually':
      return 1
    default:
      return 365
  }
}

export const calculateAPY = (
  totalReturn: number,
  principal: number,
  timeInDays: number
): number => {
  const timeInYears = timeInDays / 365
  const rate = (totalReturn / principal - 1) / timeInYears
  return Math.round(rate * 10000) / 100 // Return as percentage with 2 decimal places
}

export const calculateTVL = (amounts: number[]): number => {
  return amounts.reduce((sum, amount) => sum + amount, 0)
}

export const calculatePortfolioValue = (
  positions: { amount: number; price: number }[]
): number => {
  return positions.reduce((total, position) => {
    return total + (position.amount * position.price)
  }, 0)
}