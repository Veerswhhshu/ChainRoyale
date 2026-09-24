import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';
import NFTCard from '../components/NFTCard';

export default function MyNFTs() {
  const { account, signer, getNFTContract, getMarketplaceContract, isCorrectNetwork } = useWallet();
  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingPrice, setListingPrice] = useState({});
  const [showListModal, setShowListModal] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (account && isCorrectNetwork) {
      loadMyNFTs();
    }
  }, [account, isCorrectNetwork]);

  async function loadMyNFTs() {
    try {
      setLoading(true);
      const nftContract = getNFTContract();
      const marketplace = getMarketplaceContract();

      if (!nftContract || !marketplace) {
        setMyNFTs([]);
        return;
      }

      // Get total supply
      const currentTokenId = await nftContract.getCurrentTokenId();
      const nfts = [];

      // Check each token
      for (let i = 0; i < currentTokenId; i++) {
        try {
          const owner = await nftContract.ownerOf(i);

          if (owner.toLowerCase() === account.toLowerCase()) {
            const tokenURI = await nftContract.tokenURI(i);
            let metadata = { name: `NFT #${i}`, description: '', image: '' };

            if (tokenURI.startsWith('data:application/json')) {
              const json = atob(tokenURI.split(',')[1]);
              metadata = JSON.parse(json);
            }

            // Check if listed
            const listing = await marketplace.getListing(await nftContract.getAddress(), i);

            nfts.push({
              tokenId: i,
              ...metadata,
              isListed: listing.isActive,
              listingPrice: listing.price,
            });
          }
        } catch (error) {
          // Token doesn't exist or error fetching
          continue;
        }
      }

      setMyNFTs(nfts);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Failed to load your NFTs');
    } finally {
      setLoading(false);
    }
  }

  async function approveAndList(tokenId) {
    if (!listingPrice[tokenId] || parseFloat(listingPrice[tokenId]) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setProcessing(tokenId);
    const toastId = toast.loading('Approving marketplace...');

    try {
      const nftContract = getNFTContract(signer);
      const marketplace = getMarketplaceContract(signer);
      const marketplaceAddress = await marketplace.getAddress();

      // Check if already approved
      const approved = await nftContract.getApproved(tokenId);

      if (approved.toLowerCase() !== marketplaceAddress.toLowerCase()) {
        const approveTx = await nftContract.approve(marketplaceAddress, tokenId);
        toast.loading('Waiting for approval...', { id: toastId });
        await approveTx.wait();
      }

      // List NFT
      toast.loading('Listing NFT...', { id: toastId });
      const price = ethers.parseEther(listingPrice[tokenId]);
      const listTx = await marketplace.listNFT(
        await nftContract.getAddress(),
        tokenId,
        price
      );

      await listTx.wait();

      toast.success('NFT listed successfully!', { id: toastId });

      // Reset and reload
      setShowListModal(null);
      setListingPrice((prev) => ({ ...prev, [tokenId]: '' }));
      await loadMyNFTs();
    } catch (error) {
      console.error('Error listing NFT:', error);
      const errorMessage = error.reason || error.message || 'Listing failed';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setProcessing(null);
    }
  }

  async function cancelListing(tokenId) {
    setProcessing(tokenId);
    const toastId = toast.loading('Cancelling listing...');

    try {
      const nftContract = getNFTContract();
      const marketplace = getMarketplaceContract(signer);

      const tx = await marketplace.cancelListing(
        await nftContract.getAddress(),
        tokenId
      );

      await tx.wait();

      toast.success('Listing cancelled!', { id: toastId });
      await loadMyNFTs();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      const errorMessage = error.reason || error.message || 'Cancellation failed';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setProcessing(null);
    }
  }

  if (!account) {
    return (
      <div className="container">
        <div className="warning-box">
          <h2>👛 Wallet Not Connected</h2>
          <p>Please connect your wallet to view your NFTs.</p>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="container">
        <div className="warning-box">
          <h2>⚠️ Wrong Network</h2>
          <p>Please switch to Polygon Amoy testnet or Localhost.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your NFTs...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My NFTs</h1>
        <p>Manage your NFT collection</p>
      </div>

      {myNFTs.length === 0 ? (
        <div className="empty-state">
          <h2>No NFTs found</h2>
          <p>Mint your first NFT to get started!</p>
        </div>
      ) : (
        <div className="nft-grid">
          {myNFTs.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              nft={nft}
              actionButton={
                <div className="nft-actions">
                  {nft.isListed ? (
                    <>
                      <div className="listed-badge">
                        Listed for {ethers.formatEther(nft.listingPrice)} MATIC
                      </div>
                      <button
                        onClick={() => cancelListing(nft.tokenId)}
                        disabled={processing === nft.tokenId}
                        className="btn btn-secondary"
                      >
                        {processing === nft.tokenId ? 'Cancelling...' : 'Cancel Listing'}
                      </button>
                    </>
                  ) : (
                    <>
                      {showListModal === nft.tokenId ? (
                        <div className="list-modal">
                          <input
                            type="number"
                            placeholder="Price in MATIC"
                            value={listingPrice[nft.tokenId] || ''}
                            onChange={(e) =>
                              setListingPrice((prev) => ({
                                ...prev,
                                [nft.tokenId]: e.target.value,
                              }))
                            }
                            step="0.01"
                            min="0"
                            className="price-input"
                          />
                          <div className="modal-buttons">
                            <button
                              onClick={() => approveAndList(nft.tokenId)}
                              disabled={processing === nft.tokenId}
                              className="btn btn-primary btn-small"
                            >
                              {processing === nft.tokenId ? 'Listing...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setShowListModal(null)}
                              className="btn btn-secondary btn-small"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowListModal(nft.tokenId)}
                          className="btn btn-primary"
                        >
                          List for Sale
                        </button>
                      )}
                    </>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
