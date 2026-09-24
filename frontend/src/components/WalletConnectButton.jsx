import { useWallet } from '../context/WalletContext';

export default function WalletConnectButton() {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <button
        onClick={disconnectWallet}
        className="wallet-button connected"
      >
        {shortenAddress(account)}
      </button>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="wallet-button"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
