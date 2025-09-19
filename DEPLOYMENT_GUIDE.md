# NFTYield Platform - Complete Deployment Guide

This guide provides step-by-step instructions for deploying the complete NFTYield platform on Base Network.

## 🏗️ Architecture Overview

The NFTYield platform consists of:

### Smart Contracts
1. **NFTYieldToken (NFTY)** - ERC-20 utility token with staking and governance features
2. **TokenBurnEscrow** - Handles Samish token burning and lottery system for pool entry
3. **NFTYieldPool** - Main yield farming contract for NFT holders
4. **NFTYieldFactory** - Factory contract for deploying pool templates

### Frontend Application
- Next.js 15 with React 19 and TypeScript
- Wagmi v2 for Web3 integration
- Base Network integration
- Farcaster Mini App functionality

## 📋 Prerequisites

### Development Environment
```bash
node.js >= 18
pnpm (package manager)
git
```

### Required Accounts & Keys
- Private key for contract deployment
- Infura/Alchemy API key for RPC access
- Etherscan/Basescan API key for verification
- Farcaster developer account

### Network Configuration
- Base Mainnet RPC: `https://mainnet.base.org`
- Base Testnet RPC: `https://sepolia.base.org`
- Chain ID: 8453 (mainnet), 84532 (testnet)

## 🚀 Deployment Steps

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd nftyield-platform

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your configuration:

```bash
# Next.js App Configuration
NEXT_PUBLIC_VIBES_ENGINEERING_PROJECT_ID=your_project_id
NEXT_PUBLIC_URL=https://your-domain.com

# Supabase (for file storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host

# Blockchain & Web3
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
NEXT_PUBLIC_DAIMO_PAY_KEY=your_daimo_pay_key

# Webhooks
VIBES_ENGINEERING_NOTIFICATION_BACKEND_ENDPOINT=your_webhook_endpoint

# Farcaster
NEYNAR_API_KEY=your_neynar_api_key
```

### 3. Smart Contract Deployment

Navigate to contracts directory:
```bash
cd src/contracts
```

Create contract environment file:
```bash
cp .env.example .env
```

Configure contract deployment variables in `src/contracts/.env`:
```bash
# Deployment Private Key
PRIVATE_KEY=your_deployer_private_key

# API Keys
BASESCAN_API_KEY=your_basescan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
INFURA_KEY=your_infura_project_id

# Contract Configuration
TEAM_WALLET=0x... # Team allocation wallet
COMMUNITY_POOL=0x... # Community rewards pool
LIQUIDITY_POOL=0x... # Liquidity pool wallet
PLATFORM_TREASURY=0x... # Platform treasury
FEE_RECIPIENT=0x... # Platform fee recipient
LOTTERY_WALLET=0x... # Lottery system wallet

# Existing Token
SAMISH_TOKEN_ADDRESS=0x086bb3d90d719eb50d569e071b9987080ecb9781
```

Install Hardhat dependencies:
```bash
npm install
```

Compile contracts:
```bash
npx hardhat compile
```

Deploy to Base Network:
```bash
# Deploy to Base Mainnet
npx hardhat run scripts/deploy.js --network base

# Or deploy to Base Sepolia for testing
npx hardhat run scripts/deploy.js --network baseSepolia
```

Verify contracts:
```bash
npx hardhat run scripts/verify.js --network base
```

### 4. Update Frontend Configuration

Update the deployed contract addresses in:

- `src/hooks/useTokenBurnEscrow.ts`
- `src/hooks/useNFTYieldToken.ts`
- `src/hooks/useNFTYieldPool.ts`

Replace placeholder addresses with deployed contract addresses from the deployment output.

### 5. Frontend Deployment

Build the application:
```bash
# From project root
pnpm build
```

Deploy to Vercel (recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or deploy to other platforms:
- Netlify
- Railway
- Self-hosted with Docker

## 🔧 Configuration Details

### Token Economics (NFTY)
- **Total Supply**: 1 billion tokens
- **Initial Supply**: 100 million tokens
- **Team Allocation**: 15% (vested over 1 year)
- **Community Rewards**: 40%
- **Liquidity Pool**: 25%
- **Platform Treasury**: 20%

### Platform Features
- **Pool Creation Fee**: 0.01-0.02 ETH (varies by pool type)
- **Platform Fee**: 2.5% (discounted for NFTY holders)
- **Staking Rewards**: 10% APY
- **Minimum NFTY for Premium**: 1,000 NFTY

### Lottery System
- **Entry Mechanism**: $5 from each $10 Samish token purchase
- **Monthly Lottery**: Accumulated rewards distributed monthly
- **Immediate Rewards**: 50% of escrow goes to immediate lottery
- **Eligibility**: Users who complete full cycle (buy, burn, complete pool)

## 🎯 Post-Deployment Checklist

### Smart Contract Configuration
- [ ] Verify all contracts on Basescan
- [ ] Test contract interactions
- [ ] Set up initial token distribution
- [ ] Configure factory templates
- [ ] Test lottery system

### Frontend Application
- [ ] Update contract addresses in code
- [ ] Test all user flows
- [ ] Configure Farcaster Frame metadata
- [ ] Set up analytics tracking
- [ ] Test mobile responsiveness

### Platform Operations
- [ ] Set up monitoring and alerts
- [ ] Configure backup systems
- [ ] Document admin procedures
- [ ] Set up customer support
- [ ] Create user documentation

## 🛠️ Development Commands

### Frontend
```bash
# Development server
pnpm dev

# Build production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Smart Contracts
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy contracts
npx hardhat run scripts/deploy.js --network <network>

# Verify contracts
npx hardhat run scripts/verify.js --network <network>
```

## 🔒 Security Considerations

### Smart Contract Security
- All contracts use OpenZeppelin libraries
- ReentrancyGuard protection on critical functions
- Access control with Ownable pattern
- Emergency pause functionality
- Input validation and bounds checking

### Frontend Security
- Environment variables properly configured
- HTTPS enforced
- CORS policies in place
- Input sanitization
- Wallet connection security

### Operational Security
- Private keys stored securely
- Multi-signature wallets for treasury
- Regular security audits
- Bug bounty program
- Incident response plan

## 📈 Monitoring & Analytics

### On-Chain Monitoring
- Contract interactions via Etherscan/Basescan
- Token transfers and burns
- Pool creation and participation
- Lottery distributions

### Application Analytics
- PostHog for user behavior
- Pool participation metrics
- Token usage statistics
- Revenue tracking

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Gas Estimation Failed**
   - Check network connection
   - Verify account balance
   - Try increasing gas limit

2. **Contract Verification Failed**
   - Wait 5-10 minutes after deployment
   - Check constructor arguments
   - Verify API keys are correct

3. **Frontend Build Errors**
   - Check environment variables
   - Verify contract addresses
   - Run `pnpm lint` to check for errors

### Support Resources
- [Base Network Documentation](https://docs.base.org)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**⚠️ Important**: This platform is experimental software. Always test on testnet first and conduct thorough audits before mainnet deployment. Never deploy more than you can afford to lose.