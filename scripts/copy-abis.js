const fs = require('fs');
const path = require('path');

const artifactsPath = path.join(__dirname, '..', 'artifacts', 'contracts');
const frontendAbiPath = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'abis');

// Create directory if it doesn't exist
if (!fs.existsSync(frontendAbiPath)) {
  fs.mkdirSync(frontendAbiPath, { recursive: true });
}

// Copy NFTContract ABI
const nftContractArtifact = require(path.join(artifactsPath, 'NFTContract.sol', 'NFTContract.json'));
fs.writeFileSync(
  path.join(frontendAbiPath, 'NFTContract.json'),
  JSON.stringify(nftContractArtifact.abi, null, 2)
);

// Copy NFTMarketplace ABI
const marketplaceArtifact = require(path.join(artifactsPath, 'NFTMarketplace.sol', 'NFTMarketplace.json'));
fs.writeFileSync(
  path.join(frontendAbiPath, 'NFTMarketplace.json'),
  JSON.stringify(marketplaceArtifact.abi, null, 2)
);

console.log('ABIs copied successfully!');
