const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Deploy NFTContract
  console.log("Deploying NFTContract...");
  const NFTContract = await hre.ethers.getContractFactory("NFTContract");
  const nftContract = await NFTContract.deploy();
  await nftContract.waitForDeployment();
  const nftContractAddress = await nftContract.getAddress();
  console.log("NFTContract deployed to:", nftContractAddress);

  // Deploy NFTMarketplace
  console.log("\nDeploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("NFTMarketplace deployed to:", marketplaceAddress);

  // Get deployment block number
  const blockNumber = await hre.ethers.provider.getBlockNumber();

  // Prepare deployment data
  const deploymentData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    blockNumber: blockNumber,
    timestamp: new Date().toISOString(),
    contracts: {
      nftContract: nftContractAddress,
      marketplace: marketplaceAddress,
    },
  };

  // Save deployment data to JSON file
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  console.log("\nDeployment data saved to:", deploymentPath);

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", deploymentData.chainId);
  console.log("NFT Contract:", nftContractAddress);
  console.log("Marketplace:", marketplaceAddress);
  console.log("Block Number:", blockNumber);
  console.log("=".repeat(60));

  // Wait for block confirmations before verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await nftContract.deploymentTransaction().wait(5);
    await marketplace.deploymentTransaction().wait(5);
    console.log("Confirmations received!");

    console.log("\nTo verify contracts, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${nftContractAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${marketplaceAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
