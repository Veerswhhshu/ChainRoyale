import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

// Network configurations
const NETWORKS = {
  31337: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    symbol: 'ETH',
    explorer: '',
  },
  80002: {
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
    symbol: 'MATIC',
    explorer: 'https://amoy.polygonscan.com',
  },
};

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contracts, setContracts] = useState({ nft: null, marketplace: null });

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  async function checkConnection() {
    if (!window.ethereum) {
      console.log('MetaMask not detected');
      return;
    }

    try {
      // Check if already connected
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        
        console.log('Wallet already connected:', accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }

  function handleAccountsChanged(accounts) {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      // Refresh the page to reset state
      window.location.reload();
    }
  }

  function handleChainChanged(chainId) {
    console.log('Chain changed:', chainId);
    // Refresh the page to reset state
    window.location.reload();
  }

  function handleConnect(connectInfo) {
    console.log('Connected:', connectInfo);
    checkConnection();
  }

  function handleDisconnect(error) {
    console.log('Disconnected:', error);
    disconnectWallet();
  }

  async function connectWallet() {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      
      toast.success('Wallet connected successfully!');
      console.log('Connected to:', address);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Please connect to MetaMask');
      } else if (error.code === -32002) {
        toast.error('MetaMask is already processing. Please check MetaMask.');
      } else {
        toast.error('Failed to connect wallet: ' + error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectWallet() {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setContracts({ nft: null, marketplace: null });
    toast.success('Wallet disconnected');
  }

  async function switchToAmoy() {
    if (!window.ethereum) {
      toast.error('MetaMask not detected');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // 80002 in hex
      });
    } catch (error) {
      console.error('Switch network error:', error);
      
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
          toast.success('Polygon Amoy network added!');
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add Polygon Amoy network');
        }
      } else {
        toast.error('Failed to switch network');
      }
    }
  }

  async function switchToLocalhost() {
    if (!window.ethereum) {
      toast.error('MetaMask not detected');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      });
    } catch (error) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7A69',
                chainName: 'Localhost 8545',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null,
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding localhost network:', addError);
          toast.error('Failed to add localhost network');
        }
      } else {
        toast.error('Failed to switch to localhost network');
      }
    }
  }

  // Contract creation functions (you'll need to add your contract addresses and ABIs)
  function createContract(address, abi, signerOrProvider) {
    if (!address || !abi) {
      console.error('Missing contract address or ABI');
      return null;
    }
    
    try {
      return new ethers.Contract(address, abi, signerOrProvider || provider);
    } catch (error) {
      console.error('Error creating contract:', error);
      return null;
    }
  }

  const isCorrectNetwork = chainId === 80002 || chainId === 31337;
  const networkName = NETWORKS[chainId]?.name || 'Unknown Network';

  const value = {
    account,
    chainId,
    provider,
    signer,
    isConnecting,
    isCorrectNetwork,
    networkName,
    contracts,
    connectWallet,
    disconnectWallet,
    switchToAmoy,
    switchToLocalhost,
    createContract,
    setContracts,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}