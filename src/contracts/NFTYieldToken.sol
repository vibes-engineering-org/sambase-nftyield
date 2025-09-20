// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFTYieldToken (NFTY)
 * @dev Utility token for the NFTYield platform
 * Features:
 * - Governance rights
 * - Platform fee discounts
 * - Premium feature access
 * - Reward distribution
 */
contract NFTYieldToken is ERC20, ERC20Burnable, Pausable, Ownable, ReentrancyGuard {

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial

    // Tokenomics
    uint256 public constant TEAM_ALLOCATION = 15; // 15%
    uint256 public constant COMMUNITY_REWARDS = 35; // 35% (reduced from 40%)
    uint256 public constant LIQUIDITY_POOL = 25; // 25%
    uint256 public constant PLATFORM_TREASURY = 15; // 15% (reduced from 20%)
    uint256 public constant SPECIAL_ALLOCATION = 10; // 10% for 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2

    // Addresses for token distribution
    address public teamWallet;
    address public communityRewardsPool;
    address public liquidityPool;
    address public platformTreasury;
    address public constant specialWallet = 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2;

    // Vesting
    mapping(address => VestingSchedule) public vestingSchedules;
    uint256 public constant VESTING_DURATION = 365 days; // 1 year vesting
    uint256 public constant CLIFF_DURATION = 90 days; // 3 month cliff

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        bool isActive;
    }

    // Staking rewards
    mapping(address => StakingInfo) public stakingInfo;
    uint256 public totalStaked;
    uint256 public rewardRate = 1000; // 10% APY (in basis points)
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    struct StakingInfo {
        uint256 stakedAmount;
        uint256 lastUpdateTime;
        uint256 rewardDebt;
    }

    // Fee discounts for token holders
    mapping(uint256 => uint256) public tierDiscounts; // tier => discount percentage

    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount);
    event TokensVested(address indexed beneficiary, uint256 amount);
    event TierDiscountUpdated(uint256 tier, uint256 discount);

    error InsufficientBalance();
    error InvalidAmount();
    error VestingNotStarted();
    error NoTokensVested();
    error InvalidVestingSchedule();
    error MaxSupplyExceeded();
    error InvalidAddress();

    constructor(
        address _teamWallet,
        address _communityRewardsPool,
        address _liquidityPool,
        address _platformTreasury
    ) ERC20("NFTYIELD", "NFTY") {
        if (_teamWallet == address(0) ||
            _communityRewardsPool == address(0) ||
            _liquidityPool == address(0) ||
            _platformTreasury == address(0)) {
            revert InvalidAddress();
        }

        teamWallet = _teamWallet;
        communityRewardsPool = _communityRewardsPool;
        liquidityPool = _liquidityPool;
        platformTreasury = _platformTreasury;

        // Initial distribution
        _mint(teamWallet, (INITIAL_SUPPLY * TEAM_ALLOCATION) / 100);
        _mint(communityRewardsPool, (INITIAL_SUPPLY * COMMUNITY_REWARDS) / 100);
        _mint(liquidityPool, (INITIAL_SUPPLY * LIQUIDITY_POOL) / 100);
        _mint(platformTreasury, (INITIAL_SUPPLY * PLATFORM_TREASURY) / 100);
        _mint(specialWallet, (INITIAL_SUPPLY * SPECIAL_ALLOCATION) / 100);

        // Set up tier discounts
        tierDiscounts[1] = 5;   // 5% discount for 1000+ NFTY
        tierDiscounts[2] = 10;  // 10% discount for 10000+ NFTY
        tierDiscounts[3] = 15;  // 15% discount for 50000+ NFTY
        tierDiscounts[4] = 25;  // 25% discount for 100000+ NFTY
    }

    /**
     * @dev Mint new tokens (only owner, up to max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded();
        }
        _mint(to, amount);
    }

    /**
     * @dev Create vesting schedule for beneficiary
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount
    ) external onlyOwner {
        if (beneficiary == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (vestingSchedules[beneficiary].isActive) revert InvalidVestingSchedule();

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            claimedAmount: 0,
            startTime: block.timestamp,
            isActive: true
        });

        // Transfer tokens to this contract for vesting
        _transfer(msg.sender, address(this), amount);

        emit VestingScheduleCreated(beneficiary, amount);
    }

    /**
     * @dev Claim vested tokens
     */
    function claimVestedTokens() external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];

        if (!schedule.isActive) revert InvalidVestingSchedule();
        if (block.timestamp < schedule.startTime + CLIFF_DURATION) {
            revert VestingNotStarted();
        }

        uint256 vestedAmount = calculateVestedAmount(msg.sender);
        uint256 claimableAmount = vestedAmount - schedule.claimedAmount;

        if (claimableAmount == 0) revert NoTokensVested();

        schedule.claimedAmount += claimableAmount;
        _transfer(address(this), msg.sender, claimableAmount);

        emit TokensVested(msg.sender, claimableAmount);
    }

    /**
     * @dev Calculate vested amount for beneficiary
     */
    function calculateVestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];

        if (!schedule.isActive) return 0;
        if (block.timestamp < schedule.startTime + CLIFF_DURATION) return 0;

        uint256 timeElapsed = block.timestamp - schedule.startTime;

        if (timeElapsed >= VESTING_DURATION) {
            return schedule.totalAmount;
        }

        return (schedule.totalAmount * timeElapsed) / VESTING_DURATION;
    }

    /**
     * @dev Stake tokens to earn rewards
     */
    function stakeTokens(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        StakingInfo storage info = stakingInfo[msg.sender];

        // Update rewards before changing stake
        _updateRewards(msg.sender);

        // Transfer tokens to staking
        _transfer(msg.sender, address(this), amount);

        info.stakedAmount += amount;
        totalStaked += amount;

        emit TokensStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstakeTokens(uint256 amount) external nonReentrant {
        StakingInfo storage info = stakingInfo[msg.sender];

        if (amount == 0) revert InvalidAmount();
        if (info.stakedAmount < amount) revert InsufficientBalance();

        // Update rewards before unstaking
        _updateRewards(msg.sender);

        info.stakedAmount -= amount;
        totalStaked -= amount;

        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external nonReentrant {
        _updateRewards(msg.sender);

        StakingInfo storage info = stakingInfo[msg.sender];
        uint256 rewards = info.rewardDebt;

        if (rewards == 0) return;

        info.rewardDebt = 0;

        // Mint rewards (within max supply limit)
        if (totalSupply() + rewards <= MAX_SUPPLY) {
            _mint(msg.sender, rewards);
        } else {
            // If minting would exceed max supply, transfer from treasury
            uint256 treasuryBalance = balanceOf(platformTreasury);
            if (treasuryBalance >= rewards) {
                _transfer(platformTreasury, msg.sender, rewards);
            }
        }

        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Update staking rewards for user
     */
    function _updateRewards(address user) internal {
        StakingInfo storage info = stakingInfo[user];

        if (info.stakedAmount > 0) {
            uint256 timeElapsed = block.timestamp - info.lastUpdateTime;
            uint256 rewards = (info.stakedAmount * rewardRate * timeElapsed) /
                             (10000 * SECONDS_PER_YEAR);

            info.rewardDebt += rewards;
        }

        info.lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Get user's tier based on balance
     */
    function getUserTier(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);

        if (balance >= 100000 * 10**18) return 4; // 100k+ NFTY
        if (balance >= 50000 * 10**18) return 3;  // 50k+ NFTY
        if (balance >= 10000 * 10**18) return 2;  // 10k+ NFTY
        if (balance >= 1000 * 10**18) return 1;   // 1k+ NFTY
        return 0;
    }

    /**
     * @dev Get discount percentage for user
     */
    function getUserDiscount(address user) external view returns (uint256) {
        uint256 tier = this.getUserTier(user);
        return tierDiscounts[tier];
    }

    /**
     * @dev Calculate pending staking rewards
     */
    function pendingRewards(address user) external view returns (uint256) {
        StakingInfo memory info = stakingInfo[user];

        if (info.stakedAmount == 0) return info.rewardDebt;

        uint256 timeElapsed = block.timestamp - info.lastUpdateTime;
        uint256 newRewards = (info.stakedAmount * rewardRate * timeElapsed) /
                           (10000 * SECONDS_PER_YEAR);

        return info.rewardDebt + newRewards;
    }

    /**
     * @dev Update tier discount (only owner)
     */
    function updateTierDiscount(uint256 tier, uint256 discount) external onlyOwner {
        tierDiscounts[tier] = discount;
        emit TierDiscountUpdated(tier, discount);
    }

    /**
     * @dev Update reward rate (only owner)
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override to prevent transfers when paused
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "NFTYieldToken: token transfer while paused");
    }
}