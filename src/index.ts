// Main exports for the NFTYield mini app

// Types
export * from './types'

// Configuration
export * from './config/chains'
export * from './config/nft-contracts'

// Constants
export * from './constants/yield-pools'

// Utilities
export * from './utils/format'
export * from './utils/calculations'

// Hooks
export { useMiniAppSdk } from './hooks/use-miniapp-sdk'
export { useProfile } from './hooks/use-profile'
export { useToast } from './hooks/use-toast'
export { useSupabaseUpload } from './hooks/use-supabase-upload'
export { useIsMobile } from './hooks/use-mobile'
export { useNFTYieldPool } from './hooks/useNFTYieldPool'
export { useNFTYieldToken } from './hooks/useNFTYieldToken'
export { useTokenBurnEscrow } from './hooks/useTokenBurnEscrow'
export { useYieldCalculator } from './hooks/use-yield-calculator'
export { useNFTCollection } from './hooks/use-nft-collection'
export { usePortfolio } from './hooks/use-portfolio'

// Services
export { YieldAPIService } from './services/yield-api'
export { NFTAPIService } from './services/nft-api'

// Components (organized by category)
// UI Components
export { Button } from './components/ui/button'
export { Input } from './components/ui/input'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
export { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet'

// NFT Components
export { NFTCard } from './components/nft/nft-card'
export { NFTMintButton } from './components/nft/nft-mint-button'
export { NFTMintFlow } from './components/nft/nft-mint-flow'

// Yield Components
export { default as YieldPoolApp } from './components/yield/yield-pool-app'
export { default as CustomYieldPools } from './components/yield/custom-yield-pools'

// Layout Components
export { AppSidebar } from './components/layout/app-sidebar'
export { MinimalNavbar } from './components/layout/minimal-navbar'

// Dashboard Components
export { default as AdminSection } from './components/dashboard/admin-section'
export { default as LotteryDisplay } from './components/dashboard/lottery-display'
export { default as ActivePoolChat } from './components/dashboard/active-pool-chat'

// Shared Components
export { UserAvatar } from './components/avatar'
export { UserContext } from './components/user-context'
export { ShowCoinBalance } from './components/show-coin-balance'
export { ProfileSearch } from './components/profile-search'
export { OnchainUserSearch } from './components/onchain-user-search'
export { ShareCastButton } from './components/share-cast-button'
export { AddMiniappButton } from './components/add-miniapp-button'
export { DaimoPayTransferButton } from './components/daimo-pay-transfer-button'
export { default as ReferralSystem } from './components/referral-system'
export { default as ViralShare } from './components/viral-share'
export { default as SamishTokenPurchase } from './components/samish-token-purchase'

// File Upload Components
export { default as FileUploadCard } from './components/FileUploadCard'
export { default as BucketExplorer } from './components/BucketExplorer'
export { Dropzone } from './components/dropzone'

// Utility Components
export { default as VisitorCounter } from './components/VisitorCounter'
export { default as ExampleComponents } from './components/ExampleComponents'

// Providers
export { default as WagmiProvider } from './components/providers/WagmiProvider'