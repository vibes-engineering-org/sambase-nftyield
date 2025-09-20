import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

export default function PortfolioManager() {
  return (
    <div className="portfolio-manager space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            My NFT Portfolio
            <Button size="sm" variant="outline">
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No NFTs Found
            </h3>
            <p className="text-gray-500 mb-4">
              Connect your wallet to view your NFT collection and explore yield opportunities.
            </p>
            <Button>
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}