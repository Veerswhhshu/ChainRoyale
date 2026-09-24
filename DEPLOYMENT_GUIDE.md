# Deployment Guide

## Quick Start Guide

This guide will walk you through deploying the NFT Marketplace to Polygon Amoy testnet and running the frontend.

## Prerequisites

1. **Node.js and npm** installed (v16 or higher)
2. **MetaMask** browser extension installed
3. **Polygon Amoy testnet MATIC** in your wallet

## Step-by-Step Deployment

### Step 1: Get Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Amoy Testnet"
3. Enter your wallet address
4. Click "Submit" to receive test MATIC
5. Wait for confirmation (usually 1-2 minutes)

### Step 2: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your details:
```env
PRIVATE_KEY=your_private_key_here
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_api_key_here
```

**Getting your private key from MetaMask**:
- Click MetaMask extension
- Click three dots → Account details
- Click "Export Private Key"
- Enter password
- Copy the key (without 0x prefix)

**Getting PolygonScan API key**:
- Visit [PolygonScan](https://polygonscan.com/apis)
- Sign up for free account
- Create new API key
- Copy the key

### Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 4: Compile Contracts

```bash
npm run compile
```

Expected output: "Compiled X Solidity files successfully"

### Step 5: Run Tests (Optional but Recommended)

```bash
npm test
```

Expected output: All 20 tests passing ✓

### Step 6: Deploy to Amoy Testnet

```bash
npm run deploy:amoy
```

Expected output:
```
Deploying contracts with account: 0x...
NFTContract deployed to: 0x...
NFTMarketplace deployed to: 0x...
Deployment data saved to: deployment.json
```

**Save these contract addresses!** You'll need them for the frontend.

### Step 7: Verify Contracts (Optional)

```bash
npm run verify
```

This makes your contracts viewable on PolygonScan.

### Step 8: Copy ABIs to Frontend

```bash
npm run copy-abis
```

Expected output: "ABIs copied successfully!"

### Step 9: Update Frontend Configuration

1. Open `frontend/src/utils/contracts.js`
2. Find the `amoy` section
3. Update with your deployed addresses:

```javascript
amoy: {
  nftContract: '0xYourNFTContractAddress',
  marketplace: '0xYourMarketplaceAddress',
  chainId: 80002,
},
```

### Step 10: Start Frontend

```bash
npm run frontend
```

Or manually:
```bash
cd frontend
npm run dev
```

The app will open at `http://localhost:3000`

### Step 11: Connect Wallet

1. Open the app in your browser
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. If on wrong network, click "Switch to Amoy"

### Step 12: Test the Marketplace

**Mint an NFT**:
1. Go to "Mint NFT" page
2. Fill in name, description
3. Upload an image
4. Set royalty (e.g., 5%)
5. Click "Mint NFT"
6. Approve transaction in MetaMask
7. Wait for confirmation

**List NFT for Sale**:
1. Go to "My NFTs" page
2. Find your minted NFT
3. Click "List for Sale"
4. Enter price (e.g., 0.1 MATIC)
5. Click "Confirm"
6. Approve marketplace (first time only)
7. Confirm listing transaction

**Buy an NFT** (use a different account):
1. Switch to another MetaMask account
2. Go to "Home" page
3. Find a listed NFT
4. Click "Buy"
5. Confirm transaction
6. NFT transfers to your account
7. Payments distributed automatically

## Troubleshooting

### "Insufficient funds" error
- Get more test MATIC from the faucet
- Each transaction costs ~0.001-0.01 MATIC

### "Wrong network" warning
- Click "Switch to Amoy" button
- Or manually switch in MetaMask

### "Transaction failed" error
- Check you have enough MATIC
- Verify contract addresses are correct
- Try increasing gas limit

### NFT image not showing
- Images are stored as data URIs
- Large images may take time to load
- For production, use IPFS

### Contract not verified
- Ensure POLYGONSCAN_API_KEY is set
- Wait 1-2 minutes after deployment
- Run `npm run verify` again

## Production Deployment

For mainnet deployment:

1. **Get Real MATIC**: Purchase MATIC on an exchange
2. **Update Config**: Change network to Polygon mainnet
3. **Security Audit**: Have contracts audited
4. **Test Thoroughly**: Test all functionality on testnet
5. **Deploy**: Use same process with mainnet RPC
6. **Monitor**: Watch first transactions carefully

## Network Information

**Polygon Amoy Testnet**:
- Chain ID: 80002
- RPC: https://rpc-amoy.polygon.technology/
- Explorer: https://amoy.polygonscan.com/
- Faucet: https://faucet.polygon.technology/

**Polygon Mainnet** (for production):
- Chain ID: 137
- RPC: https://polygon-rpc.com/
- Explorer: https://polygonscan.com/

## Support

If you encounter issues:

1. Check the [README.md](README.md) for detailed documentation
2. Review [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
3. Read [REPORT.md](docs/REPORT.md) for implementation details
4. Check contract addresses in `deployment.json`
5. Verify transactions on PolygonScan

## Next Steps

After successful deployment:

1. **Test All Features**: Mint, list, buy, cancel
2. **Invite Users**: Share the app with friends
3. **Monitor Transactions**: Check PolygonScan for activity
4. **Gather Feedback**: Improve based on user experience
5. **Plan Production**: Prepare for mainnet deployment

## Security Reminders

- ⚠️ Never share your private key
- ⚠️ Never commit `.env` to git
- ⚠️ Use separate wallets for testing and production
- ⚠️ Audit contracts before mainnet deployment
- ⚠️ Start with small amounts on mainnet

---

Congratulations! Your NFT Marketplace is now live on Polygon Amoy testnet! 🎉
