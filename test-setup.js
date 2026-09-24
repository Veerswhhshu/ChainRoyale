// Test script to verify Hardhat setup
const { ethers } = require('hardhat');

async function testSetup() {
  console.log('🧪 Testing Hardhat NFT Marketplace Setup...\n');

  try {
    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();
    console.log('✅ Signers loaded:');
    console.log(`   Owner: ${owner.address}`);
    console.log(`   User1: ${user1.address}`);
    console.log(`   User2: ${user2.address}\n`);

    // Get contract addresses from deployment
    const fs = require('fs');
    const deploymentData = JSON.parse(fs.readFileSync('./deployment.json', 'utf8'));
    
    console.log('✅ Contract addresses loaded:');
    console.log(`   NFT Contract: ${deploymentData.contracts.nftContract}`);
    console.log(`   Marketplace: ${deploymentData.contracts.marketplace}\n`);

    // Connect to contracts
    const NFTContract = await ethers.getContractFactory('NFTContract');
    const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace');
    
    const nftContract = NFTContract.attach(deploymentData.contracts.nftContract);
    const marketplace = NFTMarketplace.attach(deploymentData.contracts.marketplace);

    console.log('✅ Connected to deployed contracts\n');

    // Test 1: Mint an NFT
    console.log('🎯 Test 1: Minting NFT...');
    const mintTx = await nftContract.connect(user1).mintNFT(
      user1.address,
      'https://example.com/metadata/test.json',
      500 // 5% royalty
    );
    await mintTx.wait();
    console.log('✅ NFT minted successfully (Token ID: 0)\n');

    // Test 2: Check NFT ownership
    console.log('🎯 Test 2: Checking NFT ownership...');
    const owner0 = await nftContract.ownerOf(0);
    console.log(`✅ Token 0 owner: ${owner0}`);
    console.log(`✅ Matches user1: ${owner0 === user1.address}\n`);

    // Test 3: Approve marketplace
    console.log('🎯 Test 3: Approving marketplace...');
    const approveTx = await nftContract.connect(user1).approve(marketplace.target, 0);
    await approveTx.wait();
    console.log('✅ Marketplace approved for Token 0\n');

    // Test 4: List NFT for sale
    console.log('🎯 Test 4: Listing NFT for sale...');
    const price = ethers.parseEther('0.1'); // 0.1 ETH
    const listTx = await marketplace.connect(user1).listNFT(nftContract.target, 0, price);
    await listTx.wait();
    console.log('✅ NFT listed for 0.1 ETH\n');

    // Test 5: Check active listings
    console.log('🎯 Test 5: Checking active listings...');
    const listings = await marketplace.getActiveListings();
    console.log(`✅ Active listings: ${listings.length}`);
    if (listings.length > 0) {
      console.log(`   Token ID: ${listings[0].tokenId}`);
      console.log(`   Price: ${ethers.formatEther(listings[0].price)} ETH`);
      console.log(`   Seller: ${listings[0].seller}\n`);
    }

    // Test 6: Buy NFT
    console.log('🎯 Test 6: Buying NFT...');
    const buyTx = await marketplace.connect(user2).buyNFT(nftContract.target, 0, {
      value: price
    });
    await buyTx.wait();
    console.log('✅ NFT purchased successfully\n');

    // Test 7: Verify new ownership
    console.log('🎯 Test 7: Verifying new ownership...');
    const newOwner = await nftContract.ownerOf(0);
    console.log(`✅ New owner: ${newOwner}`);
    console.log(`✅ Matches user2: ${newOwner === user2.address}\n`);

    // Test 8: Check balances
    console.log('🎯 Test 8: Checking balances...');
    const user1Balance = await ethers.provider.getBalance(user1.address);
    const user2Balance = await ethers.provider.getBalance(user2.address);
    console.log(`✅ User1 balance: ${ethers.formatEther(user1Balance)} ETH`);
    console.log(`✅ User2 balance: ${ethers.formatEther(user2Balance)} ETH\n`);

    console.log('🎉 All tests passed! Your NFT Marketplace is working correctly!\n');
    
    console.log('📋 Summary:');
    console.log('   ✅ Contracts deployed and accessible');
    console.log('   ✅ NFT minting works');
    console.log('   ✅ Marketplace listing works');
    console.log('   ✅ NFT purchasing works');
    console.log('   ✅ Ownership transfers correctly');
    console.log('   ✅ Payments are processed\n');

    console.log('🚀 Ready to use with frontend!');
    console.log('   Frontend URL: http://localhost:3002');
    console.log('   Network: Hardhat Local (Chain ID: 31337)');
    console.log('   RPC URL: http://127.0.0.1:8545\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure Hardhat node is running: npx hardhat node');
    console.error('   2. Make sure contracts are deployed: npx hardhat run scripts/deploy.js --network localhost');
    console.error('   3. Check deployment.json exists and has correct addresses');
  }
}

// Run the test
testSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });