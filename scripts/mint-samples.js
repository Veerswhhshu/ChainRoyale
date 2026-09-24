const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Sample NFT data
const sampleNFTs = [
  {
    name: "Cosmic Dreams #1",
    description: "A mesmerizing journey through the cosmos",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4YjVjZjY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYzQ4OTk7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iODAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjUwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+",
    royalty: 500, // 5%
    price: "1.5"
  },
  {
    name: "Digital Sunset #42",
    description: "Where technology meets nature",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjU5ZTBiO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWY0NDQ0O3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjZykiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjYwIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjgiLz48L3N2Zz4=",
    royalty: 750, // 7.5%
    price: "0.8"
  },
  {
    name: "Abstract Waves",
    description: "Flowing through digital dimensions",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxMGI5ODE7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNTk2Njk7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik0wLDIwMCBRMTAwLDE1MCAyMDAsMjAwIFQgNDAwLDIwMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjYiLz48cGF0aCBkPSJNMCwyNTAgUTEwMCwyMDAgMjAwLDI1MCBUIDQwMCwyNTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+",
    royalty: 1000, // 10%
    price: "2.2"
  }
];

async function main() {
  console.log("Minting sample NFTs...\n");

  // Read deployment data
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("Error: deployment.json not found!");
    console.error("Please deploy contracts first.");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const nftContractAddress = deploymentData.contracts.nftContract;
  const marketplaceAddress = deploymentData.contracts.marketplace;

  // Get signers
  const [minter] = await hre.ethers.getSigners();
  console.log("Minting with account:", minter.address);

  // Get contract instances
  const NFTContract = await hre.ethers.getContractAt("NFTContract", nftContractAddress);
  const Marketplace = await hre.ethers.getContractAt("NFTMarketplace", marketplaceAddress);

  // Mint and list NFTs
  for (let i = 0; i < sampleNFTs.length; i++) {
    const nft = sampleNFTs[i];
    
    console.log(`\n[${i + 1}/${sampleNFTs.length}] Minting: ${nft.name}`);
    
    // Create metadata
    const metadata = {
      name: nft.name,
      description: nft.description,
      image: nft.image
    };
    const metadataJSON = JSON.stringify(metadata);
    const metadataURI = `data:application/json;base64,${Buffer.from(metadataJSON).toString('base64')}`;

    // Mint NFT
    const mintTx = await NFTContract.mintNFT(minter.address, metadataURI, nft.royalty);
    await mintTx.wait();
    console.log(`  ✓ Minted with ${nft.royalty / 100}% royalty`);

    // Get token ID
    const tokenId = i;

    // Approve marketplace
    const approveTx = await NFTContract.approve(marketplaceAddress, tokenId);
    await approveTx.wait();
    console.log(`  ✓ Approved marketplace`);

    // List on marketplace
    const price = hre.ethers.parseEther(nft.price);
    const listTx = await Marketplace.listNFT(nftContractAddress, tokenId, price);
    await listTx.wait();
    console.log(`  ✓ Listed for ${nft.price} MATIC`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Successfully minted and listed", sampleNFTs.length, "NFTs!");
  console.log("=".repeat(60));
  console.log("\nYou can now view them in the marketplace at http://localhost:3000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
