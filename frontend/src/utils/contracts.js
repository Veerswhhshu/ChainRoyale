// Contract addresses - Updated with deployed addresses
const env = import.meta.env;

// Allow overriding RPC endpoints via environment for rate-limit friendly access
const RPC_OVERRIDES = {
  1: env?.VITE_MAINNET_RPC,
  11155111: env?.VITE_SEPOLIA_RPC,
  31337: env?.VITE_LOCAL_RPC,
};

export const CONTRACTS = {
  // For local development (Hardhat network)
  localhost: {
    nftContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    marketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    chainId: 31337,
  },
  // For Ethereum mainnet/testnets
  ethereum: {
    nftContract: '',
    marketplace: '',
    chainId: 1, // Mainnet
  },
  sepolia: {
    nftContract: '',
    marketplace: '',
    chainId: 11155111, // Sepolia testnet
  },
};

// Network configuration
export const NETWORKS = {
  31337: {
    name: 'Hardhat Local',
    rpcUrl: RPC_OVERRIDES[31337] || 'http://127.0.0.1:8545',
    symbol: 'ETH',
    explorer: '',
  },
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: RPC_OVERRIDES[1] || 'https://eth-mainnet.public.blastapi.io',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
  },
  11155111: {
    name: 'Sepolia Testnet',
    rpcUrl: RPC_OVERRIDES[11155111] || 'https://ethereum-sepolia-rpc.publicnode.com',
    symbol: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
  },
};

// Get contract addresses for current network
export function getContractAddresses(chainId) {
  console.log('Getting contract addresses for chainId:', chainId);
  
  if (chainId === 31337) {
    console.log('Using localhost contracts:', CONTRACTS.localhost);
    return CONTRACTS.localhost;
  }
  
  if (chainId === 1) {
    console.log('Using Ethereum mainnet contracts:', CONTRACTS.ethereum);
    return CONTRACTS.ethereum;
  }
  
  if (chainId === 11155111) {
    console.log('Using Sepolia contracts:', CONTRACTS.sepolia);
    return CONTRACTS.sepolia;
  }
  
  console.warn('No contract addresses configured for chainId:', chainId);
  return null;
}

// Load deployment data if available
export async function loadDeploymentData() {
  try {
    const response = await fetch('/deployment.json');
    if (response.ok) {
      const data = await response.json();
      return data.contracts;
    }
  } catch (error) {
    console.log('No deployment data found, using default addresses');
  }
  return null;
}

export function getRpcUrl(chainId) {
  return NETWORKS[chainId]?.rpcUrl || null;
}
