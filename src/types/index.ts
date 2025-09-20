// Re-export all types for easy importing
export * from './nft'
export * from './yield'
export * from './user'

// Common utility types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ChainInfo {
  id: number
  name: string
  symbol: string
  rpcUrl: string
  blockExplorer: string
  logo?: string
}

export interface ContractInfo {
  address: string
  chainId: number
  abi: any[]
  bytecode?: string
}

export interface TokenInfo {
  address: string
  chainId: number
  symbol: string
  name: string
  decimals: number
  logo?: string
  price?: string
  marketCap?: string
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  total: string
}

export interface TransactionReceipt {
  transactionHash: string
  blockNumber: number
  blockHash: string
  gasUsed: string
  status: 'success' | 'failed'
  timestamp: string
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ErrorInfo {
  code?: string | number
  message: string
  details?: any
  timestamp: string
}