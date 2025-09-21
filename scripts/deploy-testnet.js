const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting NFTYield + Splits contract deployment to Base Sepolia testnet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.01 ETH");
    console.log("💡 Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

  // Configuration addresses for testnet
  const teamWallet = deployer.address; // Use deployer for testing
  const communityRewardsPool = deployer.address;
  const liquidityPool = deployer.address;
  const platformTreasury = deployer.address;
  const feeRecipient = deployer.address;
  const lotteryWallet = deployer.address;

  // Use Base Sepolia testnet Samish token or deploy a mock
  const samishTokenAddress = "0x086bb3d90d719eb50d569e071b9987080ecb9781"; // Placeholder

  console.log("\n📋 Testnet Deployment Configuration:");
  console.log("Team Wallet:", teamWallet);
  console.log("Fee Recipient:", feeRecipient);
  console.log("Platform Treasury:", platformTreasury);

  try {
    // 1. Deploy BaseApp Token
    console.log("\n1️⃣ Deploying BaseAppToken...");
    const BaseAppToken = await ethers.getContractFactory("BaseAppToken");
    const baseAppToken = await BaseAppToken.deploy();
    await baseAppToken.waitForDeployment();
    const baseAppTokenAddress = await baseAppToken.getAddress();
    console.log("✅ BaseAppToken deployed to:", baseAppTokenAddress);

    // 2. Deploy NFTYIELD Token
    console.log("\n2️⃣ Deploying NFTYieldToken...");
    const NFTYieldToken = await ethers.getContractFactory("NFTYieldToken");
    const nftyToken = await NFTYieldToken.deploy(
      teamWallet,
      communityRewardsPool,
      liquidityPool,
      platformTreasury
    );
    await nftyToken.waitForDeployment();
    const nftyTokenAddress = await nftyToken.getAddress();
    console.log("✅ NFTYieldToken deployed to:", nftyTokenAddress);

    // 3. Deploy Token Burn Escrow
    console.log("\n3️⃣ Deploying TokenBurnEscrow...");
    const TokenBurnEscrow = await ethers.getContractFactory("TokenBurnEscrow");
    const burnEscrow = await TokenBurnEscrow.deploy(
      samishTokenAddress,
      lotteryWallet
    );
    await burnEscrow.waitForDeployment();
    const burnEscrowAddress = await burnEscrow.getAddress();
    console.log("✅ TokenBurnEscrow deployed to:", burnEscrowAddress);

    // 4. Deploy NFT Yield Pool
    console.log("\n4️⃣ Deploying NFTYieldPool...");
    const NFTYieldPool = await ethers.getContractFactory("NFTYieldPool");
    const yieldPool = await NFTYieldPool.deploy(
      feeRecipient,
      nftyTokenAddress
    );
    await yieldPool.waitForDeployment();
    const yieldPoolAddress = await yieldPool.getAddress();
    console.log("✅ NFTYieldPool deployed to:", yieldPoolAddress);

    // 5. Deploy NFT Yield Factory
    console.log("\n5️⃣ Deploying NFTYieldFactory...");
    const NFTYieldFactory = await ethers.getContractFactory("NFTYieldFactory");
    const yieldFactory = await NFTYieldFactory.deploy(
      feeRecipient,
      nftyTokenAddress
    );
    await yieldFactory.waitForDeployment();
    const yieldFactoryAddress = await yieldFactory.getAddress();
    console.log("✅ NFTYieldFactory deployed to:", yieldFactoryAddress);

    // 6. Deploy NFTYield Splits Contract
    console.log("\n6️⃣ Deploying NFTYieldSplits...");
    const NFTYieldSplits = await ethers.getContractFactory("NFTYieldSplits");
    const splitsContract = await NFTYieldSplits.deploy(feeRecipient);
    await splitsContract.waitForDeployment();
    const splitsAddress = await splitsContract.getAddress();
    console.log("✅ NFTYieldSplits deployed to:", splitsAddress);

    // Wait for confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 15000));

    // 7. Create a default split for testing
    console.log("\n7️⃣ Creating default test split...");
    const testRecipients = [deployer.address];
    const testPercentages = [9000]; // 90% (in basis points)
    const testName = "Default Test Split";

    const createTx = await splitsContract.createSplit(
      testRecipients,
      testPercentages,
      testName
    );
    await createTx.wait();
    console.log("✅ Default test split created (ID: 1)");

    // 8. Output deployment summary
    console.log("\n" + "=".repeat(70));
    console.log("🎉 TESTNET DEPLOYMENT COMPLETED SUCCESSFULLY");
    console.log("=".repeat(70));
    console.log("🌐 Network: Base Sepolia");
    console.log("📍 Block Number:", await ethers.provider.getBlockNumber());
    console.log("⛽ Gas Price:", ethers.formatUnits(await ethers.provider.getFeeData().then(f => f.gasPrice || 0), "gwei"), "gwei");
    console.log("");
    console.log("📝 Contract Addresses:");
    console.log("BaseAppToken (BAPP):", baseAppTokenAddress);
    console.log("NFTYieldToken (NFTY):", nftyTokenAddress);
    console.log("TokenBurnEscrow:", burnEscrowAddress);
    console.log("NFTYieldPool:", yieldPoolAddress);
    console.log("NFTYieldFactory:", yieldFactoryAddress);
    console.log("NFTYieldSplits:", splitsAddress);
    console.log("");
    console.log("🔗 Block Explorer:");
    console.log("https://sepolia.basescan.org/address/" + splitsAddress);
    console.log("=".repeat(70));

    // 9. Save deployment info
    const deploymentInfo = {
      network: "base-sepolia",
      chainId: 84532,
      blockNumber: await ethers.provider.getBlockNumber(),
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        BaseAppToken: baseAppTokenAddress,
        NFTYieldToken: nftyTokenAddress,
        TokenBurnEscrow: burnEscrowAddress,
        NFTYieldPool: yieldPoolAddress,
        NFTYieldFactory: yieldFactoryAddress,
        NFTYieldSplits: splitsAddress
      },
      configuration: {
        samishToken: samishTokenAddress,
        teamWallet,
        communityRewardsPool,
        liquidityPool,
        platformTreasury,
        feeRecipient,
        lotteryWallet
      },
      verification: {
        basescan: `https://sepolia.basescan.org/address/${splitsAddress}`,
        contractsReady: true
      }
    };

    const fs = require('fs');
    const deploymentPath = `./deployments/testnet-${Date.now()}.json`;

    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentPath);

    // 10. Update frontend configuration
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Update SPLITS_CONTRACT_ADDRESS in src/components/split-contract.tsx:");
    console.log(`   const SPLITS_CONTRACT_ADDRESS = "${splitsAddress}";`);
    console.log("");
    console.log("2. Update contract address in src/hooks/useSplitsContract.ts");
    console.log("");
    console.log("3. Verify contracts on Basescan:");
    console.log("   pnpm hardhat verify", splitsAddress, feeRecipient, "--network base-sepolia");
    console.log("");
    console.log("4. Test the Split functionality:");
    console.log("   - Create new splits");
    console.log("   - Send test ETH to splits");
    console.log("   - Verify automatic distribution");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });