# NFT Marketplace Remix IDE Setup Guide

## 1. Create Folder Structure in Remix

Create the following folders in Remix IDE:
```
contracts/
├── NFTContract.sol
├── NFTMarketplace.sol
└── dependencies/
    └── @openzeppelin/
```

## 2. Install OpenZeppelin Dependencies

In Remix, go to the "File Explorer" and create a new file:
`contracts/dependencies/@openzeppelin/contracts/package.json`

Add this content:
```json
{
  "name": "@openzeppelin/contracts",
  "version": "5.4.0"
}
```

Or use Remix's built-in package manager:
1. Go to "File Explorer"
2. Click on "Install from NPM"
3. Enter: `@openzeppelin/contracts@5.4.0`

## 3. Upload Contract Files

Copy the contents of your contract files to Remix:

### NFTContract.sol
- Create `contracts/NFTContract.sol` in Remix
- Copy the entire content from your local `contracts/NFTContract.sol`

### NFTMarketplace.sol  
- Create `contracts/NFTMarketplace.sol` in Remix
- Copy the entire content from your local `contracts/NFTMarketplace.sol`

## 4. Compile Contracts

1. Go to "Solidity Compiler" tab
2. Select compiler version: `0.8.20`
3. Enable optimization (200 runs)
4. Compile both contracts

## 5. Deploy Contracts

### For Local Testing (Remix VM):
1. Go to "Deploy & Run Transactions" tab
2. Select "Remix VM (Shanghai)" environment
3. Deploy NFTContract first
4. Deploy NFTMarketplace second
5. Copy the deployed contract addresses

### For Polygon Amoy Testnet:
1. Select "Injected Provider - MetaMask" environment
2. Make sure MetaMask is connected to Polygon Amoy
3. Deploy contracts (requires MATIC for gas)

## 6. Interact with Contracts

Use Remix's interface to:
- Mint NFTs using `mintNFT` function
- List NFTs on marketplace using `listNFT`
- Buy NFTs using `buyNFT`

## 7. MetaMask Configuration

Add Polygon Amoy network to MetaMask:
- Network Name: Polygon Amoy Testnet
- RPC URL: https://rpc-amoy.polygon.technology/
- Chain ID: 80002
- Currency Symbol: MATIC
- Block Explorer: https://amoy.polygonscan.com/

## 8. Get Test MATIC

Get free MATIC from Polygon faucet:
https://faucet.polygon.technology/