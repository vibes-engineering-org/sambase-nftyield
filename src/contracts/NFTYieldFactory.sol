// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./NFTYieldPool.sol";

/**
 * @title NFTYieldFactory
 * @dev Factory contract for deploying NFT Yield Pool contracts
 * Manages pool templates and deployment
 */
contract NFTYieldFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct PoolTemplate {
        string name;
        string description;
        uint256 baseCreationFee;
        uint256 platformFeeRate;
        bool isActive;
        address implementation;
    }

    Counters.Counter private _templateIdCounter;
    Counters.Counter private _deployedPoolCounter;

    mapping(uint256 => PoolTemplate) public poolTemplates;
    mapping(address => address[]) public userDeployedPools;
    mapping(address => bool) public isDeployedPool;

    address public feeRecipient;
    address public nftyToken;
    uint256 public basePlatformFee = 250; // 2.5% in basis points

    event TemplateCreated(
        uint256 indexed templateId,
        string name,
        address implementation
    );

    event PoolDeployed(
        address indexed poolAddress,
        address indexed creator,
        uint256 templateId,
        string poolName
    );

    event TemplateUpdated(
        uint256 indexed templateId,
        bool isActive
    );

    error InvalidTemplate();
    error TemplateNotActive();
    error InsufficientPayment();
    error DeploymentFailed();
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

        _createDefaultTemplates();
    }

    /**
     * @dev Create default pool templates
     */
    function _createDefaultTemplates() internal {
        // Standard Yield Pool Template
        _templateIdCounter.increment();
        poolTemplates[_templateIdCounter.current()] = PoolTemplate({
            name: "Standard Yield Pool",
            description: "Basic NFT yield farming pool with standard features",
            baseCreationFee: 0.01 ether,
            platformFeeRate: 250, // 2.5%
            isActive: true,
            implementation: address(0) // Will be set when implementation is deployed
        });

        // Premium Yield Pool Template
        _templateIdCounter.increment();
        poolTemplates[_templateIdCounter.current()] = PoolTemplate({
            name: "Premium Yield Pool",
            description: "Advanced yield pool with enhanced features and lower fees",
            baseCreationFee: 0.005 ether,
            platformFeeRate: 150, // 1.5%
            isActive: true,
            implementation: address(0)
        });

        // Community Pool Template
        _templateIdCounter.increment();
        poolTemplates[_templateIdCounter.current()] = PoolTemplate({
            name: "Community Pool",
            description: "Community-driven yield pool with governance features",
            baseCreationFee: 0.02 ether,
            platformFeeRate: 200, // 2.0%
            isActive: true,
            implementation: address(0)
        });
    }

    /**
     * @dev Deploy a new yield pool using a template
     */
    function deployPool(
        uint256 templateId,
        string calldata poolName,
        bytes calldata initData
    ) external payable nonReentrant {
        PoolTemplate memory template = poolTemplates[templateId];

        if (template.implementation == address(0)) revert InvalidTemplate();
        if (!template.isActive) revert TemplateNotActive();
        if (msg.value < template.baseCreationFee) revert InsufficientPayment();

        // Deploy new pool contract
        address newPool = _deployPoolContract(template.implementation, initData);
        if (newPool == address(0)) revert DeploymentFailed();

        // Register the deployed pool
        userDeployedPools[msg.sender].push(newPool);
        isDeployedPool[newPool] = true;
        _deployedPoolCounter.increment();

        // Transfer creation fee
        (bool success,) = payable(feeRecipient).call{value: msg.value}("");
        require(success, "Fee transfer failed");

        emit PoolDeployed(newPool, msg.sender, templateId, poolName);
    }

    /**
     * @dev Deploy pool contract using CREATE2 for deterministic addresses
     */
    function _deployPoolContract(
        address implementation,
        bytes calldata initData
    ) internal returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            _deployedPoolCounter.current()
        ));

        // Using minimal proxy pattern for gas efficiency
        bytes memory bytecode = abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            implementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );

        address poolAddress;
        assembly {
            poolAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }

        if (poolAddress == address(0)) revert DeploymentFailed();

        // Initialize the deployed contract
        if (initData.length > 0) {
            (bool success,) = poolAddress.call(initData);
            require(success, "Initialization failed");
        }

        return poolAddress;
    }

    /**
     * @dev Create a new pool template (only owner)
     */
    function createTemplate(
        string calldata name,
        string calldata description,
        uint256 baseCreationFee,
        uint256 platformFeeRate,
        address implementation
    ) external onlyOwner {
        if (implementation == address(0)) revert InvalidAddress();

        _templateIdCounter.increment();
        uint256 newTemplateId = _templateIdCounter.current();

        poolTemplates[newTemplateId] = PoolTemplate({
            name: name,
            description: description,
            baseCreationFee: baseCreationFee,
            platformFeeRate: platformFeeRate,
            isActive: true,
            implementation: implementation
        });

        emit TemplateCreated(newTemplateId, name, implementation);
    }

    /**
     * @dev Update template status (only owner)
     */
    function updateTemplateStatus(
        uint256 templateId,
        bool isActive
    ) external onlyOwner {
        if (poolTemplates[templateId].implementation == address(0)) {
            revert InvalidTemplate();
        }

        poolTemplates[templateId].isActive = isActive;
        emit TemplateUpdated(templateId, isActive);
    }

    /**
     * @dev Update template implementation (only owner)
     */
    function updateTemplateImplementation(
        uint256 templateId,
        address newImplementation
    ) external onlyOwner {
        if (newImplementation == address(0)) revert InvalidAddress();
        if (poolTemplates[templateId].implementation == address(0)) {
            revert InvalidTemplate();
        }

        poolTemplates[templateId].implementation = newImplementation;
    }

    /**
     * @dev Get all templates
     */
    function getAllTemplates() external view returns (PoolTemplate[] memory) {
        uint256 templateCount = _templateIdCounter.current();
        PoolTemplate[] memory templates = new PoolTemplate[](templateCount);

        for (uint256 i = 1; i <= templateCount; i++) {
            templates[i - 1] = poolTemplates[i];
        }

        return templates;
    }

    /**
     * @dev Get active templates
     */
    function getActiveTemplates() external view returns (
        uint256[] memory templateIds,
        PoolTemplate[] memory templates
    ) {
        uint256 templateCount = _templateIdCounter.current();
        uint256 activeCount = 0;

        // Count active templates
        for (uint256 i = 1; i <= templateCount; i++) {
            if (poolTemplates[i].isActive) {
                activeCount++;
            }
        }

        templateIds = new uint256[](activeCount);
        templates = new PoolTemplate[](activeCount);

        uint256 index = 0;
        for (uint256 i = 1; i <= templateCount; i++) {
            if (poolTemplates[i].isActive) {
                templateIds[index] = i;
                templates[index] = poolTemplates[i];
                index++;
            }
        }
    }

    /**
     * @dev Get user's deployed pools
     */
    function getUserDeployedPools(address user) external view returns (address[] memory) {
        return userDeployedPools[user];
    }

    /**
     * @dev Calculate deployment cost for a template
     */
    function getDeploymentCost(uint256 templateId) external view returns (uint256) {
        PoolTemplate memory template = poolTemplates[templateId];
        if (template.implementation == address(0)) revert InvalidTemplate();
        return template.baseCreationFee;
    }

    /**
     * @dev Predict the address of the next pool deployment
     */
    function predictPoolAddress(address deployer) external view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(
            deployer,
            block.timestamp,
            _deployedPoolCounter.current()
        ));

        bytes memory bytecode = abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            poolTemplates[1].implementation, // Use first template as default
            hex"5af43d82803e903d91602b57fd5bf3"
        );

        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
        );

        return address(uint160(uint256(hash)));
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidAddress();
        feeRecipient = newRecipient;
    }

    /**
     * @dev Update base platform fee (only owner)
     */
    function updateBasePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        basePlatformFee = newFee;
    }

    /**
     * @dev Get deployment statistics
     */
    function getDeploymentStats() external view returns (
        uint256 totalTemplates,
        uint256 activeTemplates,
        uint256 totalDeployedPools
    ) {
        totalTemplates = _templateIdCounter.current();
        totalDeployedPools = _deployedPoolCounter.current();

        activeTemplates = 0;
        for (uint256 i = 1; i <= totalTemplates; i++) {
            if (poolTemplates[i].isActive) {
                activeTemplates++;
            }
        }
    }

    /**
     * @dev Emergency function to withdraw stuck ETH (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}