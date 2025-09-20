export interface NFT {
  id: string
  tokenId: string
  contractAddress: string
  chainId: number
  name: string
  description?: string
  image: string
  attributes?: NFTAttribute[]
  owner: string
  creator?: string
  mintedAt?: string
  lastSalePrice?: string
  floorPrice?: string
  rarity?: NFTRarity
  metadata?: NFTMetadata
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date'
  max_value?: number
}

export interface NFTRarity {
  rank: number
  score: number
  totalSupply: number
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  animation_url?: string
  background_color?: string
  attributes: NFTAttribute[]
}

export interface NFTCollection {
  contractAddress: string
  chainId: number
  name: string
  symbol: string
  description?: string
  image?: string
  bannerImage?: string
  totalSupply: number
  floorPrice?: string
  volume24h?: string
  owners?: number
  royalties?: number
  verified: boolean
}

export interface NFTMintParams {
  contractAddress: string
  chainId: number
  quantity: number
  recipientAddress?: string
  mintPrice?: string
  merkleProof?: string[]
}

export interface NFTTransfer {
  from: string
  to: string
  tokenId: string
  transactionHash: string
  blockNumber: number
  timestamp: string
  price?: string
}

export type NFTContractType = 'ERC721' | 'ERC1155'

export interface NFTContract {
  address: string
  name: string
  symbol: string
  description: string
  image?: string
  chainId: number
  type: NFTContractType
  mintPrice?: string
  maxSupply?: number
  baseTokenURI?: string
  totalSupply?: number
  publicMintEnabled?: boolean
  whitelistMintEnabled?: boolean
  revealed?: boolean
}