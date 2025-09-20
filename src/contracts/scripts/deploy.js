const { ethers } = require("hardhat");

async function main() {
  console.log("Starting NFTYield contract deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Configuration addresses - UPDATE THESE FOR MAINNET
  const teamWallet = process.env.TEAM_WALLET || deployer.address;
  const communityRewardsPool = process.env.COMMUNITY_POOL || deployer.address;
  const liquidityPool = process.env.LIQUIDITY_POOL || deployer.address;
  const platformTreasury = process.env.PLATFORM_TREASURY || deployer.address;
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const lotteryWallet = process.env.LOTTERY_WALLET || deployer.address;
  const samishTokenAddress = process.env.SAMISH_TOKEN_ADDRESS || "0x086bb3d90d719eb50d569e071b9987080ecb9781";

  console.log("\nDeployment Configuration:");
  console.log("Team Wallet:", teamWallet);
  console.log("Community Pool:", communityRewardsPool);
  console.log("Liquidity Pool:", liquidityPool);
  console.log("Platform Treasury:", platformTreasury);
  console.log("Fee Recipient:", feeRecipient);
  console.log("Lottery Wallet:", lotteryWallet);
  console.log("Samish Token:", samishTokenAddress);

  try {
    // 1. Deploy BaseApp Token
    console.log("\n1. Deploying BaseAppToken...");
    const BaseAppToken = await ethers.getContractFactory("BaseAppToken");
    const baseAppToken = await BaseAppToken.deploy();
    await baseAppToken.waitForDeployment();
    const baseAppTokenAddress = await baseAppToken.getAddress();
    console.log("BaseAppToken deployed to:", baseAppTokenAddress);

    // 2. Deploy NFTYIELD Token
    console.log("\n2. Deploying NFTYieldToken...");
    const NFTYieldToken = await ethers.getContractFactory("NFTYieldToken");
    const nftyToken = await NFTYieldToken.deploy(
      teamWallet,
      communityRewardsPool,
      liquidityPool,
      platformTreasury
    );
    await nftyToken.waitForDeployment();
    const nftyTokenAddress = await nftyToken.getAddress();
    console.log("NFTYieldToken deployed to:", nftyTokenAddress);

    // 3. Deploy Token Burn Escrow
    console.log("\n3. Deploying TokenBurnEscrow...");
    const TokenBurnEscrow = await ethers.getContractFactory("TokenBurnEscrow");
    const burnEscrow = await TokenBurnEscrow.deploy(
      samishTokenAddress,
      lotteryWallet
    );
    await burnEscrow.waitForDeployment();
    const burnEscrowAddress = await burnEscrow.getAddress();
    console.log("TokenBurnEscrow deployed to:", burnEscrowAddress);

    // 4. Deploy NFT Yield Pool
    console.log("\n4. Deploying NFTYieldPool...");
    const NFTYieldPool = await ethers.getContractFactory("NFTYieldPool");
    const yieldPool = await NFTYieldPool.deploy(
      feeRecipient,
      nftyTokenAddress
    );
    await yieldPool.waitForDeployment();
    const yieldPoolAddress = await yieldPool.getAddress();
    console.log("NFTYieldPool deployed to:", yieldPoolAddress);

    // 5. Deploy NFT Yield Factory
    console.log("\n5. Deploying NFTYieldFactory...");
    const NFTYieldFactory = await ethers.getContractFactory("NFTYieldFactory");
    const yieldFactory = await NFTYieldFactory.deploy(
      feeRecipient,
      nftyTokenAddress
    );
    await yieldFactory.waitForDeployment();
    const yieldFactoryAddress = await yieldFactory.getAddress();
    console.log("NFTYieldFactory deployed to:", yieldFactoryAddress);

    // Wait for a few block confirmations
    console.log("\nWaiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify BaseApp token deployment
    console.log("\n6. Verifying BaseAppToken deployment...");
    const baseAppTotalSupply = await baseAppToken.totalSupply();
    const baseAppContractBalance = await baseAppToken.balanceOf(baseAppTokenAddress);
    console.log("BaseApp Token total supply:", ethers.formatEther(baseAppTotalSupply));
    console.log("BaseApp Token contract balance:", ethers.formatEther(baseAppContractBalance));

    // Verify initial token distribution
    console.log("\n7. Verifying NFTY token distribution...");
    const totalSupply = await nftyToken.totalSupply();
    console.log("Total NFTY tokens minted:", ethers.formatEther(totalSupply));

    const teamBalance = await nftyToken.balanceOf(teamWallet);
    const communityBalance = await nftyToken.balanceOf(communityRewardsPool);
    const liquidityBalance = await nftyToken.balanceOf(liquidityPool);
    const treasuryBalance = await nftyToken.balanceOf(platformTreasury);
    const specialBalance = await nftyToken.balanceOf("0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2");

    console.log("Team allocation (15%):", ethers.formatEther(teamBalance), "NFTY");
    console.log("Community allocation (35%):", ethers.formatEther(communityBalance), "NFTY");
    console.log("Liquidity allocation (25%):", ethers.formatEther(liquidityBalance), "NFTY");
    console.log("Treasury allocation (15%):", ethers.formatEther(treasuryBalance), "NFTY");
    console.log("Special allocation (10%) to 0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2:", ethers.formatEther(specialBalance), "NFTY");

    // 8. Update factory with pool implementation
    console.log("\n8. Setting up factory templates...");

    // Create the first template with the deployed pool implementation
    await yieldFactory.updateTemplateImplementation(1, yieldPoolAddress);
    await yieldFactory.updateTemplateImplementation(2, yieldPoolAddress);
    await yieldFactory.updateTemplateImplementation(3, yieldPoolAddress);

    console.log("Factory templates configured with pool implementation");

    // 9. Output deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("Network:", await ethers.provider.getNetwork().then(n => n.name));
    console.log("Block Number:", await ethers.provider.getBlockNumber());
    console.log("Gas Price:", ethers.formatUnits(await ethers.provider.getFeeData().then(f => f.gasPrice || 0), "gwei"), "gwei");
    console.log("");
    console.log("Contract Addresses:");
    console.log("BaseAppToken (BAPP):", baseAppTokenAddress);
    console.log("NFTYieldToken (NFTY):", nftyTokenAddress);
    console.log("TokenBurnEscrow:", burnEscrowAddress);
    console.log("NFTYieldPool:", yieldPoolAddress);
    console.log("NFTYieldFactory:", yieldFactoryAddress);
    console.log("");
    console.log("Configuration:");
    console.log("Samish Token:", samishTokenAddress);
    console.log("Fee Recipient:", feeRecipient);
    console.log("Lottery Wallet:", lotteryWallet);
    console.log("=".repeat(60));

    // 10. Save deployment info to file
    const deploymentInfo = {
      network: await ethers.provider.getNetwork().then(n => n.name),
      chainId: await ethers.provider.getNetwork().then(n => n.chainId),
      blockNumber: await ethers.provider.getBlockNumber(),
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        BaseAppToken: baseAppTokenAddress,
        NFTYieldToken: nftyTokenAddress,
        TokenBurnEscrow: burnEscrowAddress,
        NFTYieldPool: yieldPoolAddress,
        NFTYieldFactory: yieldFactoryAddress
      },
      configuration: {
        samishToken: samishTokenAddress,
        teamWallet,
        communityRewardsPool,
        liquidityPool,
        platformTreasury,
        feeRecipient,
        lotteryWallet
      }
    };

    const fs = require('fs');
    const deploymentPath = `./deployments/${Date.now()}-deployment.json`;

    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to:", deploymentPath);

    console.log("\nDeployment completed successfully! 🎉");
    console.log("\nNext Steps:");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Update frontend configuration with new addresses");
    console.log("3. Set up initial liquidity pools");
    console.log("4. Configure governance parameters");
    console.log("5. Test all contract interactions");

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