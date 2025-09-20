import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get('poolId');

  if (!poolId) {
    return NextResponse.json(
      { error: 'Pool ID is required' },
      { status: 400 }
    );
  }

  try {
    // Mock pool status data - in production this would query the blockchain/database
    const poolStatus = {
      id: poolId,
      status: 'active',
      currentYield: Math.random() * 100,
      totalContributions: Math.random() * 10000,
      participantCount: Math.floor(Math.random() * 50) + 1,
      daysRemaining: Math.floor(Math.random() * 30) + 1,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(poolStatus);
  } catch (error) {
    console.error('Pool status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pool status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { poolId, action, data } = body;

    if (!poolId || !action) {
      return NextResponse.json(
        { error: 'Pool ID and action are required' },
        { status: 400 }
      );
    }

    // Handle different pool actions
    switch (action) {
      case 'join':
        return NextResponse.json({
          success: true,
          message: 'Successfully joined pool',
          poolId,
          timestamp: new Date().toISOString(),
        });

      case 'leave':
        return NextResponse.json({
          success: true,
          message: 'Successfully left pool',
          poolId,
          timestamp: new Date().toISOString(),
        });

      case 'claim':
        return NextResponse.json({
          success: true,
          message: 'Successfully claimed rewards',
          poolId,
          amount: data?.amount || 0,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Pool action error:', error);
    return NextResponse.json(
      { error: 'Failed to process pool action' },
      { status: 500 }
    );
  }
}