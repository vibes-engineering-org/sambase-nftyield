# Smart Contracts Overview - NFTYield Platform

This document provides a comprehensive overview of all smart contracts in the NFTYield platform.

## 📋 Contract Architecture

```
NFTYield Platform
├── NFTYieldToken.sol (NFTY Token)
├── TokenBurnEscrow.sol (Samish Token Management)
├── NFTYieldPool.sol (Core Yield Farming)
└── NFTYieldFactory.sol (Pool Deployment)
```

## 🪙 NFTYieldToken.sol (NFTY)

**Purpose**: Platform utility token with governance, staking, and discount features.

### Key Features
- **ERC-20 Standard**: Standard token functionality
- **Burnable**: Tokens can be burned to reduce supply
- **Staking System**: Users can stake tokens to earn rewards
- **Tier-Based Discounts**: Platform fee discounts based on holdings
- **Vesting Schedules**: Team and investor token vesting
- **Governance Ready**: Prepared for future DAO governance

### Important Functions
```solidity
// Staking
function stakeTokens(uint256 amount) external
function unstakeTokens(uint256 amount) external
function claimStakingRewards() external

// Vesting
function createVestingSchedule(address beneficiary, uint256 amount) external
function claimVestedTokens() external

// Utility
function getUserTier(address user) external view returns (uint256)
function getUserDiscount(address user) external view returns (uint256)
```

### Token Economics
- **Max Supply**: 1,000,000,000 NFTY (1 billion)
- **Initial Supply**: 100,000,000 NFTY (100 million)
- **Staking APY**: 10% (configurable)
- **Vesting Period**: 365 days with 90-day cliff

### Discount Tiers
| Tier | Requirement | Discount |
|------|-------------|----------|
| Bronze | 0 NFTY | 0% |
| Silver | 1,000 NFTY | 5% |
| Gold | 10,000 NFTY | 10% |
| Platinum | 50,000 NFTY | 15% |
| Diamond | 100,000 NFTY | 25% |

## 🔥 TokenBurnEscrow.sol

**Purpose**: Manages Samish token burning and lottery system for pool entry fees.

### Key Features
- **Token Burning**: Burns 50% of deposited Samish tokens
- **Escrow System**: Holds 50% for refund after pool completion
- **Lottery System**: Distributes escrowed tokens through lottery
- **Safety Refunds**: Protects users if pools aren't created
- **Monthly Lottery**: Large accumulated reward distribution

### Important Functions
```solidity
// Pool Entry
function depositForPool(uint256 totalAmount, uint256 poolDuration, string calldata poolId) external
function burnTokensForPool(string calldata poolId) external

// Pool Management
function completePool(string calldata poolId) external
function enterLottery(string calldata poolId) external

// Safety Features
function safetyRefund(string calldata poolId) external

// Lottery
function executeMonthlyLottery() external
```

### Tokenomics
- **Burn Rate**: 50% of deposited tokens
- **Escrow Rate**: 50% held for lottery/refund
- **Entry Fee**: $10 worth of Samish tokens per pool
- **Safety Refund**: Available after 24 hours if pool not created

### Lottery Mechanics
- **Immediate Lottery**: 50% of escrow → immediate random winner
- **Monthly Lottery**: 50% of escrow → monthly accumulated pot
- **Eligibility**: Must complete full cycle (buy, burn, complete pool)

## 🏊 NFTYieldPool.sol

**Purpose**: Core yield farming contract where NFT holders earn token rewards.

### Key Features
- **Multiple Pool Types**: Public, Whitelist, Premium pools
- **NFT-Based Rewards**: Rewards proportional to NFT holdings
- **Flexible Duration**: 1-90 day pool periods
- **Participation Limits**: Configurable maximum participants
- **Automatic Distribution**: Proportional reward calculation
- **Pool Completion**: Automated pool lifecycle management

### Important Functions
```solidity
// Pool Management
function createPool(...) external payable
function joinPool(uint256 poolId) external
function completePool(uint256 poolId) external

// Rewards
function claimRewards(uint256 poolId) external
function calculatePendingRewards(uint256 poolId, address user) external view

// Access Control
function addToWhitelist(uint256 poolId, address[] calldata users) external
```

### Pool Types
- **PUBLIC**: Anyone can join
- **WHITELIST**: Only whitelisted addresses
- **PREMIUM**: Only NFTY token holders (1000+ NFTY required)

