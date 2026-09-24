import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import Navbar from './components/Navbar';
import NetworkStatus from './components/NetworkStatus';
import HardhatNFTInterface from './components/HardhatNFTInterface';
import Home from './pages/Home';
import Mint from './pages/Mint';
import MyNFTs from './pages/MyNFTs';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="app">
          {/* Animated background particles */}
          <div className="particles-bg"></div>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HardhatNFTInterface />} />
              <Route path="/home" element={<Home />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/my-nfts" element={<MyNFTs />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>NFT Marketplace with Automatic Royalty Distribution</p>
            <p>Built with React, Ethers.js, and Solidity</p>
          </footer>
          <NetworkStatus />
        </div>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </WalletProvider>
  );
}

export default App;
