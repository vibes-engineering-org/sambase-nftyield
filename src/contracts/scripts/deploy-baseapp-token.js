const { ethers } = require("hardhat");

async function main() {
  console.log("Starting BaseApp Token deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  try {
    // Deploy BaseApp Token
    console.log("\nDeploying BaseAppToken...");
    const BaseAppToken = await ethers.getContractFactory("BaseAppToken");
    const baseAppToken = await BaseAppToken.deploy();
    await baseAppToken.waitForDeployment();
    const baseAppTokenAddress = await baseAppToken.getAddress();
    console.log("BaseAppToken deployed to:", baseAppTokenAddress);

    // Wait for a few block confirmations
    console.log("\nWaiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify deployment
    console.log("\nVerifying BaseAppToken deployment...");
    const totalSupply = await baseAppToken.totalSupply();
    const contractBalance = await baseAppToken.balanceOf(baseAppTokenAddress);
    const currentPrice = await baseAppToken.getCurrentPrice();
    const totalSold = await baseAppToken.totalSold();
    const tradingEnabled = await baseAppToken.tradingEnabled();

    console.log("Total supply:", ethers.formatEther(totalSupply), "BAPP");
    console.log("Contract balance:", ethers.formatEther(contractBalance), "BAPP");
    console.log("Current price:", ethers.formatEther(currentPrice), "ETH");
    console.log("Total sold:", ethers.formatEther(totalSold), "BAPP");
    console.log("Trading enabled:", tradingEnabled);

    // Test contract info function
    const contractInfo = await baseAppToken.getContractInfo();
    console.log("\nContract info verification:");
    console.log("Total supply from getContractInfo:", ethers.formatEther(contractInfo[0]), "BAPP");
    console.log("Total sold from getContractInfo:", ethers.formatEther(contractInfo[1]), "BAPP");
    console.log("Current price from getContractInfo:", ethers.formatEther(contractInfo[2]), "ETH");
    console.log("Contract balance from getContractInfo:", ethers.formatEther(contractInfo[3]), "BAPP");
    console.log("Trading enabled from getContractInfo:", contractInfo[4]);

    // Output deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("BASEAPP TOKEN DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("Network:", await ethers.provider.getNetwork().then(n => n.name));
    console.log("Chain ID:", await ethers.provider.getNetwork().then(n => n.chainId));
    console.log("Block Number:", await ethers.provider.getBlockNumber());
    console.log("Gas Price:", ethers.formatUnits(await ethers.provider.getFeeData().then(f => f.gasPrice || 0), "gwei"), "gwei");
    console.log("");
    console.log("BaseAppToken (BAPP):", baseAppTokenAddress);
    console.log("Marketing Wallet:", "0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2");
    console.log("=".repeat(60));

    // Save deployment info to file
    const deploymentInfo = {
      network: await ethers.provider.getNetwork().then(n => n.name),
      chainId: await ethers.provider.getNetwork().then(n => n.chainId),
      blockNumber: await ethers.provider.getBlockNumber(),
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contract: {
        BaseAppToken: baseAppTokenAddress
      },
      verification: {
        totalSupply: ethers.formatEther(totalSupply),
        contractBalance: ethers.formatEther(contractBalance),
        currentPrice: ethers.formatEther(currentPrice),
        totalSold: ethers.formatEther(totalSold),
        tradingEnabled: tradingEnabled
      }
    };

    const fs = require('fs');
    const deploymentPath = `./deployments/baseapp-token-${Date.now()}.json`;

    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to:", deploymentPath);

    console.log("\nDeployment completed successfully! 🎉");
    console.log("\nNext Steps:");
    console.log("1. Update .env.local with:");
    console.log("   NEXT_PUBLIC_BASE_APP_TOKEN_ADDRESS=" + baseAppTokenAddress);
    console.log("2. Verify contract on block explorer");
    console.log("3. Test token purchase functionality");
    console.log("4. Enable trading when ready (call enableTrading() as owner)");

  } catch (error) {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });