// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BaseAppToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant MARKETING_ALLOCATION = 100_000_000 * 10**18; // 100 million tokens (10%)
    address public constant MARKETING_WALLET = 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2;

    uint256 public constant INITIAL_PRICE = 0.000001 ether; // Starting price in ETH
    uint256 public totalSold;
    uint256 public maxPurchaseAmount = 1_000_000 * 10**18; // Max 1M tokens per purchase

    bool public tradingEnabled = false;
    mapping(address => bool) public whitelisted;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TradingEnabled();
    event WhitelistUpdated(address indexed account, bool status);
    event TokensBurned(address indexed burner, uint256 amount);

    constructor() ERC20("BaseApp Token", "BAPP") {
        // Mint total supply to contract
        _mint(address(this), TOTAL_SUPPLY - MARKETING_ALLOCATION);

        // Mint marketing allocation directly to marketing wallet
        _mint(MARKETING_WALLET, MARKETING_ALLOCATION);

        // Set initial owner
        _transferOwnership(msg.sender);
    }

    function getCurrentPrice() public view returns (uint256) {
        if (totalSold == 0) return INITIAL_PRICE;

        // Bonding curve: price increases with supply
        // Price = initial_price * (1 + totalSold / 100M)
        uint256 priceMultiplier = (totalSold / (100_000_000 * 10**18)) + 1;
        return INITIAL_PRICE * priceMultiplier;
    }

    function buyTokens(uint256 tokenAmount) external payable nonReentrant {
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(tokenAmount <= maxPurchaseAmount, "Exceeds max purchase amount");
        require(balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");

        uint256 cost = calculateCost(tokenAmount);
        require(msg.value >= cost, "Insufficient payment");

        totalSold += tokenAmount;
        _transfer(address(this), msg.sender, tokenAmount);

        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit TokensPurchased(msg.sender, tokenAmount, cost);
    }

    function calculateCost(uint256 tokenAmount) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (currentPrice * tokenAmount) / 10**18;
    }

    function enableTrading() external onlyOwner {
        tradingEnabled = true;
        emit TradingEnabled();
    }

    function updateWhitelist(address account, bool status) external onlyOwner {
        whitelisted[account] = status;
        emit WhitelistUpdated(account, status);
    }

    function setMaxPurchaseAmount(uint256 _maxPurchaseAmount) external onlyOwner {
        maxPurchaseAmount = _maxPurchaseAmount;
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function emergencyWithdrawTokens(uint256 amount) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Insufficient tokens");
        _transfer(address(this), owner(), amount);
    }

    // Override burn function to emit custom event
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    // Override transfer functions to add trading restrictions if needed
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }

        // Allow contract interactions
        if (from == address(this) || to == address(this)) {
            return;
        }

        // Allow owner transfers
        if (from == owner() || to == owner()) {
            return;
        }

        // Check if trading is enabled or if addresses are whitelisted
        require(tradingEnabled || whitelisted[from] || whitelisted[to], "Trading not enabled");
    }

    function getContractInfo() external view returns (
        uint256 _totalSupply,
        uint256 _totalSold,
        uint256 _currentPrice,
        uint256 _contractBalance,
        bool _tradingEnabled
    ) {
        return (
            TOTAL_SUPPLY,
            totalSold,
            getCurrentPrice(),
            balanceOf(address(this)),
            tradingEnabled
        );
    }
}