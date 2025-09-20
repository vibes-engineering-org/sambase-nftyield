import { NextRequest, NextResponse } from 'next/server'
import { YIELD_POOLS, getPoolsByChain } from '~/constants/yield-pools'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chainId = searchParams.get('chainId')
    const active = searchParams.get('active')

    let pools = YIELD_POOLS

    // Filter by chain if specified
    if (chainId) {
      pools = getPoolsByChain(parseInt(chainId))
    }

    // Filter by active status if specified
    if (active === 'true') {
      pools = pools.filter(pool => pool.isActive)
    }

    return NextResponse.json({
      success: true,
      data: pools,
    })
  } catch (error) {
    console.error('Error fetching yield pools:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch yield pools',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, protocol, chainId, contractAddress, token, apy, minimumDeposit } = body

    // In a real implementation, this would create a new pool in the database
    // For now, we'll just validate the input and return success
    if (!name || !contractAddress || !chainId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, contractAddress, chainId',
        },
        { status: 400 }
      )
    }

    const newPool = {
      id: `custom-${Date.now()}`,
      name,
      description,
      protocol,
      chainId,
      contractAddress,
      token,
      apy: apy || 0,
      tvl: '0',
      isActive: true,
      riskLevel: 'Medium' as const,
      minimumDeposit,
    }

    return NextResponse.json({
      success: true,
      data: newPool,
      message: 'Yield pool created successfully',
    })
  } catch (error) {
    console.error('Error creating yield pool:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create yield pool',
      },
      { status: 500 }
    )
  }
}