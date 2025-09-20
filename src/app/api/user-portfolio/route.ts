import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')

    if (!userAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'User address is required',
        },
        { status: 400 }
      )
    }

    // In a real implementation, this would fetch actual user data from the database
    // For now, we'll return mock data
    const mockPortfolio = {
      userAddress,
      totalValue: '11463.45',
      totalYield: '338.45',
      positions: [
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
      ],
      nfts: [
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
      ],
      transactions: [
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
      ],
    }

    return NextResponse.json({
      success: true,
      data: mockPortfolio,
    })
  } catch (error) {
    console.error('Error fetching user portfolio:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user portfolio',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, action, poolId, amount, tokenId } = body

    if (!userAddress || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'User address and action are required',
        },
        { status: 400 }
      )
    }

    // Handle different portfolio actions
    let result = {}

    switch (action) {
      case 'deposit':
        if (!poolId || !amount) {
          return NextResponse.json(
            {
              success: false,
              error: 'Pool ID and amount are required for deposits',
            },
            { status: 400 }
          )
        }
        result = { transactionHash: '0xdeposit...', message: 'Deposit initiated' }
        break

      case 'withdraw':
        if (!poolId || !amount) {
          return NextResponse.json(
            {
              success: false,
              error: 'Pool ID and amount are required for withdrawals',
            },
            { status: 400 }
          )
        }
        result = { transactionHash: '0xwithdraw...', message: 'Withdrawal initiated' }
        break

      case 'claim_rewards':
        if (!poolId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Pool ID is required for claiming rewards',
            },
            { status: 400 }
          )
        }
        result = { transactionHash: '0xclaim...', amount: '25.50', message: 'Rewards claimed' }
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error updating user portfolio:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user portfolio',
      },
      { status: 500 }
    )
  }
}