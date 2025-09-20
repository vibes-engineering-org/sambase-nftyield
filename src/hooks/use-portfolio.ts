import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { Portfolio, UserPortfolioPosition, NFTHolding, Transaction } from '~/types'
import { calculatePortfolioValue } from '~/utils/calculations'
import { formatCurrency } from '~/utils/format'

export const usePortfolio = () => {
  const { address, isConnected } = useAccount()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolioData = useCallback(async () => {
    if (!address || !isConnected) {
      setPortfolio(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would fetch from your backend API
      // For now, we'll use placeholder data
      const mockPositions: UserPortfolioPosition[] = [
        {
          poolId: 'base-usdc-pool',
          poolName: 'USDC Yield Pool',
          amount: '5000',
          currentValue: '5213.45',
          yieldEarned: '213.45',
          depositedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          apy: 8.5,
          isLocked: false,
        },
        {
          poolId: 'eth-staking-pool',
          poolName: 'ETH Liquid Staking',
          amount: '2.5',
          currentValue: '6250',
          yieldEarned: '125',
          depositedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          apy: 4.2,
          isLocked: false,
        },
      ]

      const mockNFTs: NFTHolding[] = [
        {
          tokenId: '1',
          contractAddress: '0x742d35Cc6634C0532925a3b8D7a28B51e5f89f80',
          chainId: 8453,
          name: 'NFTYield Genesis #1',
          image: '/nft-placeholder.png',
          floorPrice: '0.1',
          acquiredAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          yieldGenerated: '50.25',
        },
      ]

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'deposit',
          amount: '5000',
          token: 'USDC',
          poolId: 'base-usdc-pool',
          transactionHash: '0x123...',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
        },
      ]

      const totalValue = calculatePortfolioValue([
        ...mockPositions.map(p => ({ amount: parseFloat(p.currentValue), price: 1 })),
        ...mockNFTs.map(n => ({ amount: 1, price: parseFloat(n.floorPrice || '0') * 2500 })),
      ])

      const totalYield = mockPositions.reduce((sum, position) => {
        return sum + parseFloat(position.yieldEarned)
      }, 0) + mockNFTs.reduce((sum, nft) => {
        return sum + parseFloat(nft.yieldGenerated || '0')
      }, 0)

      const portfolioData: Portfolio = {
        totalValue: totalValue.toString(),
        totalYield: totalYield.toString(),
        positions: mockPositions,
        nfts: mockNFTs,
        transactions: mockTransactions,
      }

      setPortfolio(portfolioData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data')
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  const refreshPortfolio = useCallback(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  // Computed values
  const portfolioStats = useMemo(() => {
    if (!portfolio) return null

    const totalValue = parseFloat(portfolio.totalValue)
    const totalYield = parseFloat(portfolio.totalYield)
    const yieldPercentage = totalValue > 0 ? (totalYield / (totalValue - totalYield)) * 100 : 0

    return {
      totalValue: formatCurrency(totalValue),
      totalYield: formatCurrency(totalYield),
      yieldPercentage: yieldPercentage.toFixed(2) + '%',
      activePositions: portfolio.positions.length,
      nftCount: portfolio.nfts.length,
      recentTransactions: portfolio.transactions.slice(0, 5),
    }
  }, [portfolio])

  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  return {
    portfolio,
    portfolioStats,
    loading,
    error,
    refreshPortfolio,
    isConnected,
  }
}