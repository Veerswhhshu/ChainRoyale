# System Architecture

## Overview

The NFT Marketplace with Automatic Royalty Distribution is a decentralized application (dApp) built on Polygon Amoy testnet. The system consists of three main layers: Smart Contracts, Frontend Application, and Blockchain Network.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Ethers.js   │  │   Wallet     │      │
│  │  Components  │──│   Provider   │──│  (MetaMask)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JSON-RPC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Blockchain Network                         │
│                  (Polygon Amoy Testnet)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Smart Contract Layer                       │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  NFTContract.sol │         │ NFTMarketplace   │         │
│  │                  │         │     .sol         │         │
│  │  - ERC721        │◄────────│                  │         │
│  │  - ERC2981       │         │  - Listings      │         │
│  │  - Minting       │         │  - Buying        │         │
│  │  - Royalties     │         │  - Fees          │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Smart Contract Layer

#### NFTContract.sol
**Purpose**: ERC-721 NFT contract with built-in royalty support

**Key Features**:
- Inherits from OpenZeppelin's ERC721URIStorage, ERC2981, and Ownable
- Implements EIP-2981 royalty standard
- Tracks token creators for royalty distribution
- Supports customizable royalty percentages (0-10%)

**State Variables**:
```solidity
uint256 private _tokenIdCounter;                    // Auto-incrementing token IDs
mapping(uint256 => address) private _tokenCreators; // Token ID → Creator address
```

**Core Functions**:
- `mintNFT(address to, string memory tokenURI, uint96 royaltyFeeNumerator)`: Mints new NFT with royalty info
- `getTokenCreator(uint256 tokenId)`: Returns the original creator
- `royaltyInfo(uint256 tokenId, uint256 salePrice)`: Returns royalty receiver and amount (EIP-2981)

#### NFTMarketplace.sol
**Purpose**: Decentralized marketplace for buying and selling NFTs

**Key Features**:
- Listing management (create, cancel)
- Purchase execution with automatic payment distribution
- Platform fee collection (2%)
- EIP-2981 royalty integration
- Reentrancy protection

**State Variables**:
```solidity
uint256 public constant PLATFORM_FEE_PERCENTAGE = 200;  // 2% in basis points
mapping(address => mapping(uint256 => Listing)) private _listings;
Listing[] private _activeListings;
```

**Core Functions**:
- `listNFT(address nftContract, uint256 tokenId, uint256 price)`: Creates a new listing
- `cancelListing(address nftContract, uint256 tokenId)`: Cancels an active listing
- `buyNFT(address nftContract, uint256 tokenId)`: Purchases NFT with automatic distribution
- `getActiveListings()`: Returns all active marketplace listings

### 2. Frontend Layer

#### Component Structure

```
App.jsx (Root)
├── WalletContext (Global State)
├── Router
│   ├── Navbar
│   │   ├── Logo
│   │   ├── Navigation Links
│   │   └── WalletConnectButton
│   ├── Routes
│   │   ├── Home (Marketplace)
│   │   │   └── NFTCard[] (with Buy buttons)
│   │   ├── Mint
│   │   │   └── MintForm
│   │   └── MyNFTs
│   │       └── NFTCard[] (with List/Cancel buttons)
│   └── Footer
└── Toaster (Notifications)
```

#### Key Components

**WalletContext**:
- Manages wallet connection state
- Provides contract instances
- Handles network switching
- Exposes wallet utilities to all components

**NFTCard**:
- Reusable component for displaying NFT information
- Accepts action buttons as props
- Shows image, name, price, royalty info

**Pages**:
- **Home**: Displays all active listings, allows purchasing
- **Mint**: Form for creating new NFTs with royalty settings
- **MyNFTs**: Shows user's NFTs with listing/cancellation options

### 3. Data Flow

#### Minting Flow

```
User Input (Form)
    │
    ▼
Upload Image → Convert to Data URI
    │
    ▼
Create Metadata JSON
    │
    ▼
Convert to Data URI
    │
    ▼
Call NFTContract.mintNFT()
    │
    ├─► Set Token URI
    ├─► Set Royalty Info (EIP-2981)
    ├─► Mint Token
    └─► Emit NFTMinted Event
    │
    ▼
Transaction Confirmed
    │
    ▼
Update UI
```

#### Listing Flow

```
User Selects NFT + Price
    │
    ▼
Check Marketplace Approval
    │
    ├─► Not Approved → Call approve()
    │                      │
    │                      ▼
    │              Wait for Confirmation
    │
    ▼
Call NFTMarketplace.listNFT()
    │
    ├─► Verify Ownership
    ├─► Verify Approval
    ├─► Create Listing
    └─► Emit NFTListed Event
    │
    ▼
Transaction Confirmed
    │
    ▼
Update UI (Show in Marketplace)
```

#### Purchase Flow (with Royalty Distribution)

