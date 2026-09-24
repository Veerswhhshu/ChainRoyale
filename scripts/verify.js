const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting contract verification...\n");

  // Read deployment data
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("Error: deployment.json not found!");
    console.error("Please deploy contracts first using: npx hardhat run scripts/deploy.js");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  console.log("Network:", deploymentData.network);
  console.log("NFT Contract:", deploymentData.contracts.nftContract);
  console.log("Marketplace:", deploymentData.contracts.marketplace);
  console.log();

  // Verify NFTContract
  try {
    console.log("Verifying NFTContract...");
    await hre.run("verify:verify", {
      address: deploymentData.contracts.nftContract,
      constructorArguments: [],
    });
    console.log("NFTContract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("NFTContract is already verified!");
    } else {
      console.error("Error verifying NFTContract:", error.message);
    }
  }

  console.log();

  // Verify NFTMarketplace
  try {
    console.log("Verifying NFTMarketplace...");
    await hre.run("verify:verify", {
      address: deploymentData.contracts.marketplace,
      constructorArguments: [],
    });
    console.log("NFTMarketplace verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("NFTMarketplace is already verified!");
    } else {
      console.error("Error verifying NFTMarketplace:", error.message);
    }
  }

  console.log("\nVerification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
