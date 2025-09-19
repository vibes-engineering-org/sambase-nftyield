# Contract Addresses - NFTYield Platform

## 🚨 IMPORTANT NOTICE

**These are placeholder addresses. You must update them with actual deployed addresses before using in production.**

## 📋 Base Network Mainnet (Chain ID: 8453)

### Core Platform Contracts
```javascript
// NFTYield Token (NFTY)
export const NFTYIELD_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

// Token Burn Escrow (Samish Management)
export const TOKEN_BURN_ESCROW_ADDRESS = "0x0000000000000000000000000000000000000000";

// NFT Yield Pool (Main Farming Contract)
export const NFT_YIELD_POOL_ADDRESS = "0x0000000000000000000000000000000000000000";

// NFT Yield Factory (Pool Deployment)
export const NFT_YIELD_FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000";
```

### External Token Addresses
```javascript
// Samish Creator Token (existing)
export const SAMISH_TOKEN_ADDRESS = "0x086bb3d90d719eb50d569e071b9987080ecb9781";
```

### Platform Configuration Wallets
```javascript
// Fee Collection
export const FEE_RECIPIENT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Lottery System
export const LOTTERY_WALLET_ADDRESS = "0x0000000000000000000000000000000000000000";

// Token Distribution
export const TEAM_WALLET_ADDRESS = "0x0000000000000000000000000000000000000000";
export const COMMUNITY_POOL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const LIQUIDITY_POOL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const PLATFORM_TREASURY_ADDRESS = "0x0000000000000000000000000000000000000000";
```

## 🧪 Base Sepolia Testnet (Chain ID: 84532)

### Core Platform Contracts
```javascript
// NFTYield Token (NFTY) - Testnet
export const NFTYIELD_TOKEN_ADDRESS_TESTNET = "0x0000000000000000000000000000000000000000";

// Token Burn Escrow - Testnet
export const TOKEN_BURN_ESCROW_ADDRESS_TESTNET = "0x0000000000000000000000000000000000000000";

// NFT Yield Pool - Testnet
export const NFT_YIELD_POOL_ADDRESS_TESTNET = "0x0000000000000000000000000000000000000000";

// NFT Yield Factory - Testnet
export const NFT_YIELD_FACTORY_ADDRESS_TESTNET = "0x0000000000000000000000000000000000000000";
```

## 📝 How to Update Addresses

After deploying contracts, update the following files:

### 1. Frontend Hooks
- `src/hooks/useTokenBurnEscrow.ts`
- `src/hooks/useNFTYieldToken.ts`
- `src/hooks/useNFTYieldPool.ts`

### 2. Configuration Files
- `src/lib/constants.ts` (create this file)
- `src/contracts/deployments/latest-deployment.json`

### 3. Environment Variables
Add to `.env.local`:
```bash
NEXT_PUBLIC_NFTYIELD_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_BURN_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_NFT_YIELD_POOL_ADDRESS=0x...
NEXT_PUBLIC_NFT_YIELD_FACTORY_ADDRESS=0x...
```

## 🔗 Block Explorer Links

### Mainnet (Base)
- [Base Block Explorer](https://basescan.org/)
- Contract verification required for each deployed contract

### Testnet (Base Sepolia)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- Use for testing and development

## 📊 Contract Verification Status

| Contract | Mainnet | Testnet | Status |
|----------|---------|---------|--------|
| NFTYieldToken | ❌ | ❌ | Not Deployed |
| TokenBurnEscrow | ❌ | ❌ | Not Deployed |
| NFTYieldPool | ❌ | ❌ | Not Deployed |
| NFTYieldFactory | ❌ | ❌ | Not Deployed |

**Legend**: ✅ Verified | ❌ Not Deployed | ⏳ Pending

## 🛠️ Deployment Checklist

### Pre-Deployment
- [ ] Configure deployment environment variables
- [ ] Verify constructor parameters
- [ ] Test on local hardhat network
- [ ] Deploy to testnet first

### During Deployment
- [ ] Deploy contracts in correct order
- [ ] Verify constructor arguments
- [ ] Note down transaction hashes
- [ ] Save deployment addresses

### Post-Deployment
- [ ] Verify contracts on block explorer
- [ ] Update frontend configuration
- [ ] Test all contract interactions
- [ ] Update this document with real addresses

## 🔐 Security Notes

### Address Validation
Always validate addresses before updating:
- Ensure addresses are valid Ethereum addresses
- Verify they are deployed on the correct network
- Confirm contracts are verified on block explorer

### Multi-Signature Recommendations
For production deployment, consider using multi-signature wallets for:
- Contract ownership
- Treasury management
- Platform fee collection
- Emergency operations

## 📞 Support Information

If you encounter issues with contract addresses or deployment:

1. Check the deployment logs in `src/contracts/deployments/`
2. Verify the network configuration in `hardhat.config.js`
3. Ensure all environment variables are set correctly
4. Contact the development team for assistance

---

**Remember**: Never use placeholder addresses in production. Always deploy and verify contracts before updating these addresses in your application.