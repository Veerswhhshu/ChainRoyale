import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';
import NFTCard from '../components/NFTCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatsCard from '../components/StatsCard';
import { sampleNFTs, marketplaceStats } from '../utils/sampleData';

export default function Home() {
  const { account, signer, getNFTContract, getMarketplaceContract, isCorrectNetwork } = useWallet();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterCollection, setFilterCollection] = useState('all');

  useEffect(() => {
    if (isCorrectNetwork) {
      loadListings();
    } else {
      // Show sample data when not connected
      setListings(sampleNFTs);
      setLoading(false);
    }
  }, [isCorrectNetwork, account]);

  async function loadListings() {
    try {
      setLoading(true);
      const marketplace = getMarketplaceContract();
      const nftContract = getNFTContract();
      
      if (!marketplace || !nftContract) {
        // Show sample data if contracts not available
        setListings(sampleNFTs);
        setLoading(false);
        return;
      }

      const activeListings = await marketplace.getActiveListings();
      
      const listingsWithMetadata = await Promise.all(
        activeListings.map(async (listing) => {
          try {
            const tokenURI = await nftContract.tokenURI(listing.tokenId);
            let metadata = { name: `NFT #${listing.tokenId}`, description: '', image: '' };
            
            if (tokenURI.startsWith('data:application/json')) {
              const json = atob(tokenURI.split(',')[1]);
              metadata = JSON.parse(json);
            } else if (tokenURI.startsWith('http')) {
              const response = await fetch(tokenURI);
              metadata = await response.json();
            }
            
            // Get royalty info
            const [royaltyReceiver, royaltyAmount] = await nftContract.royaltyInfo(
              listing.tokenId,
              listing.price
            );
            const royaltyPercentage = (Number(royaltyAmount) * 100 / Number(listing.price)).toFixed(2);
            
            return {
              ...listing,
              tokenId: Number(listing.tokenId),
              price: listing.price,
              ...metadata,
              royaltyPercentage,
              royaltyReceiver,
            };
          } catch (error) {
            console.error('Error loading metadata:', error);
            return {
              ...listing,
              tokenId: Number(listing.tokenId),
              price: listing.price,
              name: `NFT #${listing.tokenId}`,
            };
          }
        })
      );
      
      // Combine real listings with sample data for demo
      const allListings = listingsWithMetadata.length > 0 
        ? listingsWithMetadata 
        : sampleNFTs;
      
      setListings(allListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      // Show sample data on error
      setListings(sampleNFTs);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort listings
  const filteredListings = listings
    .filter(nft => {
      const matchesSearch = nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nft.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = filterCollection === 'all' || nft.collection === filterCollection;
      return matchesSearch && matchesCollection;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'price-high':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'recent':
        default:
          return 0;
      }
    });

  const collections = ['all', ...new Set(listings.map(nft => nft.collection).filter(Boolean))];

  async function buyNFT(nftContract, tokenId, price) {
    if (!account) {
      toast.error('Please connect your wallet first! 👛');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to the correct network! 🔄');
      return;
    }

    setBuying(tokenId);
    const toastId = toast.loading('🔐 Waiting for wallet approval...');

    try {
      const marketplace = getMarketplaceContract(signer);
      
      // Ensure price is in the correct format
      const priceInWei = typeof price === 'string' && !price.startsWith('0x')
        ? ethers.parseEther(price)
        : price;

      const tx = await marketplace.buyNFT(nftContract, tokenId, {
        value: priceInWei,
      });

      toast.loading('⏳ Transaction pending...', { id: toastId });
      const receipt = await tx.wait();

      toast.success(
        <div>
          <div style={{ fontWeight: 'bold' }}>🎉 NFT Purchased!</div>
          <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>
            Check your wallet for the new NFT
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );
      
      // Reload listings after successful purchase
      setTimeout(() => loadListings(), 2000);
    } catch (error) {
      console.error('Error buying NFT:', error);
      let errorMessage = 'Transaction failed';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for purchase';
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      toast.error(`❌ ${errorMessage}`, { id: toastId });
    } finally {
      setBuying(null);
    }
  }

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero-section cyber-grid">
        <div className="hero-content">
          <h1 className="hero-title gradient-text-animated">
            Discover, Collect & Trade NFTs
          </h1>
          <p className="hero-subtitle">
            The premier Web3 marketplace on TarsChain with automatic royalty distribution
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">{marketplaceStats.totalVolume}</span>
              <span className="stat-label">Total Volume (MATIC)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{marketplaceStats.totalSales}</span>
              <span className="stat-label">Total Sales</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{marketplaceStats.activeListings}</span>
              <span className="stat-label">Active Listings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{marketplaceStats.uniqueOwners}</span>
              <span className="stat-label">Unique Owners</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard icon="🎨" value={listings.length} label="NFTs Available" trend={12} />
        <StatsCard icon="🔥" value="24" label="Trending Today" trend={8} />
        <StatsCard icon="👥" value="1.2K" label="Active Users" trend={15} />
        <StatsCard icon="💎" value="5%" label="Avg Royalty" />
      </div>

      {!isCorrectNetwork && (
        <div className="warning-box" style={{ marginBottom: '2rem' }}>
          <h2>⚠️ Demo Mode</h2>
          <p>Connect your wallet and switch to Polygon Amoy or Localhost to interact with real NFTs</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search NFTs by name or description..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <span className="filter-label">Collection:</span>
          <select 
            className="filter-select"
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
          >
            {collections.map(col => (
              <option key={col} value={col}>
                {col === 'all' ? 'All Collections' : col}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Sort by:</span>
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recently Listed</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Featured Section */}
      <div className="featured-section">
        <div className="section-header">
          <h2 className="section-title">
            {filteredListings.some(nft => nft.trending) ? '🔥 Trending NFTs' : '✨ Featured NFTs'}
          </h2>
          <span className="view-all-link">View All →</span>
        </div>

        {loading ? (
          <div className="nft-grid">
            <LoadingSkeleton count={6} />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state">
            <h2>No NFTs found</h2>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="nft-grid">
            {filteredListings.map((nft) => (
              <div key={`${nft.nftContract || 'sample'}-${nft.tokenId}`} style={{ position: 'relative' }}>
                {nft.trending && (
                  <div className="trending-badge">
                    🔥 Trending
                  </div>
                )}
                {nft.collection && (
                  <div className="collection-badge">
                    {nft.collection}
                  </div>
                )}
                <NFTCard
                  nft={nft}
                  showRoyalty={true}
                  actionButton={
                    nft.isSample ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" disabled style={{ flex: 1 }}>
                          Demo NFT
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => window.location.href = '/mint'}
                          style={{ flex: 1 }}
                        >
                          Mint Real
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          onClick={() => buyNFT(nft.nftContract, nft.tokenId, nft.price)}
                          disabled={buying === nft.tokenId || nft.seller === account || !account}
                          className="btn btn-primary btn-glow shine"
                        >
                          {buying === nft.tokenId
                            ? '⏳ Processing...'
                            : nft.seller === account
                            ? '✅ Your NFT'
                            : !account
                            ? '🔒 Connect Wallet'
                            : `💎 Buy for ${typeof nft.price === 'string' ? nft.price : ethers.formatEther(nft.price)} MATIC`}
                        </button>
                        {nft.seller !== account && account && (
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                            onClick={() => {
                              toast.success('Added to watchlist! 👀');
                            }}
                          >
                            ⭐ Add to Watchlist
                          </button>
                        )}
                      </div>
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
