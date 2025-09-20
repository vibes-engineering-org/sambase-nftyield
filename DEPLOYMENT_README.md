# NFTYield Mini App - Deployment Guide

## Overview

NFTYield is a Farcaster Mini App that enables users to create yield pools using NFTs as collateral. Users must hold $10 worth of Samish Creator tokens to create pools, with $5 burned and $5 entering a lottery system.

## Features

- ✅ **Yield Pool Creation**: Create yield pools with NFT collections and custom token rewards
- ✅ **Samish Token Integration**: Burn mechanism with lottery system
- ✅ **Custom Pool Support**: Create specialized reward pools
- ✅ **Referral System**: Earn bonuses from referrals
- ✅ **Community Chat**: Pool-specific communication
- ✅ **Lottery System**: Win rewards from burned tokens
- ✅ **Admin Dashboard**: Pool management and analytics
- ✅ **Viral Sharing**: Social media integration
- ✅ **NFTYield Token**: Native token information and distribution

## Architecture

### Core Technologies
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** + **shadcn/ui** for styling
- **Farcaster Frame SDK** for mini app functionality
- **Wagmi** for Web3 wallet integration
- **Supabase** for file storage and database
- **PostHog** for analytics
- **Daimo Pay** for payment integration

### Key Components

#### Main App Components
- `yield-pool-app.tsx` - Main application interface
- `samish-token-purchase.tsx` - Token purchase and burn mechanism
- `custom-yield-pools.tsx` - Custom pool creation
- `lottery-display.tsx` - Lottery system interface
- `referral-system.tsx` - Referral program
- `active-pool-chat.tsx` - Community chat
- `admin-section.tsx` - Admin dashboard
- `viral-share.tsx` - Social sharing
- `nftyield-token-info.tsx` - Token information

#### Utility Libraries
- `nftyield-utils.ts` - Core utility functions and types
- `samish-token.ts` - Token-related utilities and constants

#### API Endpoints
- `/api/yield-calculate` - Yield calculation service
- `/api/pool-status` - Pool status and management
- `/api/nft-rewards` - NFT rewards data
- `/api/webhook` - Farcaster webhook handling
- `/api/upload` - File upload service
- `/api/get-jwt` - JWT token generation

#### Hooks
- `useTokenBurnEscrow.ts` - Token burn functionality
- `useNFTYieldPool.ts` - Pool management
- `useNFTYieldToken.ts` - Token operations
- `useMiniAppSdk.ts` - Farcaster SDK integration
- `useSupabaseUpload.ts` - File upload functionality

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Required
NEXT_PUBLIC_VIBES_ENGINEERING_PROJECT_ID=your_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
VIBES_ENGINEERING_NOTIFICATION_BACKEND_ENDPOINT=your_webhook_endpoint

# Optional
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
NEXT_PUBLIC_DAIMO_PAY_KEY=your_daimo_pay_key
NEYNAR_API_KEY=your_neynar_api_key
DUNE_API_KEY=your_dune_api_key
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account for storage
- PostHog account for analytics (optional)
- Alchemy API key for blockchain data (optional)

### Installation Steps

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd nftyield-miniapp
pnpm install
```

2. **Configure Environment Variables**
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. **Development Server**
```bash
pnpm dev
```

4. **Build for Production**
```bash
pnpm build
pnpm start
```

## Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Deploy using `pnpm build` output
- **Railway**: Use the provided Dockerfile if available
- **Heroku**: Configure buildpacks for Node.js

## Configuration

### Farcaster Mini App Setup
1. Register your mini app at [Farcaster Dev Portal](https://dev.farcaster.xyz)
2. Configure webhook endpoints and permissions
3. Update `src/app/.well-known/farcaster.json` with your app details

### Supabase Setup
1. Create a Supabase project
2. Configure storage buckets for file uploads
3. Set up authentication and API keys

### PostHog Analytics (Optional)
1. Create PostHog project
2. Add tracking keys to environment variables
3. Configure event tracking in the app

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint

# Git Operations
git checkout HEAD .pnpm-deps-hash  # Ignore pnpm hash changes
```

## Key Features Implementation

### 1. Yield Pool Creation
- Users must hold $10 worth of Samish Creator tokens
- 50% of tokens are burned, 50% enter lottery system
- Supports custom NFT collections and reward tokens
- Configurable duration and reward percentages

### 2. Samish Token Integration
- Creator: `0x086bb3d739460897B24d68E73b5c8b5FF09781`
- Platform: Zora Network
- Deflationary tokenomics with burn mechanism
- Lottery system for burned token rewards

### 3. Multi-Tab Interface
- **Create**: Pool creation interface
- **Pools**: Active pool management
- **Token**: NFTYield token information
- **Lottery**: Lottery system display
- **Referrals**: Referral program
- **Custom**: Custom pool creation
- **Chat**: Community communication
- **Share**: Social media sharing
- **Admin**: Administrative functions

### 4. Mobile-Optimized UI
- Responsive design for mobile-first usage
- Neon cyberpunk theme with gradient effects
- Intuitive tab navigation
- Touch-friendly interface elements

## Troubleshooting

### Common Issues

**Build Errors**
- Run `tsc --noEmit --incremental --skipLibCheck` to check TypeScript
- Run `pnpm lint` to check for ESLint issues

**Environment Variables**
- Ensure all required variables are set in `.env.local`
- Check Supabase connectivity and API keys

**Farcaster Integration**
- Verify webhook endpoints are accessible
- Check mini app registration and permissions

## Security Considerations

- Never commit sensitive keys to repository
- Use environment variables for all API keys
- Validate all user inputs on server side
- Implement proper error handling for API endpoints

## Support

For issues and questions:
- Check the existing components in `src/components/`
- Review the utility functions in `src/lib/`
- Ensure all dependencies are installed with `pnpm install`

## License

Private - All rights reserved