import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { getContractAddresses, NETWORKS, getRpcUrl } from '../utils/contracts';
import NFTContractABI from '../utils/abis/NFTContract.json';
import NFTMarketplaceABI from '../utils/abis/NFTMarketplace.json';

const WalletContext = createContext();

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [rpcProvider, setRpcProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  async function checkConnection() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
        provider.pollingInterval = 12000;
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
        const rpcUrl = getRpcUrl(Number(network.chainId));
        if (rpcUrl) {
          setRpcProvider(new ethers.JsonRpcProvider(rpcUrl, Number(network.chainId)));
        }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      window.location.reload();
    }
  }

  function handleChainChanged() {
    window.location.reload();
  }

  async function connectWallet() {
    if (!window.ethereum) {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      provider.pollingInterval = 12000;
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      const rpcUrl = getRpcUrl(Number(network.chainId));
      if (rpcUrl) {
        setRpcProvider(new ethers.JsonRpcProvider(rpcUrl, Number(network.chainId)));
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectWallet() {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    toast.success('Wallet disconnected');
  }

  useEffect(() => {
    if (!chainId) return;
    const rpcUrl = getRpcUrl(chainId);
    if (rpcUrl) {
      setRpcProvider(new ethers.JsonRpcProvider(rpcUrl, chainId));
    }
  }, [chainId]);

  async function switchToSepolia() {
    if (!window.ethereum) return;

    const rpcUrl = getRpcUrl(11155111);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xAA36A7' }], // 11155111 in hex
      });
    } catch (error) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xAA36A7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [rpcUrl || 'https://ethereum-sepolia-rpc.publicnode.com'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add Sepolia network');
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  }

  async function switchToLocalhost() {
    if (!window.ethereum) return;

    const rpcUrl = getRpcUrl(31337);
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
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [rpcUrl || 'http://127.0.0.1:8545'],
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

  function getNFTContract(signerOrProvider) {
    const addresses = getContractAddresses(chainId);
    if (!addresses) {
      console.error('No contract addresses found for chainId:', chainId);
      return null;
    }
    
    if (!addresses.nftContract || addresses.nftContract === '') {
      console.error('NFT contract address is empty for chainId:', chainId);
      return null;
    }
    
    try {
      return new ethers.Contract(
        addresses.nftContract,
        NFTContractABI,
        signerOrProvider || provider || rpcProvider
      );
    } catch (error) {
      console.error('Error creating NFT contract instance:', error);
      return null;
    }
  }

  function getMarketplaceContract(signerOrProvider) {
    const addresses = getContractAddresses(chainId);
    if (!addresses) {
      console.error('No contract addresses found for chainId:', chainId);
      return null;
    }
    
    if (!addresses.marketplace || addresses.marketplace === '') {
      console.error('Marketplace contract address is empty for chainId:', chainId);
      return null;
    }
    
    try {
      return new ethers.Contract(
        addresses.marketplace,
        NFTMarketplaceABI,
        signerOrProvider || provider || rpcProvider
      );
    } catch (error) {
      console.error('Error creating marketplace contract instance:', error);
      return null;
    }
  }

  const isCorrectNetwork = chainId === 11155111 || chainId === 31337 || chainId === 1;
  const networkName = NETWORKS[chainId]?.name || 'Unknown Network';

  const value = {
    account,
    chainId,
    provider,
    signer,
    isConnecting,
    isCorrectNetwork,
    networkName,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    switchToLocalhost,
    rpcProvider,
    getNFTContract,
    getMarketplaceContract,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
