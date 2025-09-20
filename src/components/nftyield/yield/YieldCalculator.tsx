import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

export default function YieldCalculator() {
  const [nftValue, setNftValue] = useState('');
  const [stakingPeriod, setStakingPeriod] = useState('30');
  const [expectedApy, setExpectedApy] = useState('12');

  const calculateYield = () => {
    const value = parseFloat(nftValue) || 0;
    const apy = parseFloat(expectedApy) / 100;
    const days = parseFloat(stakingPeriod);

    const dailyRate = apy / 365;
    const totalYield = value * dailyRate * days;

    return totalYield.toFixed(2);
  };

  return (
    <div className="yield-calculator space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yield Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              NFT Value (ETH)
            </label>
            <Input
              type="number"
              value={nftValue}
              onChange={(e) => setNftValue(e.target.value)}
              placeholder="0.0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Staking Period (days)
            </label>
            <Input
              type="number"
              value={stakingPeriod}
              onChange={(e) => setStakingPeriod(e.target.value)}
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Expected APY (%)
            </label>
            <Input
              type="number"
              value={expectedApy}
              onChange={(e) => setExpectedApy(e.target.value)}
              placeholder="12"
              step="0.1"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Estimated Yield:</span>
              <span className="text-lg font-bold">
                {calculateYield()} ETH
              </span>
            </div>
            <Button className="w-full">
              Find Matching Pools
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}