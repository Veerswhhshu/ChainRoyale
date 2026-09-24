import { useWallet } from '../context/WalletContext';

export default function NetworkStatus() {
  const { chainId, isCorrectNetwork, account } = useWallet();

  if (!account) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: isCorrectNetwork ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      fontSize: '0.875rem',
      fontWeight: '500',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span style={{ fontSize: '1.2rem' }}>
        {isCorrectNetwork ? '✅' : '⚠️'}
      </span>
      <div>
        <div style={{ fontWeight: 'bold' }}>
          {isCorrectNetwork ? 'Connected' : 'Wrong Network'}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
          Chain ID: {chainId || 'Unknown'}
          {!isCorrectNetwork && ' (Expected: 31337 or 80002)'}
        </div>
      </div>
    </div>
  );
}
