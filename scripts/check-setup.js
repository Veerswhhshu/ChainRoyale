const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 NFT Marketplace Setup Diagnostic\n');
console.log('='.repeat(60));

let allGood = true;

// Check 1: deployment.json exists
console.log('\n1. Checking deployment.json...');
const deploymentPath = path.join(__dirname, '..', 'deployment.json');
if (fs.existsSync(deploymentPath)) {
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log('   ✅ deployment.json found');
  console.log('   📍 NFT Contract:', deployment.contracts.nftContract);
  console.log('   📍 Marketplace:', deployment.contracts.marketplace);
  console.log('   🌐 Network:', deployment.network);
  console.log('   🔗 Chain ID:', deployment.chainId);
} else {
  console.log('   ❌ deployment.json NOT found');
  console.log('   💡 Run: npm run deploy:local');
  allGood = false;
}

// Check 2: ABIs copied
console.log('\n2. Checking ABIs...');
const abiPath = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'abis');
if (fs.existsSync(abiPath)) {
  const nftAbi = path.join(abiPath, 'NFTContract.json');
  const marketplaceAbi = path.join(abiPath, 'NFTMarketplace.json');
  
  if (fs.existsSync(nftAbi) && fs.existsSync(marketplaceAbi)) {
    console.log('   ✅ ABIs found');
    console.log('   📄 NFTContract.json');
    console.log('   📄 NFTMarketplace.json');
  } else {
    console.log('   ❌ ABIs NOT found');
    console.log('   💡 Run: npm run copy-abis');
    allGood = false;
  }
} else {
  console.log('   ❌ ABIs directory NOT found');
  console.log('   💡 Run: npm run copy-abis');
  allGood = false;
}

// Check 3: Hardhat node
console.log('\n3. Checking Hardhat node...');
exec('lsof -i :8545', (error, stdout) => {
  if (stdout) {
    console.log('   ✅ Hardhat node is running on port 8545');
  } else {
    console.log('   ❌ Hardhat node NOT running');
    console.log('   💡 Run: npx hardhat node');
    allGood = false;
  }
  
  // Check 4: Frontend dependencies
  console.log('\n4. Checking frontend dependencies...');
  const frontendNodeModules = path.join(__dirname, '..', 'frontend', 'node_modules');
  if (fs.existsSync(frontendNodeModules)) {
    console.log('   ✅ Frontend dependencies installed');
  } else {
    console.log('   ❌ Frontend dependencies NOT installed');
    console.log('   💡 Run: cd frontend && npm install');
    allGood = false;
  }

  // Check 5: Contract addresses in frontend
  console.log('\n5. Checking contract configuration...');
  const contractsConfig = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'contracts.js');
  if (fs.existsSync(contractsConfig)) {
    const config = fs.readFileSync(contractsConfig, 'utf8');
    if (config.includes('0x5FbDB2315678afecb367f032d93F642f64180aa3')) {
      console.log('   ✅ Contract addresses configured');
    } else {
      console.log('   ⚠️  Contract addresses may need updating');
      console.log('   💡 Check frontend/src/utils/contracts.js');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allGood) {
    console.log('✅ All checks passed! Your setup looks good.');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure MetaMask is on Localhost 8545 network');
    console.log('   2. Import test account with private key:');
    console.log('      0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
    console.log('   3. Start frontend: cd frontend && npm run dev');
    console.log('   4. Open http://localhost:3000');
    console.log('   5. Connect wallet and start minting!');
  } else {
    console.log('❌ Some issues found. Please fix them and try again.');
    console.log('\n📝 Quick fix:');
    console.log('   Terminal 1: npx hardhat node');
    console.log('   Terminal 2: npm run deploy:local && npm run copy-abis');
    console.log('   Terminal 3: cd frontend && npm run dev');
  }
  console.log('='.repeat(60));
  console.log('\n💡 For more help, see TROUBLESHOOTING.md\n');
});
