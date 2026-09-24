import { useState } from 'react';
import { ethers } from 'ethers';

export default function NFTCard({ nft, actionButton, showRoyalty = false }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price) => {
    if (typeof price === 'string' && !price.includes('.')) {
      return price;
    }
    try {
      return ethers.formatEther(price);
    } catch {
      return price;
    }
  };

  return (
    <div className="nft-card">
      <div className="nft-image-container">
        {!imageError ? (
          <img
            src={nft.image || '/placeholder.png'}
            alt={nft.name}
            onError={handleImageError}
            className="nft-image"
          />
        ) : (
          <div className="nft-image-placeholder">
            <span>🖼️</span>
          </div>
        )}
      </div>
      
      <div className="nft-info">
        <h3 className="nft-name">{nft.name || `NFT #${nft.tokenId}`}</h3>
        
        {nft.description && (
          <p className="nft-description">{nft.description}</p>
        )}
        
        {nft.price && (
          <div className="price-tag">
            <div>
              <div className="price-tag-label">Current Price</div>
              <div className="price-tag-value">
                {formatPrice(nft.price)} MATIC
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
          {showRoyalty && nft.royaltyPercentage && (
            <span className="badge badge-primary">
              👑 {nft.royaltyPercentage}% Royalty
            </span>
          )}
          {nft.isSample && (
            <span className="badge badge-warning">
              Demo
            </span>
          )}
        </div>
        
        {nft.seller && !nft.isSample && (
          <div className="nft-seller" style={{ marginTop: '1rem' }}>
            <span className="seller-label">Seller:</span>
            <span className="seller-address">
              {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
            </span>
          </div>
        )}
        
        {actionButton && (
          <div className="nft-action">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
}
