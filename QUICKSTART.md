# Quick Start Guide

Get your NFT Marketplace running in 10 minutes!

## Prerequisites

- Node.js v16+ installed
- MetaMask browser extension
- 5 minutes of your time

## Step 1: Install (2 minutes)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Test (1 minute)

```bash
# Run the test suite
npm test
```

You should see: **20 passing** ✅

## Step 3: Local Development (2 minutes)

### Terminal 1: Start Hardhat Node

```bash
npm run node
```

Keep this running.

### Terminal 2: Deploy Contracts

```bash
npm run deploy:local
```

Save the contract addresses shown!

### Terminal 3: Copy ABIs

```bash
npm run copy-abis
```

## Step 4: Configure Frontend (1 minute)

The local deployment uses default addresses in `frontend/src/utils/contracts.js`.

If you need to update them:

1. Open `frontend/src/utils/contracts.js`
2. Update the `localhost` section with your deployed addresses

## Step 5: Start Frontend (1 minute)

```bash
npm run frontend
```

Opens at: http://localhost:3000

## Step 6: Connect Wallet (1 minute)

1. Click "Connect Wallet"
2. Approve MetaMask connection
3. You're connected! 🎉

## Step 7: Try It Out! (2 minutes)

### Mint Your First NFT

1. Go to "Mint NFT"
2. Enter name: "My First NFT"
3. Upload any image
4. Set royalty: 5%
5. Click "Mint NFT"
6. Approve in MetaMask
7. Wait for confirmation

### List It for Sale

1. Go to "My NFTs"
2. Find your NFT
3. Click "List for Sale"
4. Enter price: 0.1
5. Click "Confirm"
6. Approve marketplace (first time)
7. Confirm listing

### Buy It (with another account)

1. Switch MetaMask account
2. Go to "Home"
3. Find the listed NFT
4. Click "Buy"
5. Confirm transaction
6. NFT is yours!

## 🎉 Congratulations!

You've successfully:
- ✅ Deployed the marketplace
- ✅ Minted an NFT
- ✅ Listed it for sale
- ✅ Completed a purchase

## Next Steps

### Deploy to Polygon Amoy Testnet

1. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Add your private key and RPC URL to `.env`
4. Deploy:
   ```bash
   npm run deploy:amoy
   ```
5. Update frontend addresses in `contracts.js`
6. Start frontend and test!

### Read the Docs

- [README.md](README.md) - Full documentation
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [REPORT.md](docs/REPORT.md) - Technical report

## Troubleshooting

### "Insufficient funds"
- You need ETH in your wallet for gas fees
- On local network, Hardhat provides test accounts with ETH

### "Wrong network"
- Click "Switch to Amoy" button
- Or manually switch in MetaMask

### "Transaction failed"
- Check you have enough ETH for gas
- Verify contract addresses are correct
- Try refreshing the page

### Need Help?

Check the [README.md](README.md) troubleshooting section or review the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Commands Reference

```bash
# Testing
npm test                    # Run all tests
npm run compile            # Compile contracts

# Local Development
npm run node               # Start local blockchain
npm run deploy:local       # Deploy to local network

# Testnet Deployment
npm run deploy:amoy        # Deploy to Polygon Amoy
npm run verify             # Verify contracts

# Frontend
npm run copy-abis          # Copy ABIs to frontend
npm run frontend           # Start frontend dev server
npm run build:frontend     # Build frontend for production
```

## Project Structure

```
nft-marketplace-royalty/
├── contracts/           # Smart contracts
├── test/               # Test files
├── scripts/            # Deployment scripts
├── frontend/           # React application
│   └── src/
│       ├── components/ # UI components
│       ├── pages/      # Page components
│       ├── context/    # Wallet context
│       └── utils/      # Utilities & ABIs
└── docs/              # Documentation
```

## Key Features

- 🎨 **Mint NFTs** with custom royalties
- 💰 **Automatic Royalties** on secondary sales
- 🏪 **Marketplace** for buying and selling
- 🔒 **Secure** with comprehensive testing
- 📱 **Responsive** design for all devices

## Support

- 📖 [Full Documentation](README.md)
- 🏗️ [Architecture Guide](docs/ARCHITECTURE.md)
- 📝 [Technical Report](docs/REPORT.md)
- 🚀 [Deployment Guide](DEPLOYMENT_GUIDE.md)

---

**Happy Building!** 🚀

Built with ❤️ for the Web3 community
