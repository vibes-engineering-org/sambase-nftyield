# NFTYield Splits Contract Deployment Guide

This guide walks you through deploying the NFTYield Splits contract and integrating it with the existing platform for automatic revenue distribution.

## 📋 Prerequisites

### Required Software
- Node.js 18+ and pnpm
- Hardhat development environment
- Wallet with Base Sepolia ETH for testnet deployment

### Required Environment Variables
Create a `.env` file in the root directory:

```bash
# Deployment wallet private key
PRIVATE_KEY=your_private_key_here

# Base network API keys
BASESCAN_API_KEY=your_basescan_api_key

# Optional: Custom wallet addresses (defaults to deployer)
TEAM_WALLET=0x...
FEE_RECIPIENT=0x...
PLATFORM_TREASURY=0x...
```

### Get Testnet ETH
- Visit [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- Request testnet ETH for deployment costs (~0.01 ETH needed)

## 🚀 Deployment Steps

### 1. Compile Contracts
```bash
pnpm hardhat compile
```

### 2. Deploy to Base Sepolia Testnet
```bash
pnpm hardhat run scripts/deploy-testnet.js --network base-sepolia
```

This script will:
- Deploy all NFTYield contracts
- Deploy the new NFTYieldSplits contract
- Create a default test split (ID: 1)
- Save deployment info to `./deployments/`

### 3. Verify Contracts on Basescan
```bash
pnpm hardhat run scripts/verify-contracts.js --network base-sepolia
```

### 4. Update Frontend Configuration

After successful deployment, update the contract addresses in:

#### `src/components/split-contract.tsx`
```typescript
const SPLITS_CONTRACT_ADDRESS = "0xYourDeployedSplitsAddress";
```

#### `src/hooks/useSplitsContract.ts`
```typescript
const SPLITS_CONTRACT_ADDRESS = "0xYourDeployedSplitsAddress";
```

## 📊 Contract Features

### Core Functionality
- **Automatic Marketing Allocation**: 10% to marketing wallet (`0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2`)
- **Custom Revenue Splits**: Configure multiple recipients with custom percentages
- **Multi-Token Support**: ETH and ERC20 token distributions
- **Instant Distribution**: Automatic distribution on payment receipt
- **Multiple Split Configurations**: Create unlimited split configurations

### Security Features
- **Pausable**: Emergency pause functionality
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Access Control**: Owner-only admin functions
- **Input Validation**: Comprehensive parameter validation
- **Emergency Recovery**: Token recovery when paused

### Platform Integration
- **Platform Fees**: 2.5% platform fee (configurable)
- **Fee Recipient**: Configurable fee collection address
- **Basis Points System**: Accurate percentage calculations (10000 = 100%)

## 🧪 Testing the Deployment

### Test Split Creation
```bash
# Using the frontend interface:
1. Connect your wallet
2. Navigate to "Split" tab
3. Create a new split with test recipients
4. Verify split creation on Basescan
```

### Test Fund Distribution
```bash
# Send test ETH to a split:
1. Use the "Send Funds" tab
2. Enter split ID (1 for default test split)
3. Send small amount (0.001 ETH)
4. Verify automatic distribution to recipients
```

## 📝 Contract Addresses Structure

### After Deployment
The deployment script creates a JSON file with all addresses:

```json
{
  "network": "base-sepolia",
  "chainId": 84532,
  "contracts": {
    "BaseAppToken": "0x...",
    "NFTYieldToken": "0x...",
    "TokenBurnEscrow": "0x...",
    "NFTYieldPool": "0x...",
    "NFTYieldFactory": "0x...",
    "NFTYieldSplits": "0x..."
  }
}
```

### Update CONTRACT_ADDRESSES.md
Add the deployed Splits contract address to the contract addresses file:

```markdown
## Base Sepolia Testnet
export const NFT_YIELD_SPLITS_ADDRESS_TESTNET = "0xYourSplitsAddress";

## Base Mainnet (when ready)
export const NFT_YIELD_SPLITS_ADDRESS = "0xYourMainnetSplitsAddress";
```

## 🔄 Mainnet Deployment

For production deployment to Base mainnet:

### 1. Update Network Configuration
```bash
# Use base network instead of base-sepolia
pnpm hardhat run scripts/deploy-testnet.js --network base
```

### 2. Production Environment Variables
```bash
# .env for mainnet
PRIVATE_KEY=your_mainnet_deployer_private_key
TEAM_WALLET=actual_team_wallet_address
FEE_RECIPIENT=actual_fee_recipient_address
PLATFORM_TREASURY=actual_treasury_address
```

### 3. Verify Production Deployment
```bash
pnpm hardhat run scripts/verify-contracts.js --network base
```

## ⚙️ Configuration Options

### Marketing Wallet
- **Fixed Address**: `0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2`
- **Fixed Percentage**: 10% (1000 basis points)
- **Automatically included**: In all splits

### Platform Fees
- **Default Fee**: 2.5% (250 basis points)
- **Maximum Fee**: 10% (1000 basis points)
- **Configurable**: By contract owner only

### Split Validation
- **Total Percentage**: Cannot exceed 100%
- **Minimum Recipients**: At least 1 custom recipient
- **Address Validation**: All recipient addresses validated
- **Name Requirement**: Split names are mandatory

## 🛠️ Troubleshooting

### Common Issues

#### "Insufficient balance for deployment"
- **Solution**: Get more Base Sepolia ETH from faucet
- **Required**: ~0.01 ETH for full deployment

#### "Contract already exists at address"
- **Solution**: Use a different deployer address or nonce
- **Alternative**: Use CREATE2 for deterministic addresses

#### "Total percentage exceeds 100%"
- **Solution**: Ensure marketing (10%) + custom percentages ≤ 100%
- **Example**: Marketing 10% + Recipients 90% = 100% (valid)

#### "Verification failed"
- **Solution**: Ensure constructor arguments match deployment
- **Check**: Network configuration and API keys

### Getting Help

1. **Documentation**: Review existing contract documentation
2. **Testnet**: Always test on Base Sepolia first
3. **Block Explorer**: Verify transactions on Basescan
4. **Community**: Ask questions in development channels

## 📈 Usage Examples

### Create Project Revenue Split
```solidity
// Example: 50-50 split between two developers
recipients = [dev1Address, dev2Address];
percentages = [4500, 4500]; // 45% each (marketing gets 10%)
name = "NFT Project Revenue Split";
```

### Multi-Team Split
```solidity
// Example: Development team split
recipients = [leadDevAddress, dev2Address, designerAddress];
percentages = [4000, 3000, 2000]; // 40%, 30%, 20% (marketing gets 10%)
name = "Development Team Split";
```

### Simple Creator Split
```solidity
// Example: Solo creator with marketing
recipients = [creatorAddress];
percentages = [9000]; // Creator gets 90%, marketing gets 10%
name = "Creator Revenue Split";
```

## 🔒 Security Considerations

### For Testnet
- Use test wallets and small amounts only
- Don't use mainnet private keys
- Test all functionality thoroughly

### For Mainnet
- Use hardware wallets for deployment
- Verify all addresses before deployment
- Consider multi-signature wallets for ownership
- Perform security audit for large-scale deployments

### Smart Contract Security
- All contracts use OpenZeppelin standards
- ReentrancyGuard protects against attacks
- Pausable contracts for emergency stops
- Owner-only functions for critical operations

---

## ✅ Completion Checklist

- [ ] Environment variables configured
- [ ] Testnet ETH obtained
- [ ] Contracts compiled successfully
- [ ] Deployed to Base Sepolia testnet
- [ ] Contracts verified on Basescan
- [ ] Frontend addresses updated
- [ ] Test split created and verified
- [ ] Test fund distribution completed
- [ ] Documentation updated
- [ ] Ready for mainnet deployment

**Deployment completed successfully! The NFTYield Splits contract is now integrated and ready for automatic revenue distribution.**