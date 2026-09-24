# NFT Marketplace with Automatic Royalty Distribution

A production-ready NFT marketplace built on Polygon Amoy testnet featuring automatic royalty distribution on secondary sales using EIP-2981 standard.

## 🌟 Features

- **ERC-721 NFT Minting** with customizable royalty percentages (0-10%)
- **EIP-2981 Royalty Standard** for automatic creator royalties on secondary sales
- **Marketplace Contract** with listing, buying, and cancellation functionality
- **Platform Fee System** (2% on all sales)
- **Automatic Payment Distribution**:
  - Royalties to original creators
  - Platform fees to marketplace owner
  - Remaining proceeds to sellers
- **React Frontend** with wallet integration (MetaMask)
- **Responsive UI** with real-time transaction feedback

## 🛠️ Technology Stack

### Smart Contracts
- Solidity ^0.8.20
- Hardhat development environment
- OpenZeppelin Contracts v5.0
- ERC-721 (NFT standard)
- ERC-2981 (Royalty standard)

### Frontend
- React 18
- Vite
- Ethers.js v6
- React Router v6
- React Hot Toast (notifications)

### Network
- Polygon Amoy Testnet (Chain ID: 80002)
- Local Hardhat Network for development

## 📋 Prerequisites

- Node.js v16+ and npm
- MetaMask or another Web3 wallet
- Polygon Amoy testnet MATIC (from faucet)

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd nft-marketplace-royalty

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PRIVATE_KEY=your_private_key_without_0x_prefix
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**Getting Testnet MATIC:**
- Visit [Polygon Faucet](https://faucet.polygon.technology/)
- Select "Amoy Testnet"
- Enter your wallet address
- Request test MATIC

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

Expected output: All 20 tests should pass ✓

## 📦 Deployment

### Deploy to Local Hardhat Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Deploy to Polygon Amoy Testnet

```bash
npm run deploy:amoy
```

After deployment, the contract addresses will be saved to `deployment.json`.

### Verify Contracts on PolygonScan

```bash
npm run verify
```

## 🎨 Running the Frontend

### 1. Copy Contract ABIs

```bash
node scripts/copy-abis.js
```

### 2. Update Contract Addresses

After deployment, update `frontend/src/utils/contracts.js` with your deployed contract addresses from `deployment.json`.

### 3. Start Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Connect MetaMask

1. Open the application in your browser
2. Click "Connect Wallet"
3. Approve the connection in MetaMask
4. Ensure you're on Polygon Amoy testnet (or click "Switch to Amoy")

## 📖 Usage Guide

### Minting an NFT

1. Navigate to "Mint NFT" page
2. Fill in:
   - NFT Name
   - Description (optional)
   - Upload an image
   - Set royalty percentage (0-10%)
3. Click "Mint NFT"
4. Approve the transaction in MetaMask
5. Wait for confirmation

### Listing an NFT for Sale

1. Go to "My NFTs" page
2. Find the NFT you want to sell
3. Click "List for Sale"
4. Enter the price in MATIC
5. Click "Confirm"
6. Approve marketplace access (first time only)
7. Confirm listing transaction

### Buying an NFT

1. Browse the marketplace on the "Home" page
2. Click "Buy" on any listed NFT
3. Confirm the transaction
4. Payment is automatically distributed:
   - Royalty to creator (if secondary sale)
   - 2% platform fee
   - Remaining amount to seller

### Cancelling a Listing

1. Go to "My NFTs" page
2. Find your listed NFT
3. Click "Cancel Listing"
4. Confirm the transaction

## 🧪 Test Scenario: Royalty Distribution

This scenario demonstrates the automatic royalty distribution:

### Setup
- Creator mints NFT with 5% royalty
- Platform fee: 2%

### Primary Sale (Creator → Buyer A)
- Listing price: 1 MATIC
- Creator receives: 0.98 MATIC (98%)
- Platform receives: 0.02 MATIC (2%)
- Royalty: 0 MATIC (creator is seller)

### Secondary Sale (Buyer A → Buyer B)
- Listing price: 2 MATIC
- Creator receives: 0.1 MATIC (5% royalty)
- Platform receives: 0.04 MATIC (2% fee)
- Seller (Buyer A) receives: 1.86 MATIC (93%)

**Total: 0.1 + 0.04 + 1.86 = 2.0 MATIC ✓**

## 📁 Project Structure

```
nft-marketplace-royalty/
├── contracts/
│   ├── NFTContract.sol          # ERC-721 + EIP-2981 NFT contract
│   └── NFTMarketplace.sol       # Marketplace with royalty distribution
├── scripts/
│   ├── deploy.js                # Deployment script
│   ├── verify.js                # Contract verification
│   └── copy-abis.js             # Copy ABIs to frontend
├── test/
│   └── marketplace.test.js      # Comprehensive test suite
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── context/             # Wallet context
│   │   ├── utils/               # Utilities and ABIs
│   │   ├── App.jsx              # Main app component
│   │   └── App.css              # Styles
│   ├── index.html
│   └── vite.config.js
├── docs/
│   ├── ARCHITECTURE.md          # System architecture
│   └── REPORT.md                # Academic report
├── hardhat.config.js
├── package.json
├── .env.example
└── README.md
```

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Ownable pattern for admin functions
- **Input Validation**: Comprehensive checks on all inputs
- **CEI Pattern**: Checks-Effects-Interactions pattern
- **Safe Transfers**: Uses OpenZeppelin's safe transfer functions

## 🐛 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Check you're on the correct network
- Try refreshing the page

### Transaction Failures
- Ensure you have enough MATIC for gas fees
- Check contract addresses are correct
- Verify network connection

### NFT Not Appearing
- Wait for transaction confirmation
- Refresh the page
- Check transaction on PolygonScan

## 📚 Additional Documentation

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [Academic Report](docs/REPORT.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Useful Links

- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [EIP-2981 Standard](https://eips.ethereum.org/EIPS/eip-2981)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)

## 👥 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test cases for examples

---

Built with ❤️ for the Web3 community
