// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title NFTYieldSplits
 * @dev Automated revenue distribution contract for NFTYield platform
 * Supports multiple recipients with configurable percentages
 * Handles both ETH and ERC20 token distributions
 */
contract NFTYieldSplits is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Split {
        address[] recipients;
        uint256[] percentages;
        uint256 totalReceived;
        uint256 totalDistributed;
        bool isActive;
        string name;
        uint256 createdAt;
    }

    struct Recipient {
        address wallet;
        uint256 percentage;
        uint256 totalReceived;
    }

    // Platform constants
    address public constant MARKETING_WALLET = 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2;
    uint256 public constant MARKETING_PERCENTAGE = 10; // 10%
    uint256 public constant BASIS_POINTS = 10000; // 100%

    // Storage
    mapping(uint256 => Split) public splits;
    mapping(uint256 => mapping(address => uint256)) public recipientBalances;
    mapping(address => uint256[]) public userSplits;

    uint256 public nextSplitId = 1;
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;

    // Events
    event SplitCreated(
        uint256 indexed splitId,
        address indexed creator,
        string name,
        address[] recipients,
        uint256[] percentages
    );

    event FundsReceived(
        uint256 indexed splitId,
        address indexed sender,
        uint256 amount,
        address token
    );

    event FundsDistributed(
        uint256 indexed splitId,
        address indexed recipient,
        uint256 amount,
        address token
    );

    event SplitDeactivated(uint256 indexed splitId);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new revenue split contract
     * @param _recipients Array of recipient addresses
     * @param _percentages Array of percentages (in basis points, 10000 = 100%)
     * @param _name Human-readable name for this split
     */
    function createSplit(
        address[] calldata _recipients,
        uint256[] calldata _percentages,
        string calldata _name
    ) external whenNotPaused returns (uint256 splitId) {
        require(_recipients.length > 0, "No recipients provided");
        require(_recipients.length == _percentages.length, "Array length mismatch");
        require(bytes(_name).length > 0, "Name required");

        // Validate recipients and percentages
        uint256 totalPercentage = MARKETING_PERCENTAGE * 100; // Marketing gets 10% (1000 basis points)

        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid recipient");
            require(_percentages[i] > 0, "Percentage must be > 0");
            totalPercentage += _percentages[i];
        }

        require(totalPercentage <= BASIS_POINTS, "Total percentage exceeds 100%");

        splitId = nextSplitId++;

        // Create the split with marketing wallet included
        address[] memory allRecipients = new address[](_recipients.length + 1);
        uint256[] memory allPercentages = new uint256[](_percentages.length + 1);

        allRecipients[0] = MARKETING_WALLET;
        allPercentages[0] = MARKETING_PERCENTAGE * 100; // 1000 basis points

        for (uint256 i = 0; i < _recipients.length; i++) {
            allRecipients[i + 1] = _recipients[i];
            allPercentages[i + 1] = _percentages[i];
        }

        splits[splitId] = Split({
            recipients: allRecipients,
            percentages: allPercentages,
            totalReceived: 0,
            totalDistributed: 0,
            isActive: true,
            name: _name,
            createdAt: block.timestamp
        });

        userSplits[msg.sender].push(splitId);

        emit SplitCreated(splitId, msg.sender, _name, allRecipients, allPercentages);
    }

    /**
     * @dev Send ETH to a split for distribution
     * @param _splitId The split ID to distribute to
     */
    function sendToSplit(uint256 _splitId) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "No ETH sent");
        require(splits[_splitId].isActive, "Split not active");

        _distributeETH(_splitId, msg.value);
    }

    /**
     * @dev Send ERC20 tokens to a split for distribution
     * @param _splitId The split ID to distribute to
     * @param _token The token contract address
     * @param _amount The amount of tokens to distribute
     */
    function sendTokensToSplit(
        uint256 _splitId,
        address _token,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        require(_amount > 0, "No tokens sent");
        require(splits[_splitId].isActive, "Split not active");
        require(_token != address(0), "Invalid token");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        _distributeTokens(_splitId, _token, _amount);
    }

    /**
     * @dev Receive ETH directly to the contract for split ID 1 (default)
     */
    receive() external payable {
        if (msg.value > 0 && splits[1].isActive) {
            _distributeETH(1, msg.value);
        }
    }

    /**
     * @dev Distribute ETH among recipients of a split
     */
    function _distributeETH(uint256 _splitId, uint256 _amount) internal {
        Split storage split = splits[_splitId];

        // Deduct platform fee
        uint256 feeAmount = (_amount * platformFee) / BASIS_POINTS;
        uint256 distributionAmount = _amount - feeAmount;

        if (feeAmount > 0) {
            payable(feeRecipient).transfer(feeAmount);
        }

        split.totalReceived += _amount;

        // Distribute to recipients
        for (uint256 i = 0; i < split.recipients.length; i++) {
            uint256 recipientAmount = (distributionAmount * split.percentages[i]) / BASIS_POINTS;

            if (recipientAmount > 0) {
                recipientBalances[_splitId][split.recipients[i]] += recipientAmount;
                split.totalDistributed += recipientAmount;

                payable(split.recipients[i]).transfer(recipientAmount);

                emit FundsDistributed(_splitId, split.recipients[i], recipientAmount, address(0));
            }
        }

        emit FundsReceived(_splitId, msg.sender, _amount, address(0));
    }

    /**
     * @dev Distribute ERC20 tokens among recipients of a split
     */
    function _distributeTokens(uint256 _splitId, address _token, uint256 _amount) internal {
        Split storage split = splits[_splitId];
        IERC20 token = IERC20(_token);

        // Deduct platform fee
        uint256 feeAmount = (_amount * platformFee) / BASIS_POINTS;
        uint256 distributionAmount = _amount - feeAmount;

        if (feeAmount > 0) {
            token.safeTransfer(feeRecipient, feeAmount);
        }

        split.totalReceived += _amount;

        // Distribute to recipients
        for (uint256 i = 0; i < split.recipients.length; i++) {
            uint256 recipientAmount = (distributionAmount * split.percentages[i]) / BASIS_POINTS;

            if (recipientAmount > 0) {
                recipientBalances[_splitId][split.recipients[i]] += recipientAmount;
                split.totalDistributed += recipientAmount;

                token.safeTransfer(split.recipients[i], recipientAmount);

                emit FundsDistributed(_splitId, split.recipients[i], recipientAmount, _token);
            }
        }

        emit FundsReceived(_splitId, msg.sender, _amount, _token);
    }

    /**
     * @dev Get split information
     */
    function getSplit(uint256 _splitId) external view returns (
        address[] memory recipients,
        uint256[] memory percentages,
        uint256 totalReceived,
        uint256 totalDistributed,
        bool isActive,
        string memory name,
        uint256 createdAt
    ) {
        Split storage split = splits[_splitId];
        return (
            split.recipients,
            split.percentages,
            split.totalReceived,
            split.totalDistributed,
            split.isActive,
            split.name,
            split.createdAt
        );
    }

    /**
     * @dev Get recipient information for a split
     */
    function getRecipientBalance(uint256 _splitId, address _recipient) external view returns (uint256) {
        return recipientBalances[_splitId][_recipient];
    }

    /**
     * @dev Get splits created by a user
     */
    function getUserSplits(address _user) external view returns (uint256[] memory) {
        return userSplits[_user];
    }

    /**
     * @dev Deactivate a split (only owner)
     */
    function deactivateSplit(uint256 _splitId) external onlyOwner {
        require(splits[_splitId].isActive, "Split already inactive");
        splits[_splitId].isActive = false;
        emit SplitDeactivated(_splitId);
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        uint256 oldFee = platformFee;
        platformFee = _newFee;
        emit PlatformFeeUpdated(oldFee, _newFee);
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient");
        feeRecipient = _newRecipient;
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
     * @dev Emergency token recovery (only owner, when paused)
     */
    function emergencyTokenRecovery(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyOwner whenPaused {
        require(_to != address(0), "Invalid recipient");

        if (_token == address(0)) {
            payable(_to).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(_to, _amount);
        }
    }
}