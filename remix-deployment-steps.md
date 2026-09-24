# Complete Remix IDE Deployment Guide

## Step 1: Setup Remix IDE

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new workspace or use the default one

## Step 2: Install Dependencies

### Method 1: Using Remix Package Manager
1. In File Explorer, click the "Install from NPM" button
2. Enter: `@openzeppelin/contracts@5.4.0`
3. Wait for installation to complete

### Method 2: Manual Import (if Method 1 fails)
1. Create folder structure: `contracts/@openzeppelin/contracts/`
2. You can import directly in your contracts using GitHub imports:
   ```solidity
   import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.4.0/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
   ```

## Step 3: Upload Contract Files

1. Create `contracts/NFTContract.sol`
2. Copy the content from `remix-contracts/NFTContract.sol`
3. Create `contracts/NFTMarketplace.sol`
4. Copy the content from `remix-contracts/NFTMarketplace.sol`

## Step 4: Compile Contracts

1. Go to "Solidity Compiler" tab (Ctrl+Shift+S)
2. Select compiler version: `0.8.20`
3. Enable optimization: 200 runs
4. Click "Compile NFTContract.sol"
5. Click "Compile NFTMarketplace.sol"
6. Ensure no compilation errors

## Step 5: Deploy Contracts

### For Testing (Remix VM):
1. Go to "Deploy & Run Transactions" tab
2. Select "Remix VM (Shanghai)" environment
3. Select "NFTContract" from dropdown
4. Click "Deploy"
5. Copy the deployed address
6. Select "NFTMarketplace" from dropdown
7. Click "Deploy"
8. Copy the deployed address

### For Polygon Amoy Testnet:
1. Make sure MetaMask is installed and connected
2. Add Polygon Amoy network to MetaMask:
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://amoy.polygonscan.com/

3. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
4. In Remix, select "Injected Provider - MetaMask"
5. Deploy NFTContract first
6. Deploy NFTMarketplace second
7. Save both contract addresses

## Step 6: Interact with Contracts

### Mint an NFT:
1. In deployed NFTContract, find "simpleMint" function
2. Enter a token URI (e.g., "https://example.com/metadata.json")
3. Click "transact"
4. Confirm transaction in MetaMask

### List NFT for Sale:
1. First, approve marketplace in NFTContract:
   - Function: "approve"
   - to: [marketplace contract address]
   - tokenId: [your token ID, usually 0 for first NFT]
2. In marketplace contract, use "listNFT":
   - nftContract: [NFT contract address]
   - tokenId: [your token ID]
   - price: [price in wei, e.g., 1000000000000000000 for 1 MATIC]

### Buy an NFT:
1. In marketplace contract, use "buyNFT":
   - nftContract: [NFT contract address]
   - tokenId: [token ID to buy]
   - Value: [exact price in wei]

## Step 7: Troubleshooting MetaMask Issues

### Common Issues and Solutions:

1. **MetaMask not connecting:**
   - Refresh the page
   - Disconnect and reconnect MetaMask
   - Clear browser cache
   - Try incognito/private mode

2. **Transaction failing:**
   - Check you have enough MATIC for gas
   - Increase gas limit manually
   - Check network is correct

3. **Contract not found:**
   - Verify contract addresses are correct
   - Ensure you're on the right network
   - Check contract is deployed successfully

4. **Approval issues:**
   - Always approve marketplace before listing
   - Check approval was successful
   - Use "getApproved" to verify

## Step 8: Sample Metadata JSON

Create a simple metadata file for testing:

```json
{
  "name": "My First NFT",
  "description": "This is my first NFT created in Remix",
  "image": "https://via.placeholder.com/400x400.png?text=My+NFT",
  "attributes": [
    {
      "trait_type": "Color",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

Host this JSON file on:
- IPFS (recommended)
- GitHub Gist
- Any public URL

## Step 9: Verify Contracts (Optional)

If deployed on Polygon Amoy:
1. Go to [Amoy PolygonScan](https://amoy.polygonscan.com/)
2. Search for your contract address
3. Go to "Contract" tab
4. Click "Verify and Publish"
5. Upload your source code

## Tips for Success:

1. **Always test on Remix VM first** before deploying to testnet
2. **Keep track of contract addresses** - write them down
3. **Start with small amounts** when testing transactions
4. **Check transaction status** on block explorer
5. **Use simple token URIs** for initial testing
6. **Approve before listing** - this is a common mistake

## Common Error Messages:

- "Not the NFT owner" - You don't own the NFT you're trying to list
- "Marketplace not approved" - You need to approve the marketplace first
- "Incorrect payment amount" - Send exact price when buying
- "Listing not active" - NFT is not currently for sale
- "Royalty fee too high" - Keep royalty under 10%