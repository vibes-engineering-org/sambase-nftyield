import { NextRequest, NextResponse } from 'next/server'
import { nftContracts, getContractByChain } from '~/config/nft-contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chainId = searchParams.get('chainId')
    const contractAddress = searchParams.get('contract')

    if (contractAddress && chainId) {
      // Get specific contract
      const contract = Object.values(nftContracts).find(
        c => c.address.toLowerCase() === contractAddress.toLowerCase() &&
        c.chainId === parseInt(chainId)
      )

      if (!contract) {
        return NextResponse.json(
          {
            success: false,
            error: 'NFT contract not found',
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: contract,
      })
    }

    // Get all contracts, optionally filtered by chain
    let contracts = Object.values(nftContracts)

    if (chainId) {
      contracts = getContractByChain(parseInt(chainId))
    }

    return NextResponse.json({
      success: true,
      data: contracts,
    })
  } catch (error) {
    console.error('Error fetching NFT collections:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch NFT collections',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, name, symbol, description, chainId, type, mintPrice, maxSupply } = body

    // Validate required fields
    if (!address || !name || !symbol || !chainId || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: address, name, symbol, chainId, type',
        },
        { status: 400 }
      )
    }

    // In a real implementation, this would add the contract to the database
    const newContract = {
      address,
      name,
      symbol,
      description,
      chainId,
      type,
      mintPrice,
      maxSupply,
    }

    return NextResponse.json({
      success: true,
      data: newContract,
      message: 'NFT contract registered successfully',
    })
  } catch (error) {
    console.error('Error registering NFT contract:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register NFT contract',
      },
      { status: 500 }
    )
  }
}