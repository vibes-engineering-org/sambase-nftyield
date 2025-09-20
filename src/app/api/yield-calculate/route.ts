import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nftCollection, tokenAddress, duration, rewardPercentage, contributionAmount } = body;

    // Validate required fields
    if (!nftCollection || !tokenAddress || !duration || !rewardPercentage || !contributionAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate estimated yield based on contribution and reward percentage
    const estimatedYield = parseFloat(contributionAmount) * (rewardPercentage / 100);
    const dailyYield = estimatedYield / duration;
    const apy = (rewardPercentage / (duration / 365)) * 100;

    // Mock data for development - in production this would query actual NFT data
    const poolData = {
      id: `pool_${Date.now()}`,
      nftCollection,
      tokenAddress,
      duration,
      rewardPercentage,
      contributionAmount: parseFloat(contributionAmount),
      estimatedYield,
      dailyYield,
      apy,
      status: 'active',
      createdAt: new Date().toISOString(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json(poolData);
  } catch (error) {
    console.error('Yield calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate yield' },
      { status: 500 }
    );
  }
}