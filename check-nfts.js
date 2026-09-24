// Script to check current NFT state and help debug listing issues
const { ethers } = require('hardhat');

async function checkNFTState() {
  console.log('🔍 Checking NFT state...\n');

  try {
    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();
    
    // Get contract addresses from deployment
    const fs = require('fs');
    const deploymentData = JSON.parse(fs.readFileSync('./deployment.json', 'utf8'));
    
    // Connect to contracts
    const NFTContract = await ethers.getContractFactory('NFTContract');
    const nftContract = NFTContract.attach(deploymentData.contracts.nftContract);

    console.log('📋 Contract Info:');
    console.log(`   NFT Contract: ${deploymentData.contracts.nftContract}`);
    console.log(`   Marketplace: ${deploymentData.contracts.marketplace}\n`);

    // Check current token ID counter
    const currentTokenId = await nftContract.getCurrentTokenId();
    const tokenCount = Number(currentTokenId);
    console.log(`📊 Current Token ID Counter: ${tokenCount}`);
    console.log(`   Next token to be minted: ${tokenCount}`);
    console.log(`   Existing tokens: 0 to ${tokenCount - 1}\n`);

    // Check ownership of existing tokens
    if (tokenCount > 0) {
      console.log('👤 Token Ownership:');
      for (let i = 0; i < tokenCount; i++) {
        try {
          const owner = await nftContract.ownerOf(i);
          const tokenURI = await nftContract.tokenURI(i);
          console.log(`   Token ${i}: Owner = ${owner}`);
          console.log(`            URI = ${tokenURI}`);
        } catch (error) {
          console.log(`   Token ${i}: Does not exist or error`);
        }
      }
    } else {
      console.log('❌ No NFTs have been minted yet');
    }

    console.log('\n💡 To fix listing issues:');
    console.log('1. Make sure you own the token you\'re trying to list');
    console.log('2. Use token IDs from 0 to', tokenCount - 1);
    console.log('3. Mint some NFTs first if none exist');
    
    // Mint a test NFT for the main account if none exist
    if (tokenCount == 0) {
      console.log('\n🎯 Minting a test NFT for you...');
      const mintTx = await nftContract.mintNFT(
        owner.address,
        'https://example.com/metadata/test.json',
        500
      );
      await mintTx.wait();
      console.log('✅ Test NFT minted! Token ID: 0');
      console.log(`   Owner: ${owner.address}`);
      console.log('   You can now list Token ID 0 for sale');
    }

  } catch (error) {
    console.error('❌ Error checking NFT state:', error.message);
  }
}

// Run the check
checkNFTState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });