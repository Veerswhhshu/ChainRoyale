// Script to add Hardhat network to MetaMask
// Run this in browser console or use it in your frontend

async function addHardhatNetwork() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Try to switch to Hardhat network first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      });
      console.log('Switched to Hardhat network');
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7A69', // 31337 in hex
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null,
              },
            ],
          });
          console.log('Hardhat network added to MetaMask');
        } catch (addError) {
          console.error('Failed to add Hardhat network:', addError);
        }
      } else {
        console.error('Failed to switch to Hardhat network:', switchError);
      }
    }
  } else {
    console.error('MetaMask is not installed');
  }
}

// Import a Hardhat account to MetaMask
async function importHardhatAccount() {
  console.log('To import a Hardhat account to MetaMask:');
  console.log('1. Open MetaMask');
  console.log('2. Click on account icon > Import Account');
  console.log('3. Select "Private Key" as import type');
  console.log('4. Use one of these private keys:');
  console.log('');
  console.log('Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  console.log('Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  console.log('');
  console.log('Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  console.log('Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
  console.log('');
  console.log('⚠️  WARNING: These are test accounts with publicly known private keys!');
  console.log('⚠️  NEVER use these accounts on mainnet or with real funds!');
}

// Run the functions
console.log('Adding Hardhat network to MetaMask...');
addHardhatNetwork();

console.log('\nHardhat Account Information:');
importHardhatAccount();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addHardhatNetwork, importHardhatAccount };
}