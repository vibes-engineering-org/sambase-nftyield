import { YieldPool, UserPosition, PoolMetrics, RewardClaim } from '~/types'

const API_BASE = '/api'

export class YieldAPIService {
  static async getYieldPools(chainId?: number): Promise<YieldPool[]> {
    const url = new URL(`${API_BASE}/yield-pools`, window.location.origin)
    if (chainId) {
      url.searchParams.set('chainId', chainId.toString())
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch yield pools')
    }

    return response.json()
  }

  static async getPoolById(poolId: string): Promise<YieldPool> {
    const response = await fetch(`${API_BASE}/yield-pools/${poolId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch pool data')
    }

    return response.json()
  }

  static async getUserPositions(userAddress: string): Promise<UserPosition[]> {
    const response = await fetch(`${API_BASE}/user-positions/${userAddress}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user positions')
    }

    return response.json()
  }

  static async getPoolMetrics(poolId: string): Promise<PoolMetrics> {
    const response = await fetch(`${API_BASE}/pool-metrics/${poolId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch pool metrics')
    }

    return response.json()
  }

  static async claimRewards(poolId: string, userAddress: string): Promise<RewardClaim> {
    const response = await fetch(`${API_BASE}/claim-rewards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ poolId, userAddress }),
    })

    if (!response.ok) {
      throw new Error('Failed to claim rewards')
    }

    return response.json()
  }

  static async calculateYield(
    poolId: string,
    amount: string,
    timeInDays: number
  ): Promise<{
    expectedYield: string
    dailyYield: string
    apy: number
  }> {
    const response = await fetch(`${API_BASE}/yield-calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ poolId, amount, timeInDays }),
    })

    if (!response.ok) {
      throw new Error('Failed to calculate yield')
    }

    return response.json()
  }

  static async getPoolHistory(
    poolId: string,
    period: '24h' | '7d' | '30d' | '90d' = '7d'
  ) {
    const response = await fetch(`${API_BASE}/pool-history/${poolId}?period=${period}`)
    if (!response.ok) {
      throw new Error('Failed to fetch pool history')
    }

    return response.json()
  }
}