# BaseApp Token Deployment Guide

## Overview
This guide will help you deploy the BaseApp Token (BAPP) smart contract to the Base network with the following specifications:
- Total Supply: 1,000,000,000 BAPP tokens
- Marketing Allocation: 100,000,000 BAPP (10% airdropped to marketing wallet)
- Marketing Wallet: 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2
- Bonding Curve: Price increases as tokens are sold
- Base Network: Optimized for Base ecosystem integration

## Prerequisites

1. **Node.js and pnpm**: Ensure you have Node.js 18+ and pnpm installed
2. **Wallet with ETH**: You need ETH on Base network for deployment gas fees
3. **Private Key**: Export your wallet's private key for deployment
4. **BaseScan API Key** (optional): For contract verification

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Update your `.env.local` file with the following required values:

```env
# Required for deployment
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Will be updated after deployment
NEXT_PUBLIC_BASE_APP_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
```

⚠️ **Important**: Never commit your `.env.local` file to version control!

## Step 3: Compile the Smart Contract

```bash
pnpm compile
```

This will compile the BaseAppToken.sol contract and generate the necessary artifacts.

## Step 4: Deploy to Base Network

### Option A: Deploy to Base Mainnet
```bash
pnpm deploy:base
```

### Option B: Deploy to Base Sepolia (Testnet)
```bash
pnpm deploy:base-sepolia
```

After successful deployment, you'll see output like:
```
BaseApp Token deployed to: 0x1234567890abcdef1234567890abcdef12345678
Marketing wallet airdrop: 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2
Marketing allocation: 100,000,000 BAPP (10% of supply)

Deployment Summary:
==================
Total Supply: 1,000,000,000.0 BAPP
Marketing Wallet Balance: 100,000,000.0 BAPP
Contract Balance (Available for Sale): 900,000,000.0 BAPP
Initial Price: 0.0001 ETH per BAPP
Trading Enabled: true

Save this contract address to update your frontend:
CONTRACT_ADDRESS = 0x1234567890abcdef1234567890abcdef12345678
```

## Step 5: Update Frontend Configuration

1. Copy the deployed contract address from the deployment output
2. Update your `.env.local` file:

```env
NEXT_PUBLIC_BASE_APP_TOKEN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

3. Restart your development server:
```bash
pnpm dev
```

## Step 6: Verify Contract (Optional)

To verify your contract on BaseScan:

### For Base Mainnet:
```bash
pnpm verify:base 0x1234567890abcdef1234567890abcdef12345678
```

### For Base Sepolia:
```bash
pnpm verify:base-sepolia 0x1234567890abcdef1234567890abcdef12345678
```

## Step 7: Test the Integration

1. Open your mini app: http://localhost:3000
2. Navigate to the "BAPP Token" section
3. Connect your wallet
4. Verify you can see:
   - Current token price
   - Total supply and available tokens
   - Marketing allocation information
   - Your BAPP balance (if you have any)

## Contract Features

### Token Economics
- **Symbol**: BAPP
- **Name**: BaseApp Token
- **Total Supply**: 1,000,000,000 tokens
- **Decimals**: 18
- **Marketing Allocation**: 100,000,000 tokens (automatically sent to marketing wallet)

### Bonding Curve Mechanism
- Starting price: 0.0001 ETH per BAPP
- Price increases by 0.00000001 ETH for every 1,000 tokens sold
- Dynamic pricing creates scarcity and rewards early adopters

### Security Features
- OpenZeppelin ERC20 implementation
- ReentrancyGuard protection
- Owner controls for emergency functions
- Automatic refunds for overpayments

## Trading on Base Network

Once deployed, your BAPP token can be traded on Base network DEXs:

1. **Uniswap V3** (Base): Add liquidity pairs
2. **Aerodrome**: Base's native DEX
3. **BaseSwap**: Community-driven DEX
4. **PancakeSwap** (Base version)

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Marketing wallet received 10% allocation
- [ ] Frontend updated with contract address
- [ ] Contract verified on BaseScan
- [ ] Test purchases working
- [ ] Add liquidity to DEX (optional)
- [ ] Social media announcements

## Troubleshooting

### Common Issues

**"Insufficient funds" error**
- Ensure your wallet has enough ETH for gas fees on Base network

**"Contract not found" error**
- Verify the contract address is correct in your `.env.local`
- Ensure you're on the correct network (Base mainnet vs testnet)

**"Transaction failed" error**
- Check if you have enough ETH to cover the token purchase cost
- Verify the contract has available tokens to sell

### Getting Help

1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure your wallet is connected to Base network
4. Contact support if deployment fails

## Next Steps

After successful deployment:
1. Create social media announcements
2. Set up community Discord/Telegram
3. Plan marketing campaigns using the allocated tokens
4. Consider adding additional utility to your token
5. Monitor trading activity and community growth

Congratulations! Your BaseApp Token is now live on Base network! 🚀