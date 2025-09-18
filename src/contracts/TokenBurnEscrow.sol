// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TokenBurnEscrow
 * @dev Contract for managing Samish token burning and lottery rewards for NFT yield pools
 * Instead of refunding escrowed tokens, they go into automated lottery system
 */
contract TokenBurnEscrow is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable samishToken;

    struct EscrowDeposit {
        uint256 burnAmount;      // Amount to be burned (50% of total)
        uint256 escrowAmount;    // Amount held in escrow (50% of total)
        uint256 depositTime;
        uint256 poolDuration;    // Pool duration in seconds
        address depositor;
        string poolId;
        bool burned;
        bool lotteryEntered;     // Replaced refunded with lottery entry
        bool poolCompleted;
    }

    struct LotteryEntry {
        address user;
        string poolId;
        uint256 amount;
        uint256 timestamp;
        bool eligible;           // Has burned tokens, purchased $10, completed pool
    }

    mapping(address => EscrowDeposit[]) public userDeposits;
    mapping(string => EscrowDeposit) public poolEscrows;
    mapping(address => uint256) public userBurnedTotal;
    mapping(address => bool) public hasCompletedFullCycle; // Burned + purchased + completed

    // Lottery system
    LotteryEntry[] public lotteryEntries;
    mapping(address => uint256) public userLotteryEntries;
    uint256 public lotteryPool;              // Accumulated monthly lottery pool
    uint256 public lastLotteryTime;          // Last lottery execution time
    uint256 public constant LOTTERY_INTERVAL = 30 days; // Monthly lottery
    address public lotteryWallet;            // Secure wallet for lottery funds

    uint256 public totalBurned;
    uint256 public constant BURN_PERCENTAGE = 50; // 50% burned
    uint256 public constant ESCROW_PERCENTAGE = 50; // 50% escrowed
    uint256 public constant INCOMPLETE_REFUND_DELAY = 24 hours; // Safety refund delay

    event TokensDeposited(address indexed user, uint256 burnAmount, uint256 escrowAmount, string poolId);
    event TokensBurned(address indexed user, uint256 amount, string poolId);
    event LotteryEntryAdded(address indexed user, uint256 amount, string poolId);
    event PoolCompleted(string indexed poolId, address indexed user);
    event SafetyRefund(address indexed user, uint256 amount, string poolId);
    event LotteryWinnerSelected(address indexed winner, uint256 amount, string poolId);
    event MonthlyLotteryExecuted(address indexed winner, uint256 totalPayout);
    event LotteryWalletUpdated(address indexed oldWallet, address indexed newWallet);

    error InsufficientTokens();
    error InvalidPoolId();
    error AlreadyProcessed();
    error PoolNotCompleted();
    error TooEarlyForRefund();
    error TransferFailed();
    error InvalidAmount();
    error InvalidLotteryWallet();
    error LotteryTooSoon();
    error NoEligibleEntries();

    constructor(address _samishToken, address _lotteryWallet) {
        samishToken = IERC20(_samishToken);
        lotteryWallet = _lotteryWallet;
        lastLotteryTime = block.timestamp;
    }

    /**
     * @dev Deposit tokens for pool creation - burns 50%, escrows 50%
     */
    function depositForPool(
        uint256 totalAmount,
        uint256 poolDuration,
        string calldata poolId
    ) external nonReentrant whenNotPaused {
        if (totalAmount == 0) revert InvalidAmount();
        if (bytes(poolId).length == 0) revert InvalidPoolId();

        uint256 burnAmount = (totalAmount * BURN_PERCENTAGE) / 100;
        uint256 escrowAmount = totalAmount - burnAmount;

        // Transfer tokens from user
        if (!samishToken.transferFrom(msg.sender, address(this), totalAmount)) {
            revert TransferFailed();
        }

        // Create escrow record
        EscrowDeposit memory deposit = EscrowDeposit({
            burnAmount: burnAmount,
            escrowAmount: escrowAmount,
            depositTime: block.timestamp,
            poolDuration: poolDuration,
            depositor: msg.sender,
            poolId: poolId,
            burned: false,
            lotteryEntered: false,
            poolCompleted: false
        });

        userDeposits[msg.sender].push(deposit);
        poolEscrows[poolId] = deposit;

        emit TokensDeposited(msg.sender, burnAmount, escrowAmount, poolId);
    }

    /**
     * @dev Burn tokens immediately after pool creation
     */
    function burnTokensForPool(string calldata poolId) external nonReentrant {
        EscrowDeposit storage deposit = poolEscrows[poolId];

        if (deposit.depositor != msg.sender) revert InvalidPoolId();
        if (deposit.burned) revert AlreadyProcessed();

        deposit.burned = true;
        userBurnedTotal[msg.sender] += deposit.burnAmount;
        totalBurned += deposit.burnAmount;

        // Burn tokens by transferring to dead address
        address deadAddress = address(0x000000000000000000000000000000000000dEaD);
        if (!samishToken.transfer(deadAddress, deposit.burnAmount)) {
            revert TransferFailed();
        }

        emit TokensBurned(msg.sender, deposit.burnAmount, poolId);
    }

    /**
     * @dev Mark pool as completed and allow escrow refund
     */
    function completePool(string calldata poolId) external nonReentrant {
        EscrowDeposit storage deposit = poolEscrows[poolId];

        if (deposit.depositor != msg.sender) revert InvalidPoolId();
        if (deposit.poolCompleted) revert AlreadyProcessed();
        if (block.timestamp < deposit.depositTime + deposit.poolDuration) {
            revert PoolNotCompleted();
        }

        deposit.poolCompleted = true;

        emit PoolCompleted(poolId, msg.sender);
    }

    /**
     * @dev Enter escrowed tokens into lottery system after pool completion
     */
    function enterLottery(string calldata poolId) external nonReentrant {
        EscrowDeposit storage deposit = poolEscrows[poolId];

        if (deposit.depositor != msg.sender) revert InvalidPoolId();
        if (deposit.lotteryEntered) revert AlreadyProcessed();
        if (!deposit.poolCompleted) revert PoolNotCompleted();

        deposit.lotteryEntered = true;

        // Mark user as having completed full cycle (burned + purchased + completed pool)
        hasCompletedFullCycle[msg.sender] = true;

        // Split escrow amount: $5 for immediate lottery, $5 for monthly pool
        uint256 immediateReward = deposit.escrowAmount / 2;
        uint256 monthlyPoolAmount = deposit.escrowAmount - immediateReward;

        // Add to monthly lottery pool
        lotteryPool += monthlyPoolAmount;

        // Create lottery entry for immediate reward
        LotteryEntry memory entry = LotteryEntry({
            user: msg.sender,
            poolId: poolId,
            amount: immediateReward,
            timestamp: block.timestamp,
            eligible: true
        });

        lotteryEntries.push(entry);
        userLotteryEntries[msg.sender]++;

        // Select random winner for immediate reward
        _selectRandomWinner(immediateReward);

        emit LotteryEntryAdded(msg.sender, deposit.escrowAmount, poolId);
    }

    /**
     * @dev Safety refund if user doesn't complete pool creation within 24 hours
     */
    function safetyRefund(string calldata poolId) external nonReentrant {
        EscrowDeposit storage deposit = poolEscrows[poolId];

        if (deposit.depositor != msg.sender) revert InvalidPoolId();
        if (deposit.burned || deposit.lotteryEntered) revert AlreadyProcessed();
        if (block.timestamp < deposit.depositTime + INCOMPLETE_REFUND_DELAY) {
            revert TooEarlyForRefund();
        }

        deposit.lotteryEntered = true;
        uint256 refundAmount = deposit.burnAmount + deposit.escrowAmount;

        if (!samishToken.transfer(msg.sender, refundAmount)) {
            revert TransferFailed();
        }

        emit SafetyRefund(msg.sender, refundAmount, poolId);
    }

    /**
     * @dev Get user's deposit history
     */
    function getUserDeposits(address user) external view returns (EscrowDeposit[] memory) {
        return userDeposits[user];
    }

    /**
     * @dev Get pool escrow details
     */
    function getPoolEscrow(string calldata poolId) external view returns (EscrowDeposit memory) {
        return poolEscrows[poolId];
    }

    /**
     * @dev Check if pool can be completed
     */
    function canCompletePool(string calldata poolId) external view returns (bool) {
        EscrowDeposit memory deposit = poolEscrows[poolId];
        return block.timestamp >= deposit.depositTime + deposit.poolDuration;
    }

    /**
     * @dev Check if safety refund is available
     */
    function canSafetyRefund(string calldata poolId) external view returns (bool) {
        EscrowDeposit memory deposit = poolEscrows[poolId];
        return !deposit.burned &&
               !deposit.lotteryEntered &&
               block.timestamp >= deposit.depositTime + INCOMPLETE_REFUND_DELAY;
    }

    /**
     * @dev Internal function to select random winner for immediate reward
     */
    function _selectRandomWinner(uint256 amount) internal {
        if (lotteryEntries.length == 0) return;

        // Simple pseudo-random selection using block properties
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            block.coinbase,
            lotteryEntries.length
        ))) % lotteryEntries.length;

        address winner = lotteryEntries[randomIndex].user;
        string memory winningPoolId = lotteryEntries[randomIndex].poolId;

        // Transfer to lottery wallet temporarily then to winner
        if (!samishToken.transfer(lotteryWallet, amount)) {
            revert TransferFailed();
        }

        emit LotteryWinnerSelected(winner, amount, winningPoolId);
    }

    /**
     * @dev Execute monthly lottery - can be called by anyone after interval
     */
    function executeMonthlyLottery() external nonReentrant {
        if (block.timestamp < lastLotteryTime + LOTTERY_INTERVAL) {
            revert LotteryTooSoon();
        }

        if (lotteryEntries.length == 0 || lotteryPool == 0) {
            revert NoEligibleEntries();
        }

        // Find eligible entries (users who completed full cycle)
        address[] memory eligibleUsers = new address[](lotteryEntries.length);
        uint256 eligibleCount = 0;

        for (uint256 i = 0; i < lotteryEntries.length; i++) {
            if (hasCompletedFullCycle[lotteryEntries[i].user]) {
                eligibleUsers[eligibleCount] = lotteryEntries[i].user;
                eligibleCount++;
            }
        }

        if (eligibleCount == 0) {
            revert NoEligibleEntries();
        }

        // Select random winner from eligible users
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            block.coinbase,
            eligibleCount
        ))) % eligibleCount;

        address winner = eligibleUsers[randomIndex];
        uint256 totalPayout = lotteryPool;

        // Reset lottery state
        lotteryPool = 0;
        lastLotteryTime = block.timestamp;

        // Transfer accumulated pool to winner via lottery wallet
        if (!samishToken.transfer(lotteryWallet, totalPayout)) {
            revert TransferFailed();
        }

        emit MonthlyLotteryExecuted(winner, totalPayout);
    }

    /**
     * @dev Update lottery wallet address (only owner)
     */
    function updateLotteryWallet(address _newLotteryWallet) external onlyOwner {
        if (_newLotteryWallet == address(0)) {
            revert InvalidLotteryWallet();
        }

        address oldWallet = lotteryWallet;
        lotteryWallet = _newLotteryWallet;

        emit LotteryWalletUpdated(oldWallet, _newLotteryWallet);
    }

    /**
     * @dev Get lottery statistics
     */
    function getLotteryStats() external view returns (
        uint256 totalEntries,
        uint256 currentPool,
        uint256 nextLotteryTime,
        uint256 eligibleUsers
    ) {
        totalEntries = lotteryEntries.length;
        currentPool = lotteryPool;
        nextLotteryTime = lastLotteryTime + LOTTERY_INTERVAL;

        // Count eligible users
        eligibleUsers = 0;
        for (uint256 i = 0; i < lotteryEntries.length; i++) {
            if (hasCompletedFullCycle[lotteryEntries[i].user]) {
                eligibleUsers++;
            }
        }
    }

    /**
     * @dev Check if monthly lottery can be executed
     */
    function canExecuteMonthlyLottery() external view returns (bool) {
        return block.timestamp >= lastLotteryTime + LOTTERY_INTERVAL &&
               lotteryEntries.length > 0 &&
               lotteryPool > 0;
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency token recovery (only owner, only if paused)
     */
    function emergencyRecover(address token, uint256 amount) external onlyOwner whenPaused {
        IERC20(token).transfer(owner(), amount);
    }
}