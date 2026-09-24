import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';
import { fileToDataURI, createMetadata, metadataToDataURI } from '../utils/ipfs';
import { NETWORKS } from '../utils/contracts';

export default function Mint() {
  const { account, signer, rpcProvider, getNFTContract, isCorrectNetwork, chainId } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    royalty: '5',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [minting, setMinting] = useState(false);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleMint(e) {
    e.preventDefault();

    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to Hardhat Local or Sepolia network');
      return;
    }

    if (!formData.name || !imageFile) {
      toast.error('Please fill in all fields');
      return;
    }

    const royaltyBasisPoints = Math.floor(parseFloat(formData.royalty) * 100);
    if (royaltyBasisPoints < 0 || royaltyBasisPoints > 1000) {
      toast.error('Royalty must be between 0% and 10%');
      return;
    }

    setMinting(true);
    const toastId = toast.loading('📝 Preparing NFT metadata...');

    try {
      // Convert image to data URI
      toast.loading('🖼️ Processing image...', { id: toastId });
      const imageURI = await fileToDataURI(imageFile);
      
      // Create metadata
      toast.loading('📋 Creating metadata...', { id: toastId });
      const metadata = createMetadata(formData.name, formData.description, imageURI);
      const metadataURI = metadataToDataURI(metadata);

      toast.loading('🔗 Connecting to contract...', { id: toastId });

      // Get NFT contract
      const nftContract = getNFTContract(signer);
      
      if (!nftContract) {
        throw new Error('Could not connect to NFT contract. Please ensure contracts are deployed and you are on the correct network.');
      }

      toast.loading('🔐 Waiting for wallet approval...', { id: toastId });

      // Mint NFT with better error handling
      let tx;
      try {
        tx = await nftContract.mintNFT(
          account,
          metadataURI,
          royaltyBasisPoints,
          {
            gasLimit: 500000 // Set explicit gas limit
          }
        );
      } catch (error) {
        console.error('Transaction error:', error);
        if (error.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected by user');
        } else if (error.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas fees');
        } else {
          throw new Error(error.reason || error.message || 'Transaction failed');
        }
      }

      toast.loading('⛏️ Mining transaction...', { id: toastId });
      
      // Wait for transaction with timeout
      let receipt;
      try {
        receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout')), 60000)
          )
        ]);
      } catch (error) {
        if (error.message === 'Transaction timeout') {
          toast.loading('⏳ Transaction taking longer than expected...', { id: toastId });
          receipt = await tx.wait(); // Continue waiting
        } else {
          throw error;
        }
      }

      // Extract token ID from events
      let tokenId = 'Unknown';
      try {
        // Look for NFTMinted event
        const mintEvent = receipt.logs.find(log => {
          try {
            const parsed = nftContract.interface.parseLog(log);
            return parsed.name === 'NFTMinted';
          } catch {
            return false;
          }
        });
        
        if (mintEvent) {
          const parsed = nftContract.interface.parseLog(mintEvent);
          tokenId = parsed.args[0].toString();
        }
      } catch (error) {
        console.error('Error parsing events:', error);
      }

      toast.success(
        <div>
          <div style={{ fontWeight: 'bold' }}>🎉 NFT Minted Successfully!</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Token ID: {tokenId}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
            Tx: {receipt.hash.slice(0, 10)}...{receipt.hash.slice(-8)}
          </div>
        </div>,
        { id: toastId, duration: 6000 }
      );

      // Reset form
      setFormData({ name: '', description: '', royalty: '5' });
      setImageFile(null);
      setImagePreview(null);

      // Show explorer link if available
      const explorerUrl = NETWORKS[chainId]?.explorer;
      if (explorerUrl && receipt.hash) {
        console.log(`View on explorer: ${explorerUrl}/tx/${receipt.hash}`);
        setTimeout(() => {
          toast.success(
            <div>
              <div>🔍 View on Explorer</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                <a 
                  href={`${explorerUrl}/tx/${receipt.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#3182ce', textDecoration: 'underline' }}
                >
                  Open Transaction
                </a>
              </div>
            </div>,
            { duration: 8000 }
          );
        }, 2000);
      }

    } catch (error) {
      console.error('Error minting NFT:', error);
      let errorMessage = 'Minting failed';
      
      if (error.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out - please try again';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`❌ ${errorMessage}`, { id: toastId, duration: 5000 });
    } finally {
      setMinting(false);
    }
  }

  if (!isCorrectNetwork) {
    return (
      <div className="container">
        <div className="warning-box-enhanced">
          <h2>⚠️ Wrong Network</h2>
          <p>Please switch to Hardhat Local or Sepolia testnet to mint NFTs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>🎨 Mint Your NFT</h1>
        <p>Create your own NFT with customizable royalties and earn from every resale</p>
      </div>

      <div className="mint-container">
        <form onSubmit={handleMint} className="mint-form" style={{ 
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 30px var(--shadow)'
        }}>
          <div className="form-group">
            <label htmlFor="name">NFT Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My Awesome NFT"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your NFT..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image *</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="royalty">
              Royalty Percentage (0-10%) *
              <span className="help-text">
                You'll receive this percentage on all secondary sales
              </span>
            </label>
            <input
              type="number"
              id="royalty"
              name="royalty"
              value={formData.royalty}
              onChange={handleInputChange}
              min="0"
              max="10"
              step="0.1"
              required
            />
          </div>

          <button
            type="submit"
            disabled={minting || !account}
            className="btn btn-primary btn-large"
          >
            {minting ? 'Minting...' : 'Mint NFT'}
          </button>

          {!account && (
            <p className="form-note">Please connect your wallet to mint NFTs</p>
          )}
        </form>

        <div className="mint-info" style={{ 
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 30px var(--shadow)'
        }}>
          <h3>💡 Minting Guide</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>🎯 Blockchain Minting</strong><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Your NFT will be permanently stored on the blockchain
              </span>
            </li>
            <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>👑 Royalty System</strong><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Set 0-10% royalty and earn from every resale automatically
              </span>
            </li>
            <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>💰 Platform Fee</strong><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Only 2% platform fee on all sales
              </span>
            </li>
            <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>🔒 Ownership</strong><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                You maintain full ownership and control
              </span>
            </li>
            <li style={{ padding: '0.75rem 0' }}>
              <strong>📸 Storage</strong><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Images stored as data URIs (IPFS for production)
              </span>
            </li>
          </ul>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'var(--bg-lighter)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--primary)'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--primary)' }}>💎 Example Earnings</strong><br/>
              If you set 5% royalty and your NFT sells for 10 MATIC:<br/>
              • You earn: 0.5 MATIC per resale<br/>
              • Forever, automatically!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
