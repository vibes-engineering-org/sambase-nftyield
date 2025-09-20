/**
 * NFT Portfolio Management Utilities
 */

export interface NFTAsset {
  id: string;
  contractAddress: string;
  tokenId: string;
  name: string;
  imageUrl: string;
  floorPrice: number;
  estimatedValue: number;
  lastUpdated: Date;
  attributes?: Record<string, any>;
}

export interface PortfolioStats {
  totalValue: number;
  totalAssets: number;
  topCollection: string | null;
  averageValue: number;
  lastUpdated: Date;
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(assets: NFTAsset[]): number {
  return assets.reduce((total, asset) => total + asset.estimatedValue, 0);
}

/**
 * Get portfolio statistics
 */
export function getPortfolioStats(assets: NFTAsset[]): PortfolioStats {
  const totalValue = calculatePortfolioValue(assets);
  const totalAssets = assets.length;
  const averageValue = totalAssets > 0 ? totalValue / totalAssets : 0;

  // Find the most common collection
  const collectionCounts = assets.reduce((acc, asset) => {
    const collection = asset.contractAddress;
    acc[collection] = (acc[collection] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCollection = Object.keys(collectionCounts).length > 0
    ? Object.keys(collectionCounts).reduce((a, b) =>
        collectionCounts[a] > collectionCounts[b] ? a : b
      )
    : null;

  return {
    totalValue,
    totalAssets,
    topCollection,
    averageValue,
    lastUpdated: new Date()
  };
}

/**
 * Filter NFTs by minimum value threshold
 */
export function filterByMinimumValue(
  assets: NFTAsset[],
  minimumValue: number
): NFTAsset[] {
  return assets.filter(asset => asset.estimatedValue >= minimumValue);
}

/**
 * Sort NFTs by value (descending by default)
 */
export function sortByValue(
  assets: NFTAsset[],
  ascending: boolean = false
): NFTAsset[] {
  return [...assets].sort((a, b) => {
    const comparison = b.estimatedValue - a.estimatedValue;
    return ascending ? -comparison : comparison;
  });
}

/**
 * Group NFTs by collection
 */
export function groupByCollection(assets: NFTAsset[]): Record<string, NFTAsset[]> {
  return assets.reduce((acc, asset) => {
    const collection = asset.contractAddress;
    if (!acc[collection]) {
      acc[collection] = [];
    }
    acc[collection].push(asset);
    return acc;
  }, {} as Record<string, NFTAsset[]>);
}