```
Buyer Clicks "Buy"
    │
    ▼
Call NFTMarketplace.buyNFT() with payment
    │
    ├─► Verify Listing Active
    ├─► Verify Payment Amount
    │
    ▼
Calculate Fees
    │
    ├─► Query EIP-2981 royaltyInfo()
    │   └─► Returns (creator, royaltyAmount)
    │
    ├─► Calculate Platform Fee (2%)
    │
    └─► Calculate Seller Proceeds
    │
    ▼
Execute Transfers (CEI Pattern)
    │
    ├─► Transfer NFT to Buyer
    ├─► Pay Royalty to Creator
    ├─► Pay Platform Fee to Owner
    └─► Pay Proceeds to Seller
    │
    ▼
Mark Listing Inactive
    │
    ▼
Emit NFTSold Event
    │
    ▼
Transaction Confirmed
    │
    ▼
Update UI
```

## Payment Distribution Logic

### Primary Sale (Creator → First Buyer)

```
Sale Price: 1.0 MATIC
├─► Platform Fee (2%):     0.02 MATIC → Platform Owner
├─► Royalty (5%):          0.05 MATIC → Creator (but creator is seller)
└─► Seller Proceeds:       0.98 MATIC → Creator

Note: In primary sales, creator receives seller proceeds + royalty
      effectively receiving 98% + 5% = 98% (royalty goes to same address)
```

### Secondary Sale (Buyer A → Buyer B)

```
Sale Price: 2.0 MATIC
├─► Royalty (5%):          0.10 MATIC → Original Creator
├─► Platform Fee (2%):     0.04 MATIC → Platform Owner
└─► Seller Proceeds:       1.86 MATIC → Seller (Buyer A)

Total: 0.10 + 0.04 + 1.86 = 2.0 MATIC ✓
```

## Security Architecture

### Smart Contract Security

1. **Reentrancy Protection**
   - `ReentrancyGuard` on all state-changing functions
   - CEI (Checks-Effects-Interactions) pattern

2. **Access Control**
   - `Ownable` for admin functions
   - Seller verification for listings
   - Owner verification for NFT operations

3. **Input Validation**
   - Price > 0 checks
   - Address validation
   - Royalty percentage limits (0-10%)
   - Approval verification

4. **Safe Transfers**
   - OpenZeppelin's `safeTransferFrom`
   - Low-level call with success checks
   - Proper error handling

### Frontend Security

1. **Wallet Integration**
   - MetaMask signature verification
   - Network validation
   - Transaction confirmation

2. **User Input Sanitization**
   - Form validation
   - Type checking
   - Range validation

3. **Error Handling**
   - Try-catch blocks
   - User-friendly error messages
   - Transaction failure recovery

## Network Architecture

### Polygon Amoy Testnet

**Chain ID**: 80002

**RPC Endpoints**:
- Primary: `https://rpc-amoy.polygon.technology/`
- Alternative: Alchemy, Infura

**Block Explorer**:
- https://amoy.polygonscan.com/

**Advantages**:
- Low transaction fees
- Fast block times (~2 seconds)
- Ethereum-compatible
- Active testnet with faucets

## State Management

### On-Chain State

**NFTContract**:
- Token ownership (ERC-721 standard)
- Token metadata URIs
- Royalty information per token
- Creator addresses

**NFTMarketplace**:
- Active listings
- Listing prices
- Seller addresses
- Platform fee configuration

### Off-Chain State (Frontend)

**WalletContext**:
- Connected account
- Network/chain ID
- Provider and signer instances
- Contract instances

**Component State**:
- Loading states
- Form inputs
- Transaction status
- UI interactions

## Scalability Considerations

### Current Implementation

- Single marketplace contract
- On-chain listing storage
- Linear search for active listings

### Future Improvements

1. **Indexing**
   - The Graph protocol for efficient queries
   - Event-based indexing
   - Off-chain listing cache

2. **Gas Optimization**
   - Batch operations
   - Optimized storage patterns
   - Layer 2 solutions

3. **IPFS Integration**
   - Decentralized metadata storage
   - Image hosting on IPFS
   - Pinning services (Pinata, NFT.Storage)

4. **Multiple Collections**
   - Factory pattern for NFT contracts
   - Collection registry
   - Per-collection royalties

## Deployment Architecture

### Development Environment

```
Local Machine
├── Hardhat Node (localhost:8545)
├── Smart Contracts
└── Frontend (localhost:3000)
```

### Testnet Environment

```
Polygon Amoy Testnet
├── Deployed Contracts
│   ├── NFTContract
│   └── NFTMarketplace
└── Frontend (Vercel/Netlify)
```

### Production Environment (Future)

```
Polygon Mainnet
├── Verified Contracts
├── IPFS Storage
└── Frontend (CDN)
```

## Monitoring and Maintenance

### Contract Events

All major operations emit events for tracking:
- `NFTMinted`: New NFT creation
- `NFTListed`: New marketplace listing
- `NFTSold`: Successful purchase
- `ListingCancelled`: Listing removal

### Frontend Monitoring

- Transaction status tracking
- Error logging
- User action analytics
- Performance metrics

## Diagram Descriptions

### Suggested Diagrams (for docs/diagrams/)

1. **architecture.png**: High-level system architecture showing all three layers
2. **sequence_mint_buy.png**: Sequence diagram of mint → list → buy flow
3. **payment_distribution.png**: Flowchart showing payment split logic
4. **contract_interaction.png**: Contract-to-contract interaction diagram
5. **state_diagram.png**: NFT lifecycle state transitions

---

This architecture provides a solid foundation for a production-ready NFT marketplace with automatic royalty distribution, ensuring security, scalability, and maintainability.