### Creation Fees
- **Public Pool**: 0.01 ETH
- **Whitelist Pool**: 0.02 ETH
- **Premium Pool**: 0.005 ETH (50% discount)

### Platform Fees
- **Default**: 2.5% of reward tokens
- **Discounted**: Based on NFTY holder tier (up to 25% off)

## 🏭 NFTYieldFactory.sol

**Purpose**: Factory contract for deploying pool templates with different configurations.

### Key Features
- **Template System**: Pre-configured pool templates
- **Minimal Proxy Pattern**: Gas-efficient pool deployment
- **Template Management**: Add/update/disable templates
- **Deterministic Addresses**: Predictable deployment addresses
- **Cost Estimation**: Calculate deployment costs

### Important Functions
```solidity
// Deployment
function deployPool(uint256 templateId, string calldata poolName, bytes calldata initData) external payable

// Template Management
function createTemplate(...) external
function updateTemplateStatus(uint256 templateId, bool isActive) external

// Utilities
function predictPoolAddress(address deployer) external view
function getActiveTemplates() external view
```

### Default Templates
1. **Standard Yield Pool**: Basic features, 2.5% fee
2. **Premium Yield Pool**: Enhanced features, 1.5% fee
3. **Community Pool**: Governance features, 2.0% fee

## 🔒 Security Features

### Access Control
- **Ownable**: Admin functions protected by ownership
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause functionality

### Input Validation
- Address zero checks
- Amount validation
- Duration bounds checking
- Pool state validation

### Economic Security
- **Platform Fees**: Sustainable revenue model
- **Minimum Requirements**: Prevent spam/abuse
- **Safety Refunds**: User protection mechanism
- **Maximum Supply**: Token inflation protection

## 🧪 Testing & Verification

### Test Coverage
- Unit tests for all major functions
- Integration tests for cross-contract interactions
- Edge case testing for security scenarios
- Gas optimization testing

### Verification Steps
1. Contract compilation
2. Deployment to testnet
3. Function testing
4. Economic model validation
5. Security audit
6. Mainnet deployment

## 📊 Gas Optimization

### Strategies Used
- **Minimal Proxy Pattern**: Reduced deployment costs
- **Packed Structs**: Optimized storage layout
- **Batch Operations**: Reduce transaction overhead
- **Event Optimization**: Efficient event emission

### Estimated Gas Costs
- **Token Deployment**: ~2.5M gas
- **Pool Creation**: ~200K gas
- **Join Pool**: ~80K gas
- **Claim Rewards**: ~60K gas

## 🔄 Upgrade Strategy

### Current Approach
- **Immutable Contracts**: No proxy pattern for core contracts
- **Factory Pattern**: New implementations through factory
- **Migration Functions**: If needed for major updates

### Future Considerations
- **Governance System**: Community-controlled upgrades
- **Proxy Pattern**: For non-critical components
- **Backward Compatibility**: Maintain API consistency

## 🚨 Emergency Procedures

### Pause Functionality
All critical contracts can be paused by owner in emergency:
- Token transfers
- Pool creation/joining
- Reward claiming
- Lottery execution

### Recovery Mechanisms
- **Emergency Token Recovery**: Owner can recover stuck tokens when paused
- **Safety Refunds**: Users can recover funds from incomplete pools
- **Manual Completion**: Admin can manually complete stuck pools

## 📈 Monitoring & Analytics

### Key Metrics to Track
- Total Value Locked (TVL)
- Number of active pools
- Token burn rate
- Lottery participation
- Platform fee revenue
- User engagement metrics

### Events for Analytics
- Pool creation and completion
- User participation
- Reward distributions
- Token burns and lottery wins
- Staking activities

## 🛠️ Integration Guide

### Frontend Integration
1. Import contract ABIs
2. Configure Web3 provider
3. Implement contract hooks
4. Handle transaction states
5. Display real-time data

### Third-Party Integration
- **DEX Integration**: Token trading
- **NFT Marketplaces**: Collection verification
- **Analytics Platforms**: Data indexing
- **Wallet Integration**: Multi-wallet support

---

**Note**: All contracts are developed with security best practices and use OpenZeppelin libraries for standard functionality. Regular audits and testing are recommended before mainnet deployment.