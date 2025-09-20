// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BaseAppToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant MARKETING_ALLOCATION = 100_000_000 * 10**18; // 10% for marketing

    address public constant MARKETING_WALLET = 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2;

    uint256 public totalSold;
    uint256 public currentPrice = 0.0001 ether; // Starting price
    bool public tradingEnabled = true;

    // Bonding curve parameters
    uint256 public constant PRICE_INCREMENT = 0.00000001 ether; // Price increases by this amount per 1000 tokens sold
    uint256 public constant TOKENS_PER_PRICE_INCREMENT = 1000 * 10**18;

    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TradingStatusChanged(bool enabled);
    event PriceUpdated(uint256 newPrice);

    constructor() ERC20("BaseApp Token", "BAPP") {
        // Mint total supply to contract
        _mint(address(this), TOTAL_SUPPLY);

        // Transfer marketing allocation to marketing wallet
        _transfer(address(this), MARKETING_WALLET, MARKETING_ALLOCATION);

        emit PriceUpdated(currentPrice);
    }

    function buyTokens(uint256 tokenAmount) external payable nonReentrant {
        require(tradingEnabled, "Trading is disabled");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(balanceOf(address(this)) >= tokenAmount, "Insufficient tokens available");

        uint256 cost = calculateCost(tokenAmount);
        require(msg.value >= cost, "Insufficient ETH sent");

        // Update metrics before transfer
        totalSold += tokenAmount;

        // Transfer tokens to buyer
        _transfer(address(this), msg.sender, tokenAmount);

        // Update price based on total sold
        updatePrice();

        // Refund excess ETH
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit TokensPurchased(msg.sender, tokenAmount, cost);
    }

    function calculateCost(uint256 tokenAmount) public view returns (uint256) {
        uint256 cost = 0;
        uint256 remaining = tokenAmount;
        uint256 tempSold = totalSold;
        uint256 tempPrice = currentPrice;

        while (remaining > 0) {
            uint256 tokensUntilNextPriceIncrease = TOKENS_PER_PRICE_INCREMENT - (tempSold % TOKENS_PER_PRICE_INCREMENT);
            uint256 tokensAtCurrentPrice = remaining < tokensUntilNextPriceIncrease ? remaining : tokensUntilNextPriceIncrease;

            cost += (tokensAtCurrentPrice * tempPrice) / 10**18;
            remaining -= tokensAtCurrentPrice;
            tempSold += tokensAtCurrentPrice;

            if (remaining > 0) {
                tempPrice += PRICE_INCREMENT;
            }
        }

        return cost;
    }

    function updatePrice() internal {
        uint256 newPrice = currentPrice;
        uint256 priceIncreases = totalSold / TOKENS_PER_PRICE_INCREMENT;
        newPrice = 0.0001 ether + (priceIncreases * PRICE_INCREMENT);

        if (newPrice != currentPrice) {
            currentPrice = newPrice;
            emit PriceUpdated(currentPrice);
        }
    }

    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
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
            currentPrice,
            balanceOf(address(this)),
            tradingEnabled
        );
    }

    // Owner functions
    function setTradingEnabled(bool _enabled) external onlyOwner {
        tradingEnabled = _enabled;
        emit TradingStatusChanged(_enabled);
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function emergencyWithdrawTokens(uint256 amount) external onlyOwner {
        require(amount <= balanceOf(address(this)), "Insufficient contract balance");
        _transfer(address(this), owner(), amount);
    }

    // View functions for frontend
    function getAvailableTokens() external view returns (uint256) {
        return balanceOf(address(this));
    }

    function getMarketingAllocation() external pure returns (address, uint256) {
        return (MARKETING_WALLET, MARKETING_ALLOCATION);
    }

    receive() external payable {
        revert("Direct ETH transfers not allowed. Use buyTokens function.");
    }
}