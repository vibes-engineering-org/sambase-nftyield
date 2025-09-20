const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying BaseApp Token to Base network...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Get the contract factory
  const BaseAppToken = await ethers.getContractFactory("BaseAppToken");

  console.log("\nDeploying BaseAppToken contract...");

  // Deploy the contract
  const token = await BaseAppToken.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("BaseApp Token deployed to:", tokenAddress);
  console.log("Marketing wallet airdrop:", "0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2");
  console.log("Marketing allocation: 100,000,000 BAPP (10% of supply)");

  // Wait for a few block confirmations
  console.log("\nWaiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Verify the deployment
  const totalSupply = await token.totalSupply();
  const marketingBalance = await token.balanceOf("0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2");
  const contractBalance = await token.balanceOf(tokenAddress);
  const currentPrice = await token.getCurrentPrice();
  const tradingEnabled = await token.tradingEnabled();

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("Total Supply:", ethers.formatEther(totalSupply), "BAPP");
  console.log("Marketing Wallet Balance:", ethers.formatEther(marketingBalance), "BAPP");
  console.log("Contract Balance (Available for Sale):", ethers.formatEther(contractBalance), "BAPP");
  console.log("Initial Price:", ethers.formatEther(currentPrice), "ETH per BAPP");
  console.log("Trading Enabled:", tradingEnabled);

  // Test contract info function
  console.log("\nTesting contract functions...");
  const contractInfo = await token.getContractInfo();
  console.log("getContractInfo() test passed");

  // Save deployment info to files
  const deploymentInfo = {
    network: await ethers.provider.getNetwork().then(n => n.name),
    chainId: await ethers.provider.getNetwork().then(n => n.chainId.toString()),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contract: {
      BaseAppToken: tokenAddress
    },
    verification: {
      totalSupply: ethers.formatEther(totalSupply),
      marketingBalance: ethers.formatEther(marketingBalance),
      contractBalance: ethers.formatEther(contractBalance),
      currentPrice: ethers.formatEther(currentPrice),
      tradingEnabled: tradingEnabled
    }
  };

  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, `baseapp-token-${Date.now()}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentPath);

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉");
  console.log("=".repeat(60));
  console.log("\n📋 Next Steps:");
  console.log("1. Update .env.local with the contract address:");
  console.log("   NEXT_PUBLIC_BASE_APP_TOKEN_ADDRESS=" + tokenAddress);
  console.log("\n2. Test the token purchase functionality");
  console.log("3. Enable trading when ready (call enableTrading() as owner)");
  console.log("4. Verify contract on BaseScan (optional)");

  console.log("\n📄 Contract Address:", tokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });