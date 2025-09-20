import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nftCollection = searchParams.get('collection');
  const tokenAddress = searchParams.get('token');

  if (!nftCollection || !tokenAddress) {
    return NextResponse.json(
      { error: 'NFT collection and token address are required' },
      { status: 400 }
    );
  }

  try {
    // Mock NFT rewards data - in production this would query actual NFT metadata and rewards
    const rewardsData = {
      collection: nftCollection,
      token: tokenAddress,
      totalRewards: Math.random() * 1000,
      dailyRate: Math.random() * 10,
      participants: Math.floor(Math.random() * 100) + 1,
      averageYield: Math.random() * 50,
      floorPrice: Math.random() * 5,
      volume24h: Math.random() * 10000,
      lastUpdated: new Date().toISOString(),
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        yield: Math.random() * 20,
        volume: Math.random() * 1000,
      })).reverse(),
    };

    return NextResponse.json(rewardsData);
  } catch (error) {
    console.error('NFT rewards error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT rewards data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nftCollection, tokenAddress, walletAddress } = body;

    if (!nftCollection || !tokenAddress || !walletAddress) {
      return NextResponse.json(
        { error: 'NFT collection, token address, and wallet address are required' },
        { status: 400 }
      );
    }

    // Mock claim rewards functionality
    const claimResult = {
      success: true,
      collection: nftCollection,
      token: tokenAddress,
      wallet: walletAddress,
      claimedAmount: Math.random() * 50,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(claimResult);
  } catch (error) {
    console.error('Claim rewards error:', error);
    return NextResponse.json(
      { error: 'Failed to claim rewards' },
      { status: 500 }
    );
  }
}