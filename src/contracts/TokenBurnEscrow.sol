// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TokenBurnEscrow
 * @dev Contract for managing Samish token burning and escrow for NFT yield pools
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
        bool refunded;
        bool poolCompleted;
    }

    mapping(address => EscrowDeposit[]) public userDeposits;
    mapping(string => EscrowDeposit) public poolEscrows;
    mapping(address => uint256) public userBurnedTotal;

    uint256 public totalBurned;
    uint256 public constant BURN_PERCENTAGE = 50; // 50% burned
    uint256 public constant ESCROW_PERCENTAGE = 50; // 50% escrowed
    uint256 public constant INCOMPLETE_REFUND_DELAY = 24 hours; // Safety refund delay

    event TokensDeposited(address indexed user, uint256 burnAmount, uint256 escrowAmount, string poolId);
    event TokensBurned(address indexed user, uint256 amount, string poolId);
    event TokensRefunded(address indexed user, uint256 amount, string poolId);
    event PoolCompleted(string indexed poolId, address indexed user);
    event SafetyRefund(address indexed user, uint256 amount, string poolId);

    error InsufficientTokens();
    error InvalidPoolId();
    error AlreadyProcessed();
    error PoolNotCompleted();
    error TooEarlyForRefund();
    error TransferFailed();
    error InvalidAmount();

    constructor(address _samishToken) {
        samishToken = IERC20(_samishToken);
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
            refunded: false,
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
     * @dev Refund escrowed tokens after pool completion
     */
    function refundEscrow(string calldata poolId) external nonReentrant {
        EscrowDeposit storage deposit = poolEscrows[poolId];

        if (deposit.depositor != msg.sender) revert InvalidPoolId();
        if (deposit.refunded) revert AlreadyProcessed();
        if (!deposit.poolCompleted) revert PoolNotCompleted();

        deposit.refunded = true;

        if (!samishToken.transfer(msg.sender, deposit.escrowAmount)) {
            revert TransferFailed();
        }

        emit TokensRefunded(msg.sender, deposit.escrowAmount, poolId);
    }

    /**
     * @dev Safety refund if user doesn't complete pool creation within 24 hours
     */
    function safetyRefund(string calldata poolId) external nonReentrant {
        EscrowDeposit storage deposit = poolEscrows[poolId];

        if (deposit.depositor != msg.sender) revert InvalidPoolId();
        if (deposit.burned || deposit.refunded) revert AlreadyProcessed();
        if (block.timestamp < deposit.depositTime + INCOMPLETE_REFUND_DELAY) {
            revert TooEarlyForRefund();
        }

        deposit.refunded = true;
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
               !deposit.refunded &&
               block.timestamp >= deposit.depositTime + INCOMPLETE_REFUND_DELAY;
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