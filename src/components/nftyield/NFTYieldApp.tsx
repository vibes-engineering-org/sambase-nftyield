import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { useMiniAppSdk } from '~/hooks/useMiniAppSdk';

interface NFTYieldAppProps {
  className?: string;
}

export default function NFTYieldApp({ className = '' }: NFTYieldAppProps) {
  const { isSDKLoaded, fid, username } = useMiniAppSdk();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'yield' | 'analytics'>('portfolio');

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NFTYield...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`nft-yield-app ${className}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            NFTYield
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Maximize your NFT portfolio returns
          </p>
          {username && (
            <p className="text-sm text-gray-500 mt-2">
              Welcome back, @{username}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('portfolio')}
              className="px-4"
            >
              Portfolio
            </Button>
            <Button
              variant={activeTab === 'yield' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('yield')}
              className="px-4"
            >
              Yield
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('analytics')}
              className="px-4"
            >
              Analytics
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'portfolio' && (
            <Card>
              <CardHeader>
                <CardTitle>NFT Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Connect your wallet to view your NFT portfolio and yield opportunities.
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'yield' && (
            <Card>
              <CardHeader>
                <CardTitle>Yield Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Discover yield farming pools and staking opportunities for your NFTs.
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  View detailed analytics and performance metrics for your NFT investments.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}