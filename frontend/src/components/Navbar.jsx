import { Link } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';
import { useWallet } from '../context/WalletContext';

export default function Navbar() {
  const { isCorrectNetwork, networkName, switchToAmoy, chainId } = useWallet();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⛓️</span>
          <span>TarsChain</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/mint" className="nav-link">Mint NFT</Link>
          <Link to="/my-nfts" className="nav-link">My NFTs</Link>
        </div>
        
        <div className="navbar-actions">
          {chainId && !isCorrectNetwork && (
            <button onClick={switchToAmoy} className="network-warning">
              Switch to Amoy
            </button>
          )}
          {chainId && isCorrectNetwork && (
            <span className="network-badge">{networkName}</span>
          )}
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
}
