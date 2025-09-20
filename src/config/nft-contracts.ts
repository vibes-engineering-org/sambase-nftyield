import { SupportedChainId } from './chains'
import { NFTContract } from '../types/nft'

export const nftContracts: Record<string, NFTContract> = {
  // Base contracts
  'base-nftyield': {
    address: '0x742d35Cc6634C0532925a3b8D7a28B51e5f89f80',
    name: 'NFTYield Genesis',
    symbol: 'NFTY',
    description: 'Genesis collection for NFTYield platform',
    chainId: 8453, // Base
    type: 'ERC721',
    mintPrice: '0.001',
    maxSupply: 10000,
  },

  // Ethereum mainnet contracts
  'mainnet-premium': {
    address: '0x1234567890123456789012345678901234567890',
    name: 'NFTYield Premium',
    symbol: 'NFTYP',
    description: 'Premium NFT collection with enhanced yield opportunities',
    chainId: 1, // Mainnet
    type: 'ERC721',
    mintPrice: '0.05',
    maxSupply: 5000,
  },
} as const

export const getContractByChain = (chainId: number) => {
  return Object.values(nftContracts).filter(contract => contract.chainId === chainId)
}

export const getContractByAddress = (address: string, chainId: number) => {
  return Object.values(nftContracts).find(
    contract => contract.address.toLowerCase() === address.toLowerCase() && contract.chainId === chainId
  )
}