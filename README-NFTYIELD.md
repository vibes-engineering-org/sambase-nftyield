# NFTYield Mini App

A complete Farcaster Mini App for NFT yield farming and token-based rewards built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **NFT Yield Pools**: Create and manage NFT-based yield farming pools
- **Token Management**: Comprehensive NFTY token dashboard and tracking
- **Samish Token Integration**: Required token locks for pool creation ($10 worth)
- **Lottery System**: Token burning mechanics with lottery rewards
- **Referral Program**: Earn bonuses through user referrals
- **Custom Pools**: Create specialized yield pools with custom parameters
- **Real-time Chat**: Community interaction for active pools
- **Viral Sharing**: Social sharing capabilities
- **Admin Interface**: Pool management and analytics

### Technical Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components with neon cyber theme
- **Web3**: Wagmi v2, Viem for blockchain interactions
- **Farcaster**: Mini App SDK integration
- **Storage**: Supabase for file uploads and data persistence
- **Analytics**: PostHog integration
- **Payments**: Daimo Pay integration

### Key Components

#### Main Components
- `YieldPoolApp` - Main application container with tab navigation
- `NFTYieldTokenDashboard` - Token portfolio and staking interface
- `NFTYieldTokenInfo` - Token information and statistics
- `NFTYieldTokenMint` - Token minting interface
- `NFTYieldTokenDistribution` - Token distribution mechanics
- `SamishTokenPurchase` - Required token lock mechanism
- `CustomYieldPools` - Advanced pool creation
- `LotteryDisplay` - Lottery system interface
- `ActivePoolChat` - Real-time community chat
- `ReferralSystem` - Referral program management
- `AdminSection` - Administrative controls
- `ViralShare` - Social sharing functionality

#### Hooks & Utilities
- `useNFTYieldPool` - Pool management and state
- `useNFTYieldToken` - Token operations and balance
- `useTokenBurnEscrow` - Token burning mechanics
- `useMiniAppSdk` - Farcaster Mini App integration
- `useSupabaseUpload` - File upload functionality

#### Styling
- Custom neon/cyber theme CSS in `src/styles/neon.css`
- Responsive mobile-first design
- Dark mode with neon accents (cyan, purple, pink)

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── get-jwt/           # JWT token generation
│   │   ├── upload/            # File upload endpoint
│   │   └── webhook/           # Farcaster webhook handler
│   ├── app.tsx                # Main app component
│   ├── layout.tsx             # App layout with metadata
│   ├── page.tsx               # Entry point
│   └── providers.tsx          # Context providers
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── providers/             # Context providers
│   ├── yield-pool-app.tsx     # Main NFTYield app
│   ├── nftyield-*.tsx         # NFTYield specific components
│   ├── samish-token-*.tsx     # Samish token components
│   ├── lottery-display.tsx    # Lottery system
│   ├── referral-system.tsx    # Referral program
│   ├── custom-yield-pools.tsx # Custom pool creation
│   ├── active-pool-chat.tsx   # Community chat
│   ├── admin-section.tsx      # Admin interface
│   └── viral-share.tsx        # Social sharing
├── hooks/
│   ├── useNFTYieldPool.ts     # Pool management
│   ├── useNFTYieldToken.ts    # Token operations
│   ├── useTokenBurnEscrow.ts  # Burning mechanics
│   ├── use-miniapp-sdk.ts     # Farcaster integration
│   └── use-supabase-upload.ts # File uploads
├── lib/
│   ├── chains.ts              # Chain configurations
│   ├── nft-*.ts              # NFT utilities
│   ├── provider-*.ts         # Web3 provider utilities
│   └── utils.ts              # General utilities
└── styles/
    └── neon.css              # Custom neon theme
```

## Installation & Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   Create `.env.local` with required variables:
   ```
   NEXT_PUBLIC_VIBES_ENGINEERING_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   VIBES_ENGINEERING_NOTIFICATION_BACKEND_ENDPOINT=your_backend_endpoint
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key (optional)
   NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key (optional)
   NEXT_PUBLIC_DAIMO_PAY_KEY=your_daimo_pay_key (optional)
   ```

3. **Development**:
   ```bash
   pnpm dev
   ```

4. **Build**:
   ```bash
   pnpm build
   ```

5. **Lint & Type Check**:
   ```bash
   pnpm lint
   tsc --noEmit --incremental --skipLibCheck
   ```

## Usage

### Creating Yield Pools
1. Purchase and lock $10 worth of Samish Creator tokens
2. Configure NFT collection and reward token addresses
3. Set pool duration (1-90 days) and reward percentage (1-80%)
4. Deploy pool and start earning yields

### Token Management
- View portfolio balance and locked tokens
- Track transaction history
- Monitor staking rewards (when available)
- Manage token distributions

### Lottery System
- 50% of locked Samish tokens enter lottery
- 50% are burned for deflationary mechanics
- Weekly lottery draws with rewards
- Community participation tracking

### Custom Pools
- Create specialized yield pools
- Set custom parameters and rules
- Community governance features
- Advanced analytics

## Key Features Detail

### Token Economics
- **NFTY Token**: Native utility token for the ecosystem
- **Samish Integration**: Required $10 lock for pool creation
- **Burn Mechanism**: Deflationary tokenomics
- **Lottery System**: Community rewards and incentives

### Farcaster Integration
- Native mini app experience
- Wallet connection via Frame connector
- Social sharing and viral features
- User profile integration

### Mobile-First Design
- Optimized for mobile Farcaster clients
- Touch-friendly interfaces
- Responsive layouts
- Progressive Web App features

## Architecture Highlights

### State Management
- React Context for app state
- localStorage persistence
- Real-time updates
- Optimistic UI updates

### Web3 Integration
- Multi-chain support (Base, Arbitrum, Optimism, Celo, Mainnet)
- Wallet connection via Wagmi
- Smart contract interactions
- NFT metadata handling

### Security
- Input validation and sanitization
- Secure token handling
- Protected API routes
- Error boundary implementation

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `tsc --noEmit` - Type checking

## Contributing

This is a complete mini app template. To extend functionality:
1. Follow existing component patterns
2. Use TypeScript for all new code
3. Maintain mobile-first responsive design
4. Add comprehensive error handling
5. Update this documentation

## License

MIT License - See LICENSE file for details.