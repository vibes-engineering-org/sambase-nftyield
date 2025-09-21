const { run } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Starting contract verification on Base Sepolia...");

  // Read the latest deployment file
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    console.error("❌ No deployments directory found. Deploy contracts first.");
    process.exit(1);
  }

  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(file => file.startsWith('testnet-') && file.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a)); // Get the latest

  if (deploymentFiles.length === 0) {
    console.error("❌ No testnet deployment files found.");
    process.exit(1);
  }

  const latestDeployment = deploymentFiles[0];
  const deploymentPath = path.join(deploymentsDir, latestDeployment);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  console.log(`📂 Using deployment file: ${latestDeployment}`);
  console.log(`🌐 Network: ${deployment.network}`);
  console.log(`📍 Block: ${deployment.blockNumber}`);

  const contracts = deployment.contracts;
  const config = deployment.configuration;

  try {
    // Verify BaseAppToken
    console.log("\n1️⃣ Verifying BaseAppToken...");
    await run("verify:verify", {
      address: contracts.BaseAppToken,
      constructorArguments: []
    });
    console.log("✅ BaseAppToken verified");

    // Verify NFTYieldToken
    console.log("\n2️⃣ Verifying NFTYieldToken...");
    await run("verify:verify", {
      address: contracts.NFTYieldToken,
      constructorArguments: [
        config.teamWallet,
        config.communityRewardsPool,
        config.liquidityPool,
        config.platformTreasury
      ]
    });
    console.log("✅ NFTYieldToken verified");

    // Verify TokenBurnEscrow
    console.log("\n3️⃣ Verifying TokenBurnEscrow...");
    await run("verify:verify", {
      address: contracts.TokenBurnEscrow,
      constructorArguments: [
        config.samishToken,
        config.lotteryWallet
      ]
    });
    console.log("✅ TokenBurnEscrow verified");

    // Verify NFTYieldPool
    console.log("\n4️⃣ Verifying NFTYieldPool...");
    await run("verify:verify", {
      address: contracts.NFTYieldPool,
      constructorArguments: [
        config.feeRecipient,
        contracts.NFTYieldToken
      ]
    });
    console.log("✅ NFTYieldPool verified");

    // Verify NFTYieldFactory
    console.log("\n5️⃣ Verifying NFTYieldFactory...");
    await run("verify:verify", {
      address: contracts.NFTYieldFactory,
      constructorArguments: [
        config.feeRecipient,
        contracts.NFTYieldToken
      ]
    });
    console.log("✅ NFTYieldFactory verified");

    // Verify NFTYieldSplits
    console.log("\n6️⃣ Verifying NFTYieldSplits...");
    await run("verify:verify", {
      address: contracts.NFTYieldSplits,
      constructorArguments: [
        config.feeRecipient
      ]
    });
    console.log("✅ NFTYieldSplits verified");

    console.log("\n" + "=".repeat(50));
    console.log("🎉 ALL CONTRACTS VERIFIED SUCCESSFULLY!");
    console.log("=".repeat(50));

    console.log("\n🔗 Verified Contract Links:");
    console.log("BaseAppToken:", `https://sepolia.basescan.org/address/${contracts.BaseAppToken}#code`);
    console.log("NFTYieldToken:", `https://sepolia.basescan.org/address/${contracts.NFTYieldToken}#code`);
    console.log("TokenBurnEscrow:", `https://sepolia.basescan.org/address/${contracts.TokenBurnEscrow}#code`);
    console.log("NFTYieldPool:", `https://sepolia.basescan.org/address/${contracts.NFTYieldPool}#code`);
    console.log("NFTYieldFactory:", `https://sepolia.basescan.org/address/${contracts.NFTYieldFactory}#code`);
    console.log("NFTYieldSplits:", `https://sepolia.basescan.org/address/${contracts.NFTYieldSplits}#code`);

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified");
    } else {
      console.error(`❌ Verification failed: ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });