#!/bin/bash
echo "🚀 Starting NFT Marketplace..."

# Kill existing processes
pkill -f "hardhat node" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Start Hardhat node in background
echo "📡 Starting Hardhat node..."
npx hardhat node > hardhat.log 2>&1 &
HARDHAT_PID=$!

# Wait for Hardhat to start
sleep 5

# Deploy contracts
echo "📋 Deploying contracts..."
npx hardhat run scripts/deploy.js --network localhost

# Copy ABIs
echo "📁 Copying ABIs..."
npm run copy-abis

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev

# Cleanup function
cleanup() {
    echo "🛑 Shutting down..."
    kill $HARDHAT_PID 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM
