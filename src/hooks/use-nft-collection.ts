import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { NFT, NFTCollection } from '~/types'
import { getContractByAddress } from '~/config/nft-contracts'

interface UseNFTCollectionProps {
  contractAddress: string
  chainId: number
}

export const useNFTCollection = ({ contractAddress, chainId }: UseNFTCollectionProps) => {
  const { address } = useAccount()
  const [collection, setCollection] = useState<NFTCollection | null>(null)
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract info
  const contractInfo = getContractByAddress(contractAddress, chainId)

  // Read contract data
  const { data: totalSupply } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        name: 'totalSupply',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      },
    ],
    functionName: 'totalSupply',
    chainId,
  })

  const { data: name } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }],
      },
    ],
    functionName: 'name',
    chainId,
  })

  const { data: symbol } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }],
      },
    ],
    functionName: 'symbol',
    chainId,
  })

  const fetchCollectionData = useCallback(async () => {
    if (!contractAddress || !chainId) return

    setLoading(true)
    setError(null)

    try {
      // Use contract data if available
      if (name && symbol && totalSupply) {
        const collectionData: NFTCollection = {
          contractAddress,
          chainId,
          name: name as string,
          symbol: symbol as string,
          description: contractInfo?.description,
          totalSupply: Number(totalSupply),
          verified: true,
        }
        setCollection(collectionData)
      }

      // Fetch additional data from APIs if needed
      // This could integrate with Alchemy, OpenSea, or other NFT APIs

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collection data')
    } finally {
      setLoading(false)
    }
  }, [contractAddress, chainId, name, symbol, totalSupply, contractInfo])

  const fetchUserNFTs = useCallback(async () => {
    if (!address || !contractAddress || !chainId) return

    setLoading(true)
    setError(null)

    try {
      // This would integrate with NFT APIs to fetch user's NFTs
      // For now, returning empty array as placeholder
      setUserNFTs([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user NFTs')
    } finally {
      setLoading(false)
    }
  }, [address, contractAddress, chainId])

  const refreshData = useCallback(() => {
    fetchCollectionData()
    if (address) {
      fetchUserNFTs()
    }
  }, [fetchCollectionData, fetchUserNFTs, address])

  useEffect(() => {
    fetchCollectionData()
  }, [fetchCollectionData])

  useEffect(() => {
    if (address) {
      fetchUserNFTs()
    }
  }, [fetchUserNFTs, address])

  return {
    collection,
    userNFTs,
    loading,
    error,
    refreshData,
    contractInfo,
  }
}