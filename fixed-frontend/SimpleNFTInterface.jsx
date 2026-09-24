import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from './WalletContext';

// You'll need to replace these with your actual contract addresses and ABIs
const NFT_CONTRACT_ADDRESS = "YOUR_NFT_CONTRACT_ADDRESS";
const MARKETPLACE_CONTRACT_ADDRESS = "YOUR_MARKETPLACE_CONTRACT_ADDRESS";

// Simplified ABIs - you can get these from Remix after compilation
const NFT_ABI = [
  "function simpleMint(string memory tokenURI) public returns (uint256)",
  "function approve(address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function getCurrentTokenId() public view returns (uint256)"
];

const MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) external",
  "function buyNFT(address nftContract, uint256 tokenId) external payable",
  "function getActiveListings() external view returns (tuple(address seller, address nftContract, uint256 tokenId, uint256 price, bool isActive)[])"
];

export default function SimpleNFTInterface() {
  const { account, signer, provider, connectWallet, isCorrectNetwork, switchToAmoy } = useWallet();
  const [nftContract, setNftContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [tokenURI, setTokenURI] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [tokenIdToList, setTokenIdToList] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (signer && isCorrectNetwork) {
      initializeContracts();
    }
  }, [signer, isCorrectNetwork]);

  function initializeContracts() {
    try {
      const nft = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, signer);
      
      setNftContract(nft);
      setMarketplaceContract(marketplace);
      
      loadListings();
    } catch (error) {
      console.error('Error initializing contracts:', error);
      toast.error('Failed to initialize contracts');
    }
  }

  async function loadListings() {
    if (!marketplaceContract) return;
    
    try {
      const activeListings = await marketplaceContract.getActiveListings();
      setListings(activeListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  }

  async function mintNFT() {
    if (!nftContract || !tokenURI) {
      toast.error('Please enter a token URI');
      return;
    }

    setLoading(true);
    try {
      const tx = await nftContract.simpleMint(tokenURI);
      toast.loading('Minting NFT...', { id: 'mint' });
      
      const receipt = await tx.wait();
      toast.success('NFT minted successfully!', { id: 'mint' });
      
      setTokenURI('');
      console.log('Mint transaction:', receipt);
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT: ' + error.message, { id: 'mint' });
    } finally {
      setLoading(false);
    }
  }

  async function listNFT() {
    if (!nftContract || !marketplaceContract || !tokenIdToList || !listingPrice) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // First approve the marketplace
      const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenIdToList);
      toast.loading('Approving marketplace...', { id: 'list' });
      await approveTx.wait();

      // Then list the NFT
      const priceInWei = ethers.parseEther(listingPrice);
      const listTx = await marketplaceContract.listNFT(NFT_CONTRACT_ADDRESS, tokenIdToList, priceInWei);
      toast.loading('Listing NFT...', { id: 'list' });
      
      await listTx.wait();
      toast.success('NFT listed successfully!', { id: 'list' });
      
      setTokenIdToList('');
      setListingPrice('');
      loadListings();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT: ' + error.message, { id: 'list' });
    } finally {
      setLoading(false);
    }
  }

  async function buyNFT(tokenId, price) {
    if (!marketplaceContract) return;

    setLoading(true);
    try {
      const tx = await marketplaceContract.buyNFT(NFT_CONTRACT_ADDRESS, tokenId, {
        value: price
      });
      toast.loading('Buying NFT...', { id: 'buy' });
      
      await tx.wait();
      toast.success('NFT purchased successfully!', { id: 'buy' });
      
      loadListings();
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error('Failed to buy NFT: ' + error.message, { id: 'buy' });
    } finally {
      setLoading(false);
    }
  }

  if (!account) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>NFT Marketplace</h2>
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Wrong Network</h2>
        <p>Please switch to Polygon Amoy or Localhost</p>
        <button onClick={switchToAmoy} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Switch to Polygon Amoy
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>NFT Marketplace</h1>
      <p>Connected: {account}</p>

      {/* Mint Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Mint NFT</h3>
        <input
          type="text"
          placeholder="Token URI (e.g., https://example.com/metadata.json)"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button 
          onClick={mintNFT} 
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>
      </div>

      {/* List Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>List NFT for Sale</h3>
        <input
          type="number"
          placeholder="Token ID"
          value={tokenIdToList}
          onChange={(e) => setTokenIdToList(e.target.value)}
          style={{ width: '48%', padding: '10px', marginBottom: '10px', marginRight: '4%' }}
        />
        <input
          type="number"
          step="0.001"
          placeholder="Price in MATIC/ETH"
          value={listingPrice}
          onChange={(e) => setListingPrice(e.target.value)}
          style={{ width: '48%', padding: '10px', marginBottom: '10px' }}
        />
        <button 
          onClick={listNFT} 
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          {loading ? 'Listing...' : 'List NFT'}
        </button>
      </div>

      {/* Marketplace Section */}
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Marketplace</h3>
        {listings.length === 0 ? (
          <p>No NFTs listed for sale</p>
        ) : (
          <div>
            {listings.map((listing, index) => (
              <div key={index} style={{ 
                padding: '15px', 
                border: '1px solid #eee', 
                borderRadius: '5px', 
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p><strong>Token ID:</strong> {listing.tokenId.toString()}</p>
                  <p><strong>Price:</strong> {ethers.formatEther(listing.price)} MATIC/ETH</p>
                  <p><strong>Seller:</strong> {listing.seller}</p>
                </div>
                {listing.seller.toLowerCase() !== account.toLowerCase() && (
                  <button 
                    onClick={() => buyNFT(listing.tokenId, listing.price)}
                    disabled={loading}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Buy NFT
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}