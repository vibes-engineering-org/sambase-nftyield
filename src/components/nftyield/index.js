/**
 * NFTYield Mini App - Main Entry Point
 * A Farcaster mini app for NFT yield farming and portfolio management
 */

import React from 'react';

// NFTYield Core Components
export { default as NFTYieldApp } from './NFTYieldApp';
export { default as YieldDashboard } from './dashboard/YieldDashboard';
export { default as PortfolioManager } from './portfolio/PortfolioManager';
export { default as YieldCalculator } from './yield/YieldCalculator';
export { default as YieldPools } from './yield/YieldPools';
export { default as AnalyticsDashboard } from './analytics/AnalyticsDashboard';

// NFTYield Main App Component
const NFTYieldApp = () => {
  return (
    <div className="nft-yield-app">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            NFTYield
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Maximize your NFT portfolio returns through yield farming
          </p>
        </header>

        <main>
          {/* Dashboard will be rendered here */}
          <YieldDashboard />
        </main>
      </div>
    </div>
  );
};

export default NFTYieldApp;