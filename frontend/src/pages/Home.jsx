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
            
            const [royaltyReceiver, royaltyAmount] = await nftContract.royaltyInfo(
              listing.tokenId,
              listing.price
            );
            const royaltyPercentage = (Number(royaltyAmount) * 100 / Number(listing.price)).toFixed(2);
            
            return {
              ...listing,
              tokenId: Number(listing.tokenId),
              price: ethers.formatEther(listing.price),
              ...metadata,
              royaltyPercentage,
              royaltyReceiver,
            };
          } catch (error) {
            console.error('Error loading metadata:', error);
            return {
              ...listing,
              tokenId: Number(listing.tokenId),
              price: ethers.formatEther(listing.price),
              name: `NFT #${listing.tokenId}`,
            };
          }
        })
      );
      
      const allListings = listingsWithMetadata.length > 0 
        ? [...listingsWithMetadata, ...sampleNFTs]
        : sampleNFTs;
      
      setListings(allListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings(sampleNFTs);
    } finally {
      setLoading(false);
    }
  }

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
      const priceInWei = ethers.parseEther(price);

      const tx = await marketplace.buyNFT(nftContract, tokenId, {
        value: priceInWei,
        gasLimit: 300000
      });

      toast.loading('⏳ Transaction submitted! Waiting for confirmation...', { id: toastId });
      const altProvider = rpcProvider || marketplace?.provider;
      const receipt = altProvider
        ? await altProvider.waitForTransaction(tx.hash)
        : await tx.wait();

      toast.success(
        <div>
          <div style={{ fontWeight: 'bold' }}>🎉 NFT Purchased Successfully!</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Tx: {receipt.hash.slice(0, 10)}...
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );
      
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
        default:
          return 0;
      }
    });

  const collections = ['all', ...new Set(listings.map(nft => nft.collection).filter(Boolean))];

  return (
    <div className="container">
      <div className="hero-section-enhanced">
        <div className="hero-content">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Live on Hardhat Network</span>
          </div>
          <h1 className="hero-title-enhanced">Discover, Collect & Trade NFTs</h1>
          <p className="hero-subtitle-enhanced">
            The premier marketplace for digital art with automatic royalty distribution
          </p>
          <div className="hero-cta">
            <button className="btn-enhanced btn-primary-enhanced" onClick={() => window.location.href = '/mint'}>
              🎨 Create NFT
            </button>
            <button className="btn-enhanced btn-secondary-enhanced" onClick={() => document.querySelector('.nft-grid')?.scrollIntoView({ behavior: 'smooth' })}>
              🔍 Explore Collection
            </button>
          </div>
          
          <div className="hero-stats-enhanced">
            <div className="stat-item-enhanced">
              <span className="stat-value-enhanced">{marketplaceStats.totalVolume}</span>
              <span className="stat-label-enhanced">Total Volume (ETH)</span>
            </div>
            <div className="stat-item-enhanced">
              <span className="stat-value-enhanced">{marketplaceStats.totalSales}</span>
              <span className="stat-label-enhanced">Total Sales</span>
            </div>
            <div className="stat-item-enhanced">
              <span className="stat-value-enhanced">{filteredListings.length}</span>
              <span className="stat-label-enhanced">Active Listings</span>
            </div>
            <div className="stat-item-enhanced">
              <span className="stat-value-enhanced">{marketplaceStats.uniqueOwners}</span>
              <span className="stat-label-enhanced">Unique Owners</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid-enhanced">
        <div className="stat-card-enhanced">
          <div className="stat-icon">🎨</div>
          <div className="stat-number">{filteredListings.length}</div>
          <div className="stat-text">NFTs Available</div>
        </div>
        <div className="stat-card-enhanced">
          <div className="stat-icon">🔥</div>
          <div className="stat-number">24</div>
          <div className="stat-text">Trending Today</div>
        </div>
        <div className="stat-card-enhanced">
          <div className="stat-icon">👥</div>
          <div className="stat-number">1.2K</div>
          <div className="stat-text">Active Users</div>
        </div>
        <div className="stat-card-enhanced">
          <div className="stat-icon">💎</div>
          <div className="stat-number">5%</div>
          <div className="stat-text">Avg Royalty</div>
        </div>
      </div>

      {!isCorrectNetwork && (
        <div className="warning-box-enhanced">
          <h2>⚠️ Demo Mode</h2>
          <p>Connect your wallet and switch to Hardhat Local or Sepolia to interact with real NFTs</p>
        </div>
      )}

      <div className="filter-bar-enhanced">
        <div className="search-bar-enhanced">
          <input
            type="text"
            placeholder="🔍 Search NFTs by name or description..."
            className="search-input-enhanced"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group-enhanced">
          <span className="filter-label-enhanced">Collection:</span>
          <select 
            className="filter-select-enhanced"
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

        <div className="filter-group-enhanced">
          <span className="filter-label-enhanced">Sort by:</span>
          <select 
            className="filter-select-enhanced"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recently Listed</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="featured-section-enhanced">
        <div className="section-header-enhanced">
          <h2 className="section-title-enhanced">
            {filteredListings.some(nft => nft.trending) ? '🔥 Trending NFTs' : '✨ Featured NFTs'}
          </h2>
        </div>

        {loading ? (
          <div className="nft-grid">
            <LoadingSkeleton count={6} />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state-enhanced">
            <h2>No NFTs found</h2>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="nft-grid">
            {filteredListings.map((nft) => (
              <div key={`${nft.nftContract || 'sample'}-${nft.tokenId}`} style={{ position: 'relative' }} className="nft-card-wrapper">
                {nft.trending && (
                  <div className="trending-badge-enhanced">
                    🔥 Trending
                  </div>
                )}
                {nft.collection && (
                  <div className="collection-badge-enhanced">
                    {nft.collection}
                  </div>
                )}
                <NFTCard
                  nft={nft}
                  showRoyalty={true}
                  actionButton={
                    nft.isSample ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-enhanced btn-secondary-enhanced" disabled style={{ flex: 1 }}>
                          Demo NFT
                        </button>
                        <button 
                          className="btn-enhanced btn-primary-enhanced"
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
                          className="btn-enhanced btn-primary-enhanced"
                        >
                          {buying === nft.tokenId
                            ? '⏳ Processing...'
                            : nft.seller === account
                            ? '✅ Your NFT'
                            : !account
                            ? '🔒 Connect Wallet'
                            : `💎 Buy for ${nft.price} ETH`}
                        </button>
                        {nft.seller !== account && account && (
                          <button
                            className="btn-enhanced btn-secondary-enhanced"
                            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                            onClick={() => toast.success('Added to watchlist! 👀')}
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
