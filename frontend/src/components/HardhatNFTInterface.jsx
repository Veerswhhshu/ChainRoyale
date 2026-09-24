import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';
import { getContractAddresses } from '../utils/contracts';
import NFTContractABI from '../utils/abis/NFTContract.json';
import NFTMarketplaceABI from '../utils/abis/NFTMarketplace.json';

export default function HardhatNFTInterface() {
  const { 
    account, 
    signer, 
    provider, 
    chainId,
    connectWallet, 
    isCorrectNetwork, 
    switchToLocalhost,
    switchToSepolia,
    networkName 
  } = useWallet();
  
  const [nftContract, setNftContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [tokenURI, setTokenURI] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [tokenIdToList, setTokenIdToList] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [nextTokenId, setNextTokenId] = useState(0);
  const [ownedTokens, setOwnedTokens] = useState([]);

  useEffect(() => {
    if (signer && isCorrectNetwork) {
      initializeContracts();
      loadBalance();
    }
  }, [signer, isCorrectNetwork, chainId]);

  async function initializeContracts() {
    try {
      const addresses = getContractAddresses(chainId);
      if (!addresses) {
        toast.error('No contract addresses found for this network');
        return;
      }

      const nft = new ethers.Contract(addresses.nftContract, NFTContractABI, signer);
      const marketplace = new ethers.Contract(addresses.marketplace, NFTMarketplaceABI, signer);
      
      setNftContract(nft);
      setMarketplaceContract(marketplace);
      
      // Load current token ID and owned tokens
      try {
        const currentTokenId = await nft.getCurrentTokenId();
        setNextTokenId(Number(currentTokenId));
        
        // Check which tokens the user owns
        await loadOwnedTokens(nft, Number(currentTokenId));
      } catch (error) {
        console.error('Error getting current token ID:', error);
      }
      
      loadListings(marketplace);
    } catch (error) {
      console.error('Error initializing contracts:', error);
      toast.error('Failed to initialize contracts');
    }
  }

  async function loadOwnedTokens(nft = nftContract, totalTokens = nextTokenId) {
    if (!nft || !account) return;
    
    try {
      const owned = [];
      for (let i = 0; i < totalTokens; i++) {
        try {
          const owner = await nft.ownerOf(i);
          if (owner.toLowerCase() === account.toLowerCase()) {
            const tokenURI = await nft.tokenURI(i);
            owned.push({ id: i, uri: tokenURI });
          }
        } catch (error) {
          // Token doesn't exist, skip
        }
      }
      setOwnedTokens(owned);
    } catch (error) {
      console.error('Error loading owned tokens:', error);
    }
  }

  async function loadBalance() {
    if (!provider || !account) return;
    
    try {
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }

  async function loadListings(marketplace = marketplaceContract) {
    if (!marketplace) return;
    
    try {
      const activeListings = await marketplace.getActiveListings();
      setListings(activeListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  }

  async function mintNFT() {
    if (!nftContract || !tokenURI.trim()) {
      toast.error('Please enter a token URI');
      return;
    }

    setLoading(true);
    try {
      const tx = await nftContract.mintNFT(account, tokenURI.trim(), 500); // 5% royalty
      toast.loading('Minting NFT...', { id: 'mint' });
      
      const receipt = await tx.wait();
      toast.success(`NFT minted successfully! Token ID: ${nextTokenId}`, { id: 'mint' });
      
      setTokenURI('');
      setNextTokenId(nextTokenId + 1);
      loadBalance();
      
      console.log('Mint transaction:', receipt);
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT: ' + (error.reason || error.message), { id: 'mint' });
    } finally {
      setLoading(false);
    }
  }

  async function quickMint() {
    const sampleURI = `https://example.com/metadata/${nextTokenId}.json`;
    setTokenURI(sampleURI);
    
    if (!nftContract) {
      toast.error('Contract not initialized');
      return;
    }

    setLoading(true);
    try {
      const tx = await nftContract.mintNFT(account, sampleURI, 500);
      toast.loading('Quick minting NFT...', { id: 'quickmint' });
      
      await tx.wait();
      toast.success(`NFT minted! Token ID: ${nextTokenId}`, { id: 'quickmint' });
      
      setNextTokenId(nextTokenId + 1);
      setTokenURI('');
      loadBalance();
    } catch (error) {
      console.error('Error quick minting:', error);
      toast.error('Failed to mint NFT: ' + (error.reason || error.message), { id: 'quickmint' });
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
      const addresses = getContractAddresses(chainId);
      
      // First approve the marketplace
      const approveTx = await nftContract.approve(addresses.marketplace, tokenIdToList);
      toast.loading('Approving marketplace...', { id: 'list' });
      await approveTx.wait();

      // Then list the NFT
      const priceInWei = ethers.parseEther(listingPrice);
      const listTx = await marketplaceContract.listNFT(addresses.nftContract, tokenIdToList, priceInWei);
      toast.loading('Listing NFT...', { id: 'list' });
      
      await listTx.wait();
      toast.success('NFT listed successfully!', { id: 'list' });
      
      setTokenIdToList('');
      setListingPrice('');
      loadListings();
      loadBalance();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT: ' + (error.reason || error.message), { id: 'list' });
    } finally {
      setLoading(false);
    }
  }

  async function buyNFT(tokenId, price) {
    if (!marketplaceContract) return;

    setLoading(true);
    try {
      const addresses = getContractAddresses(chainId);
      const tx = await marketplaceContract.buyNFT(addresses.nftContract, tokenId, {
        value: price
      });
      toast.loading('Buying NFT...', { id: 'buy' });
      
      await tx.wait();
      toast.success('NFT purchased successfully!', { id: 'buy' });
      
      loadListings();
      loadBalance();
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error('Failed to buy NFT: ' + (error.reason || error.message), { id: 'buy' });
    } finally {
      setLoading(false);
    }
  }

  if (!account) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2>🎨 NFT Marketplace</h2>
        <p>Connect your wallet to start minting and trading NFTs</p>
        <button 
          onClick={connectWallet} 
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2>⚠️ Wrong Network</h2>
        <p>Current network: {networkName}</p>
        <p>Please switch to Hardhat Local or Sepolia Testnet</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            onClick={switchToLocalhost} 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Switch to Hardhat Local
          </button>
          <button 
            onClick={switchToSepolia} 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Switch to Sepolia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🎨 NFT Marketplace - Hardhat Edition</h1>
      
      {/* Account Info */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <p><strong>Connected:</strong> {account}</p>
        <p><strong>Network:</strong> {networkName}</p>
        <p><strong>Balance:</strong> {parseFloat(balance).toFixed(4)} ETH</p>
        <p><strong>Next Token ID:</strong> {nextTokenId}</p>
      </div>

      {/* Mint Section */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '2px solid #007bff', 
        borderRadius: '8px',
        backgroundColor: '#f8f9ff'
      }}>
        <h3>🎯 Mint NFT</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Token URI (e.g., https://example.com/metadata.json)"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={mintNFT} 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Minting...' : 'Mint NFT'}
          </button>
          <button 
            onClick={quickMint} 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Quick Mint
          </button>
        </div>
      </div>

      {/* List Section */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '2px solid #28a745', 
        borderRadius: '8px',
        backgroundColor: '#f8fff8'
      }}>
        <h3>📋 List NFT for Sale</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="number"
            placeholder="Token ID"
            value={tokenIdToList}
            onChange={(e) => setTokenIdToList(e.target.value)}
            style={{ 
              width: '150px', 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px'
            }}
          />
          <input
            type="number"
            step="0.001"
            placeholder="Price in ETH"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
            style={{ 
              width: '150px', 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px'
            }}
          />
          <button 
            onClick={listNFT} 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Listing...' : 'List NFT'}
          </button>
        </div>
      </div>

      {/* Marketplace Section */}
      <div style={{ 
        padding: '20px', 
        border: '2px solid #ffc107', 
        borderRadius: '8px',
        backgroundColor: '#fffdf0'
      }}>
        <h3>🛒 Marketplace ({listings.length} NFTs for sale)</h3>
        {listings.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            No NFTs listed for sale. Mint some NFTs and list them!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {listings.map((listing, index) => (
              <div key={index} style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p><strong>🎨 Token ID:</strong> {listing.tokenId.toString()}</p>
                  <p><strong>💰 Price:</strong> {ethers.formatEther(listing.price)} ETH</p>
                  <p><strong>👤 Seller:</strong> {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p>
                </div>
                {listing.seller.toLowerCase() !== account.toLowerCase() ? (
                  <button 
                    onClick={() => buyNFT(listing.tokenId, listing.price)}
                    disabled={loading}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '14px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    Buy NFT
                  </button>
                ) : (
                  <span style={{ 
                    padding: '8px 16px', 
                    fontSize: '14px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    borderRadius: '6px'
                  }}>
                    Your NFT
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}