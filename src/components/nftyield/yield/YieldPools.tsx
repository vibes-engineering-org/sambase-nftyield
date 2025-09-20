import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

interface YieldPool {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  minimumStake: string;
  risk: 'Low' | 'Medium' | 'High';
}

const mockPools: YieldPool[] = [
  {
    id: '1',
    name: 'Blue Chip NFT Pool',
    protocol: 'NFTX',
    apy: 15.2,
    tvl: '$2.4M',
    minimumStake: '0.1 ETH',
    risk: 'Low'
  },
  {
    id: '2',
    name: 'Art Collection Vault',
    protocol: 'Fractional',
    apy: 22.8,
    tvl: '$850K',
    minimumStake: '0.05 ETH',
    risk: 'Medium'
  },
  {
    id: '3',
    name: 'Gaming Assets Pool',
    protocol: 'Treasure',
    apy: 35.5,
    tvl: '$1.2M',
    minimumStake: '0.02 ETH',
    risk: 'High'
  }
];

export default function YieldPools() {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="yield-pools space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Yield Pools</h2>
        <Button variant="outline" size="sm">
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {mockPools.map((pool) => (
          <Card key={pool.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{pool.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protocol: {pool.protocol}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pool.risk)}`}>
                  {pool.risk} Risk
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">APY</p>
                  <p className="font-semibold text-green-600">{pool.apy}%</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">TVL</p>
                  <p className="font-semibold">{pool.tvl}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Min Stake</p>
                  <p className="font-semibold">{pool.minimumStake}</p>
                </div>
              </div>

              <Button className="w-full">
                Stake NFTs
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}