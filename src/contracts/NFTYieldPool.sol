// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NFTYieldPool
 * @dev Main contract for NFT yield generation pools
 * Allows users to create pools where NFT holders earn token rewards
 */
contract NFTYieldPool is ReentrancyGuard, Ownable, Pausable {

    struct YieldPool {
        uint256 poolId;
        address creator;
        address nftCollection;
        address rewardToken;
        uint256 totalRewardAmount;
        uint256 rewardPerNFT;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        uint256 participantCount;
        bool isActive;
        bool isCompleted;
        uint256 minimumNFTBalance;
        uint256 maxParticipants;
        PoolType poolType;
    }

    enum PoolType {
        PUBLIC,      // Anyone can join
        WHITELIST,   // Only whitelisted addresses
        PREMIUM      // Only NFTY token holders
    }

    struct Participant {
        address user;
        uint256 nftBalance;
        uint256 rewardsClaimed;
        uint256 joinTime;
        bool isActive;
    }

    Counters.Counter private _poolIdCounter;

    // Pool storage
    mapping(uint256 => YieldPool) public pools;
    mapping(uint256 => mapping(address => Participant)) public poolParticipants;
    mapping(uint256 => address[]) public poolParticipantsList;
    mapping(uint256 => mapping(address => bool)) public whitelistedUsers;

    // User tracking
    mapping(address => uint256[]) public userActivePools;
    mapping(address => uint256) public userTotalEarned;

    // Platform settings
    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeRecipient;
    address public nftyToken;
    uint256 public minimumNFTYBalance = 1000 * 10**18; // 1000 NFTY for premium pools

    // Pool creation costs
    uint256 public poolCreationFee = 0.01 ether; // Base network ETH
    mapping(PoolType => uint256) public poolTypeFees;

    event PoolCreated(
        uint256 indexed poolId,
        address indexed creator,
        address nftCollection,
        address rewardToken,
        uint256 totalRewardAmount,
        uint256 duration
    );

    event UserJoinedPool(
        uint256 indexed poolId,
        address indexed user,
        uint256 nftBalance
    );

    event RewardsClaimed(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount
    );

    event PoolCompleted(
        uint256 indexed poolId,
        uint256 totalParticipants,
        uint256 totalRewardsDistributed
    );

    event WhitelistUpdated(
        uint256 indexed poolId,
        address indexed user,
        bool isWhitelisted
    );

    error InvalidPoolId();
    error InsufficientPayment();
    error InsufficientNFTBalance();
    error InsufficientNFTYBalance();
    error PoolNotActive();
    error PoolExpired();
    error AlreadyParticipating();
    error NotParticipating();
    error NoRewardsToClaim();
    error InvalidPoolParameters();
    error NotWhitelisted();
    error PoolFull();
    error TransferFailed();
    error InvalidAddress();

    constructor(
        address _feeRecipient,
        address _nftyToken
    ) {
        if (_feeRecipient == address(0) || _nftyToken == address(0)) {
            revert InvalidAddress();
        }

        feeRecipient = _feeRecipient;
        nftyToken = _nftyToken;

        // Set pool type creation fees
        poolTypeFees[PoolType.PUBLIC] = 0.01 ether;
        poolTypeFees[PoolType.WHITELIST] = 0.02 ether;
        poolTypeFees[PoolType.PREMIUM] = 0.005 ether; // Discount for premium
    }

    /**
     * @dev Create a new yield pool
     */
    function createPool(
        address nftCollection,
        address rewardToken,
        uint256 totalRewardAmount,
        uint256 duration,
        uint256 minimumNFTBalance,
        uint256 maxParticipants,
        PoolType poolType
    ) external payable nonReentrant whenNotPaused {
        if (nftCollection == address(0) || rewardToken == address(0)) {
            revert InvalidAddress();
        }
        if (totalRewardAmount == 0 || duration == 0) {
            revert InvalidPoolParameters();
        }
        if (msg.value < poolTypeFees[poolType]) {
            revert InsufficientPayment();
        }

        // Check NFTY balance for premium pools
        if (poolType == PoolType.PREMIUM) {
            if (IERC20(nftyToken).balanceOf(msg.sender) < minimumNFTYBalance) {
                revert InsufficientNFTYBalance();
            }
        }

        _poolIdCounter.increment();
        uint256 newPoolId = _poolIdCounter.current();

        // Calculate platform fee
        uint256 fee = (totalRewardAmount * platformFee) / 10000;
        uint256 netRewardAmount = totalRewardAmount - fee;

        // Transfer reward tokens to contract
        if (!IERC20(rewardToken).transferFrom(msg.sender, address(this), totalRewardAmount)) {
            revert TransferFailed();
        }

        // Transfer fee to fee recipient
        if (fee > 0) {
            if (!IERC20(rewardToken).transfer(feeRecipient, fee)) {
                revert TransferFailed();
            }
        }

        // Create pool
        pools[newPoolId] = YieldPool({
            poolId: newPoolId,
            creator: msg.sender,
            nftCollection: nftCollection,
            rewardToken: rewardToken,
            totalRewardAmount: netRewardAmount,
            rewardPerNFT: 0, // Will be calculated when pool starts
            duration: duration,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            participantCount: 0,
            isActive: true,
            isCompleted: false,
            minimumNFTBalance: minimumNFTBalance,
            maxParticipants: maxParticipants,
            poolType: poolType
        });

        // Transfer ETH fee to fee recipient
        (bool success,) = payable(feeRecipient).call{value: msg.value}("");
        if (!success) revert TransferFailed();

        emit PoolCreated(
            newPoolId,
            msg.sender,
            nftCollection,
            rewardToken,
            netRewardAmount,
            duration
        );
    }

    /**
     * @dev Join a yield pool
     */
    function joinPool(uint256 poolId) external nonReentrant {
        YieldPool storage pool = pools[poolId];

        if (pool.poolId == 0) revert InvalidPoolId();
        if (!pool.isActive) revert PoolNotActive();
        if (block.timestamp > pool.endTime) revert PoolExpired();
        if (poolParticipants[poolId][msg.sender].isActive) revert AlreadyParticipating();
        if (pool.participantCount >= pool.maxParticipants && pool.maxParticipants > 0) {
            revert PoolFull();
        }

        // Check NFT balance
        uint256 nftBalance = IERC721(pool.nftCollection).balanceOf(msg.sender);
        if (nftBalance < pool.minimumNFTBalance) revert InsufficientNFTBalance();

        // Check pool type requirements
        if (pool.poolType == PoolType.WHITELIST) {
            if (!whitelistedUsers[poolId][msg.sender]) revert NotWhitelisted();
        } else if (pool.poolType == PoolType.PREMIUM) {
            if (IERC20(nftyToken).balanceOf(msg.sender) < minimumNFTYBalance) {
                revert InsufficientNFTYBalance();
            }
        }

        // Add participant
        poolParticipants[poolId][msg.sender] = Participant({
            user: msg.sender,
            nftBalance: nftBalance,
            rewardsClaimed: 0,
            joinTime: block.timestamp,
            isActive: true
        });

        poolParticipantsList[poolId].push(msg.sender);
        userActivePools[msg.sender].push(poolId);
        pool.participantCount++;

        // Update reward per NFT if this is the first participant join after creation
        if (pool.rewardPerNFT == 0) {
            _updateRewardPerNFT(poolId);
        }

        emit UserJoinedPool(poolId, msg.sender, nftBalance);
    }

    /**
     * @dev Claim rewards from a pool
     */
    function claimRewards(uint256 poolId) external nonReentrant {
        YieldPool storage pool = pools[poolId];
        Participant storage participant = poolParticipants[poolId][msg.sender];

        if (pool.poolId == 0) revert InvalidPoolId();
        if (!participant.isActive) revert NotParticipating();

        uint256 pendingRewards = calculatePendingRewards(poolId, msg.sender);
        if (pendingRewards == 0) revert NoRewardsToClaim();

        participant.rewardsClaimed += pendingRewards;
        userTotalEarned[msg.sender] += pendingRewards;

        if (!IERC20(pool.rewardToken).transfer(msg.sender, pendingRewards)) {
            revert TransferFailed();
        }

        emit RewardsClaimed(poolId, msg.sender, pendingRewards);
    }

    /**
     * @dev Complete a pool (callable by anyone after end time)
     */
    function completePool(uint256 poolId) external nonReentrant {
        YieldPool storage pool = pools[poolId];

        if (pool.poolId == 0) revert InvalidPoolId();
        if (pool.isCompleted) revert InvalidPoolParameters();
        if (block.timestamp < pool.endTime) revert PoolNotActive();

        pool.isActive = false;
        pool.isCompleted = true;

        // Calculate total rewards distributed
        uint256 totalDistributed = 0;
        address[] memory participants = poolParticipantsList[poolId];

        for (uint256 i = 0; i < participants.length; i++) {
            Participant storage participant = poolParticipants[poolId][participants[i]];
            totalDistributed += participant.rewardsClaimed;
        }

        // Return any remaining rewards to creator
        uint256 remainingRewards = pool.totalRewardAmount - totalDistributed;
        if (remainingRewards > 0) {
            if (!IERC20(pool.rewardToken).transfer(pool.creator, remainingRewards)) {
                revert TransferFailed();
            }
        }

        emit PoolCompleted(poolId, pool.participantCount, totalDistributed);
    }

    /**
     * @dev Calculate pending rewards for a user in a pool
     */
    function calculatePendingRewards(
        uint256 poolId,
        address user
    ) public view returns (uint256) {
        YieldPool memory pool = pools[poolId];
        Participant memory participant = poolParticipants[poolId][user];

        if (!participant.isActive || pool.rewardPerNFT == 0) return 0;

        uint256 timeParticipated;
        uint256 currentTime = block.timestamp;

        if (currentTime > pool.endTime) {
            timeParticipated = pool.endTime - participant.joinTime;
        } else {
            timeParticipated = currentTime - participant.joinTime;
        }

        uint256 totalEarnable = (participant.nftBalance * pool.rewardPerNFT * timeParticipated) / pool.duration;

        return totalEarnable > participant.rewardsClaimed
            ? totalEarnable - participant.rewardsClaimed
            : 0;
    }

    /**
     * @dev Update reward per NFT calculation
     */
    function _updateRewardPerNFT(uint256 poolId) internal {
        YieldPool storage pool = pools[poolId];

        // Calculate total NFTs from all participants
        uint256 totalNFTs = 0;
        address[] memory participants = poolParticipantsList[poolId];

        for (uint256 i = 0; i < participants.length; i++) {
            totalNFTs += poolParticipants[poolId][participants[i]].nftBalance;
        }

        if (totalNFTs > 0) {
            pool.rewardPerNFT = pool.totalRewardAmount / totalNFTs;
        }
    }

    /**
     * @dev Add users to whitelist for a pool (only pool creator)
     */
    function addToWhitelist(
        uint256 poolId,
        address[] calldata users
    ) external {
        YieldPool memory pool = pools[poolId];

        if (pool.creator != msg.sender) revert InvalidPoolParameters();
        if (pool.poolType != PoolType.WHITELIST) revert InvalidPoolParameters();

        for (uint256 i = 0; i < users.length; i++) {
            whitelistedUsers[poolId][users[i]] = true;
            emit WhitelistUpdated(poolId, users[i], true);
        }
    }

    /**
     * @dev Remove users from whitelist (only pool creator)
     */
    function removeFromWhitelist(
        uint256 poolId,
        address[] calldata users
    ) external {
        YieldPool memory pool = pools[poolId];

        if (pool.creator != msg.sender) revert InvalidPoolParameters();

        for (uint256 i = 0; i < users.length; i++) {
            whitelistedUsers[poolId][users[i]] = false;
            emit WhitelistUpdated(poolId, users[i], false);
        }
    }

    /**
     * @dev Get pool details
     */
    function getPoolDetails(uint256 poolId) external view returns (
        YieldPool memory pool,
        address[] memory participants,
        uint256 totalNFTsInPool
    ) {
        pool = pools[poolId];
        participants = poolParticipantsList[poolId];

        totalNFTsInPool = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            totalNFTsInPool += poolParticipants[poolId][participants[i]].nftBalance;
        }
    }

    /**
     * @dev Get user's active pools
     */
    function getUserActivePools(address user) external view returns (uint256[] memory) {
        return userActivePools[user];
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidAddress();
        feeRecipient = newRecipient;
    }

    /**
     * @dev Update minimum NFTY balance for premium pools (only owner)
     */
    function updateMinimumNFTYBalance(uint256 newBalance) external onlyOwner {
        minimumNFTYBalance = newBalance;
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
     * @dev Emergency token recovery (only owner)
     */
    function emergencyRecover(
        address token,
        uint256 amount
    ) external onlyOwner whenPaused {
        IERC20(token).transfer(owner(), amount);
    }

    /**
     * @dev Get current pool count
     */
    function getCurrentPoolId() external view returns (uint256) {
        return _poolIdCounter.current();
    }
}