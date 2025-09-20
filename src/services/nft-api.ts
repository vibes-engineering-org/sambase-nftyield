import { NFT, NFTCollection, NFTMintParams, NFTTransfer } from '~/types'

const API_BASE = '/api'

export class NFTAPIService {
  static async getNFTCollection(
    contractAddress: string,
    chainId: number
  ): Promise<NFTCollection> {
    const response = await fetch(
      `${API_BASE}/nft-collection/${contractAddress}?chainId=${chainId}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch NFT collection')
    }

    return response.json()
  }

  static async getNFTsByOwner(
    ownerAddress: string,
    contractAddress?: string,
    chainId?: number
  ): Promise<NFT[]> {
    const url = new URL(`${API_BASE}/nft-owner/${ownerAddress}`, window.location.origin)
    if (contractAddress) {
      url.searchParams.set('contract', contractAddress)
    }
    if (chainId) {
      url.searchParams.set('chainId', chainId.toString())
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch NFTs by owner')
    }

    return response.json()
  }

  static async getNFTById(
    contractAddress: string,
    tokenId: string,
    chainId: number
  ): Promise<NFT> {
    const response = await fetch(
      `${API_BASE}/nft/${contractAddress}/${tokenId}?chainId=${chainId}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch NFT')
    }

    return response.json()
  }

  static async getNFTTransfers(
    contractAddress: string,
    tokenId?: string,
    chainId?: number
  ): Promise<NFTTransfer[]> {
    const url = new URL(`${API_BASE}/nft-transfers/${contractAddress}`, window.location.origin)
    if (tokenId) {
      url.searchParams.set('tokenId', tokenId)
    }
    if (chainId) {
      url.searchParams.set('chainId', chainId.toString())
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch NFT transfers')
    }

    return response.json()
  }

  static async mintNFT(params: NFTMintParams): Promise<{ transactionHash: string }> {
    const response = await fetch(`${API_BASE}/nft-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('Failed to mint NFT')
    }

    return response.json()
  }

  static async getNFTRewards(
    contractAddress: string,
    tokenId: string,
    chainId: number
  ): Promise<{
    totalRewards: string
    pendingRewards: string
    lastClaimAt?: string
    nextClaimEligible?: string
  }> {
    const response = await fetch(
      `${API_BASE}/nft-rewards/${contractAddress}/${tokenId}?chainId=${chainId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch NFT rewards')
    }

    return response.json()
  }

  static async claimNFTRewards(
    contractAddress: string,
    tokenId: string,
    chainId: number,
    userAddress: string
  ): Promise<{ transactionHash: string; amount: string }> {
    const response = await fetch(`${API_BASE}/nft-rewards/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractAddress,
        tokenId,
        chainId,
        userAddress,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to claim NFT rewards')
    }

    return response.json()
  }

  static async getNFTFloorPrice(
    contractAddress: string,
    chainId: number
  ): Promise<{ floorPrice: string; currency: string }> {
    const response = await fetch(
      `${API_BASE}/nft-floor-price/${contractAddress}?chainId=${chainId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch floor price')
    }

    return response.json()
  }
}