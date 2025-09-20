const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying BaseApp Token to Base network...");

  // Get the contract factory
  const BaseAppToken = await ethers.getContractFactory("BaseAppToken");

  // Deploy the contract
  const token = await BaseAppToken.deploy();
  await token.deployed();

  console.log("BaseApp Token deployed to:", token.address);
  console.log("Marketing wallet airdrop:", "0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2");
  console.log("Marketing allocation: 100,000,000 BAPP (10% of supply)");

  // Verify the deployment
  const totalSupply = await token.totalSupply();
  const marketingBalance = await token.balanceOf("0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2");
  const contractBalance = await token.balanceOf(token.address);

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "BAPP");
  console.log("Marketing Wallet Balance:", ethers.utils.formatEther(marketingBalance), "BAPP");
  console.log("Contract Balance (Available for Sale):", ethers.utils.formatEther(contractBalance), "BAPP");
  console.log("Initial Price:", ethers.utils.formatEther(await token.getCurrentPrice()), "ETH per BAPP");
  console.log("Trading Enabled:", await token.tradingEnabled());

  // Save deployment info
  const deploymentInfo = {
    address: token.address,
    totalSupply: totalSupply.toString(),
    marketingWallet: "0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2",
    marketingAllocation: marketingBalance.toString(),
    network: "base",
    deployedAt: new Date().toISOString()
  };

  console.log("\nSave this contract address to update your frontend:");
  console.log("CONTRACT_ADDRESS =", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });