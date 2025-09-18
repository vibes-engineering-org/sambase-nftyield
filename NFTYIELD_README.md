# NFTYield - NFT Yield Pool Platform

A Farcaster Mini App that enables users to create yield-generating pools using NFT collections and ERC-20 tokens on Base Network.

![NFTYield](https://img.shields.io/badge/Network-Base-blue) ![Status](https://img.shields.io/badge/Status-Beta-yellow) ![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Overview

NFTYield is a decentralized platform that allows users to:
- Create yield pools by combining NFT collections with ERC-20 tokens
- Generate passive income through NFT holdings
- Participate in a token-driven ecosystem
- Access community features and lottery systems

## 🚀 Features

### Core Functionality
- **Yield Pool Creation**: Create pools by locking NFTs with reward tokens
- **Token Integration**: NFTYIELD (NFTY) utility token for platform access
- **Base Network**: Built on Base for low fees and fast transactions
- **Community Driven**: Referral system and viral sharing mechanisms

### Platform Components
- **Pool Management**: Create and manage multiple yield pools
- **Token Dashboard**: Track token holdings and utility usage
- **Lottery System**: Community-driven reward distribution
- **Admin Tools**: Pool monitoring and management features

## 📱 Access

### Live Platform
- **Farcaster Frame**: Available as a Mini App within Farcaster
- **Base Network**: All transactions occur on Base blockchain
- **Mobile Optimized**: Designed for mobile-first experience

### Requirements
- Farcaster account
- Base Network wallet (MetaMask, Coinbase Wallet, etc.)
- ETH for gas fees on Base Network

## 🪙 NFTYIELD Token Information

### Token Details
- **Name**: NFTYIELD
- **Symbol**: NFTY
- **Network**: Base Network
- **Type**: Utility Token
- **Decimals**: 18

### Current Status
⚠️ **Important Notice**: The NFTYIELD token is currently under development and not yet deployed.

### Token Utility
- NFT Yield Pool Participation
- Platform Governance Rights
- Access to Premium Features
- Community Rewards

### How to Purchase
🚧 **Coming Soon**: Purchase options will be available once the token is deployed:
- Decentralized exchanges (DEX) on Base Network
- Direct minting through NFTYield platform
- Yield pool rewards and incentives

## 🛠️ Technical Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern UI components

### Blockchain Integration
- **Wagmi**: Web3 wallet integration
- **Viem**: Ethereum client library
- **Base Network**: Optimistic rollup on Ethereum
- **Farcaster Frame SDK**: Mini app functionality

### Backend Services
- **Supabase**: File storage and database
- **PostHog**: Analytics and user tracking
- **Webhook Integration**: Real-time event processing

## 🏃‍♂️ Getting Started

### Prerequisites
```bash
node.js >= 18
pnpm (recommended package manager)
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/nftyield.git

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Environment Variables
Create a `.env.local` file with the following:

```bash
# Required
NEXT_PUBLIC_VIBES_ENGINEERING_PROJECT_ID=your_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
NEXT_PUBLIC_DAIMO_PAY_KEY=your_daimo_pay_key
```

## 🎮 How to Use

### Creating Your First Yield Pool

1. **Connect Wallet**: Connect your Base Network wallet through the app
2. **Lock Entry Tokens**: Purchase and lock $10 worth of Samish Creator tokens
3. **Configure Pool**: Set NFT collection address, reward token, and parameters
4. **Activate Pool**: Your pool becomes active and starts generating rewards

### Token Requirements
- **Entry Fee**: $10 worth of Samish Creator tokens (split: $5 burned, $5 lottery)
- **NFT Collection**: Valid NFT collection contract address
- **Reward Token**: ERC-20 token address for reward distribution

## 📊 Pool Mechanics

### Pool Configuration
- **Duration**: 1-90 days customizable lock period
- **Reward Rate**: 1-80% reward percentage
- **Token Contribution**: Amount of reward tokens to distribute
- **NFT Collection**: Target NFT collection for yield generation

### Reward Distribution
- Proportional to NFT holdings in specified collection
- Automated distribution at pool completion
- Community-driven verification system

## 🎲 Additional Features

### Lottery System
- 50% of entry fees enter community lottery
- Regular drawings for additional rewards
- Transparency through blockchain verification

### Referral Program
- Earn bonuses for bringing new users
- Viral sharing mechanisms
- Community growth incentives

### Custom Pools
- Create specialized yield pools
- Flexible parameter configuration
- Community governance features

## 🔒 Security & Transparency

### Smart Contract Security
- Open source codebase
- Community auditable contracts
- Minimal trust required design

### Token Economics
- Deflationary mechanics through token burning
- Transparent fee structure
- Community-governed parameters

## 🌐 Community

### Support & Documentation
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Updates**: Follow development progress

### Contributing
Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## ⚖️ License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

NFTYield is experimental software. Use at your own risk. The platform is currently in beta and may contain bugs or undergo significant changes. Never invest more than you can afford to lose.

### Risk Factors
- Smart contract risks
- Market volatility
- Platform development status
- Regulatory uncertainties

## 🚧 Development Status

- **Phase**: Beta Testing
- **Token Status**: Under Development
- **Network**: Base Testnet → Base Mainnet
- **Audit Status**: Pending

---

*Built with ❤️ for the Farcaster ecosystem and Base Network community*