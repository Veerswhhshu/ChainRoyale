# Complete Hardhat Setup Guide for NFT Marketplace

## 🚀 Quick Start

### 1. Start Hardhat Node
```bash
npx hardhat node
```
This will start a local blockchain at `http://127.0.0.1:8545` with 20 accounts, each having 10,000 ETH.

### 2. Deploy Contracts (in a new terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Copy ABIs to Frontend
```bash
npm run copy-abis
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

## 📋 Contract Addresses (Already Deployed)

- **NFT Contract:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Marketplace:** `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Chain ID:** `31337`

## 🦊 MetaMask Setup

### Add Hardhat Network to MetaMask

1. **Open MetaMask**
2. **Click Network Dropdown** (usually shows "Ethereum Mainnet")
3. **Click "Add Network"**
4. **Fill in these details:**
   - **Network Name:** `Hardhat Local`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
   - **Block Explorer:** (leave empty)

### Import Hardhat Account

1. **In MetaMask, click account icon**
2. **Select "Import Account"**
3. **Choose "Private Key"**
4. **Use this private key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. **This imports account:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (10,000 ETH)

⚠️ **WARNING:** This is a test account with a publicly known private key. NEVER use it on mainnet!

## 🎯 Using the NFT Marketplace

### 1. Connect Wallet
- Open the frontend at `http://localhost:5173`
- Click "Connect Wallet"
- Select the imported Hardhat account
- Switch to Hardhat Local network if prompted

### 2. Mint an NFT
- Enter a token URI (or click "Quick Mint" for a sample)
- Click "Mint NFT"
- Confirm transaction in MetaMask
- Your NFT will be minted with Token ID starting from 0

### 3. List NFT for Sale
- Enter the Token ID you want to sell
- Enter price in ETH (e.g., 0.1)
- Click "List NFT"
- This will:
  1. First approve the marketplace to transfer your NFT
  2. Then list it for sale

### 4. Buy an NFT
- Browse listed NFTs in the marketplace section
- Click "Buy NFT" on any NFT you don't own
- Confirm transaction with exact price
- The NFT will be transferred to you

## 🔧 Troubleshooting

### MetaMask Issues

1. **"Could not fetch chain ID" error:**
   - Make sure Hardhat node is running
   - Check RPC URL is exactly `http://127.0.0.1:8545`
   - Try refreshing MetaMask

2. **Transaction fails:**
   - Make sure you have enough ETH for gas
   - Check you're on the correct network (Hardhat Local)
   - Try increasing gas limit

3. **MetaMask not connecting:**
   - Refresh the page
   - Disconnect and reconnect wallet
   - Clear browser cache

### Contract Issues

1. **"Contract not found" error:**
   - Make sure contracts are deployed
   - Check contract addresses in `frontend/src/utils/contracts.js`
   - Verify you're on the correct network

2. **"Not the NFT owner" error:**
   - You can only list NFTs you own
   - Check the Token ID exists and you own it

3. **"Marketplace not approved" error:**
   - Always approve the marketplace before listing
   - The frontend does this automatically

## 📁 Project Structure

```
nft-marketplace-royalty/
├── contracts/
│   ├── NFTContract.sol          # ERC721 with royalties
│   └── NFTMarketplace.sol       # Marketplace contract
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── HardhatNFTInterface.jsx  # Main interface
│   │   ├── context/
│   │   │   └── WalletContext.jsx        # Wallet connection
│   │   └── utils/
│   │       ├── contracts.js             # Contract addresses
│   │       └── abis/                    # Contract ABIs
├── scripts/
│   ├── deploy.js                # Deployment script
│   └── copy-abis.js            # Copy ABIs to frontend
└── deployment.json             # Deployed contract info
```

## 🎨 Sample Token URIs for Testing

Use these for quick testing:

```
https://example.com/metadata/1.json
https://ipfs.io/ipfs/QmYourHashHere
data:application/json,{"name":"Test NFT","description":"A test NFT","image":"https://via.placeholder.com/400"}
```

## 💡 Tips

1. **Always test on Hardhat first** before deploying to testnets
2. **Keep Hardhat node running** while developing
3. **Use different accounts** to test buying/selling
4. **Check transaction status** in MetaMask activity
5. **Restart Hardhat node** if you encounter issues

## 🔄 Restarting Everything

If you encounter issues, restart in this order:

1. **Stop Hardhat node** (Ctrl+C)
2. **Start Hardhat node** (`npx hardhat node`)
3. **Redeploy contracts** (`npx hardhat run scripts/deploy.js --network localhost`)
4. **Copy ABIs** (`npm run copy-abis`)
5. **Refresh frontend** (F5 in browser)
6. **Reconnect MetaMask** if needed

## 🌐 Network Information

- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency:** ETH
- **Block Time:** Instant (on transaction)
- **Gas Price:** Very low (test environment)

## 📊 Contract Features

### NFT Contract
- ✅ ERC721 standard compliance
- ✅ EIP-2981 royalty support (5% default)
- ✅ Metadata URI storage
- ✅ Creator tracking
- ✅ Safe minting

### Marketplace Contract
- ✅ List NFTs for sale
- ✅ Buy NFTs with ETH
- ✅ Automatic royalty distribution
- ✅ 2% platform fee
- ✅ Cancel listings
- ✅ View active listings

## 🎯 Next Steps

1. **Test all functionality** on Hardhat
2. **Deploy to Sepolia testnet** for public testing
3. **Get Sepolia ETH** from faucets
4. **Deploy to mainnet** when ready (with real ETH)

Your NFT marketplace is now ready to use with Hardhat! 🎉