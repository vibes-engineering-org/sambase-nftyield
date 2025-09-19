const { run } = require("hardhat");
const fs = require('fs');

async function main() {
  // Read the latest deployment file
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    console.error("No deployments directory found!");
    process.exit(1);
  }

  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    console.error("No deployment files found!");
    process.exit(1);
  }

  const latestDeployment = deploymentFiles[0];
  const deploymentPath = `${deploymentsDir}/${latestDeployment}`;
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  console.log(`Using deployment file: ${latestDeployment}`);
  console.log(`Network: ${deployment.network} (Chain ID: ${deployment.chainId})`);

  const contracts = deployment.contracts;
  const config = deployment.configuration;

  try {
    console.log("\nStarting contract verification...");

    // Verify NFTYieldToken
    console.log("\n1. Verifying NFTYieldToken...");
    await run("verify:verify", {
      address: contracts.NFTYieldToken,
      constructorArguments: [
        config.teamWallet,
        config.communityRewardsPool,
        config.liquidityPool,
        config.platformTreasury
      ],
    });
    console.log("✅ NFTYieldToken verified");

    // Verify TokenBurnEscrow
    console.log("\n2. Verifying TokenBurnEscrow...");
    await run("verify:verify", {
      address: contracts.TokenBurnEscrow,
      constructorArguments: [
        config.samishToken,
        config.lotteryWallet
      ],
    });
    console.log("✅ TokenBurnEscrow verified");

    // Verify NFTYieldPool
    console.log("\n3. Verifying NFTYieldPool...");
    await run("verify:verify", {
      address: contracts.NFTYieldPool,
      constructorArguments: [
        config.feeRecipient,
        contracts.NFTYieldToken
      ],
    });
    console.log("✅ NFTYieldPool verified");

    // Verify NFTYieldFactory
    console.log("\n4. Verifying NFTYieldFactory...");
    await run("verify:verify", {
      address: contracts.NFTYieldFactory,
      constructorArguments: [
        config.feeRecipient,
        contracts.NFTYieldToken
      ],
    });
    console.log("✅ NFTYieldFactory verified");

    console.log("\n" + "=".repeat(60));
    console.log("All contracts verified successfully! 🎉");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\nVerification failed:", error.message);

    // Common verification issues and solutions
    console.log("\nCommon solutions:");
    console.log("1. Wait a few minutes and try again");
    console.log("2. Check if contracts are already verified");
    console.log("3. Verify constructor arguments are correct");
    console.log("4. Check if API keys are set correctly");
    console.log("5. Verify network configuration in hardhat.config.js");

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });