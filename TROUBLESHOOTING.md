# Troubleshooting Guide

## Common Issues and Solutions

### ❌ Error: "ENS name used for a contract target must be correctly configured"

**Cause**: The contract addresses are empty or the frontend can't connect to the contracts.

**Solutions**:

#### 1. Check if Hardhat Node is Running

```bash
# Check if the node is running
ps aux | grep "hardhat node"

# If not running, start it:
npx hardhat node
```

#### 2. Verify Contracts are Deployed

```bash
# Check if deployment.json exists
cat deployment.json

# If not, deploy contracts:
npm run deploy:local
```

#### 3. Check Your Network in MetaMask

Make sure you're connected to the correct network:

**For Local Development:**
- Network Name: Localhost 8545
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

**Steps to add Localhost network in MetaMask:**
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Click "Add a network manually"
5. Fill in the details above
6. Save and switch to this network

#### 4. Verify Contract Addresses

Open browser console (F12) and check for logs:
```
Getting contract addresses for chainId: 31337
Using localhost contracts: { nftContract: '0x5Fb...', marketplace: '0xe7f...' }
```

If you see empty addresses, redeploy:
```bash
npm run deploy:local
npm run copy-abis
```

#### 5. Clear Cache and Reload

```bash
# In frontend directory
rm -rf node_modules/.vite
npm run dev
```

Then hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

### ❌ Error: "Please connect your wallet"

**Solution**: Click the "Connect Wallet" button in the top right corner and approve the connection in MetaMask.

---

### ❌ Error: "Wrong Network"

**Solution**: 

1. Click "Switch to Amoy" button (for testnet)
2. Or manually switch to Localhost 8545 in MetaMask (for local development)

---

### ❌ Error: "Insufficient funds"

**Solution**:

**For Local Development:**
- Use one of the Hardhat test accounts (they have 10,000 ETH each)
- Import private key in MetaMask:
  ```
  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
  ```

**For Polygon Amoy:**
- Get test MATIC from faucet: https://faucet.polygon.technology/

---

### ❌ Error: "Transaction failed"

**Possible causes and solutions:**

1. **Gas estimation failed**
   - Check if contracts are deployed
   - Verify you're on correct network
   - Try increasing gas limit

2. **Nonce too high**
   - Reset MetaMask account:
     - Settings → Advanced → Clear activity tab data

3. **Contract not approved**
   - For listing NFTs, approve marketplace first
   - The UI should handle this automatically

---

### ❌ NFTs not showing up

**Solutions:**

1. **Wait for transaction confirmation**
   - Check transaction on block explorer
   - Wait for 1-2 block confirmations

2. **Refresh the page**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check console for errors**
   - Open browser console (F12)
   - Look for error messages

---

### ❌ Images not loading

**Cause**: Images are stored as data URIs which can be large.

**Solutions:**

1. **Use smaller images** (< 500KB recommended)
2. **Wait for page to fully load**
3. **Check browser console** for errors

---

## Step-by-Step Setup Verification

### 1. Backend Setup

```bash
# Terminal 1: Start Hardhat node
cd nft-marketplace-royalty
npx hardhat node

# Should show:
# ✓ Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
# ✓ Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
```

### 2. Deploy Contracts

```bash
# Terminal 2: Deploy
npm run deploy:local

# Should show:
# ✓ NFTContract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# ✓ NFTMarketplace deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3. Copy ABIs

```bash
npm run copy-abis

# Should show:
# ✓ ABIs copied successfully!
```

### 4. Mint Sample NFTs (Optional)

```bash
npm run mint-samples

# Should show:
# ✓ Successfully minted and listed 3 NFTs!
```

### 5. Start Frontend

```bash
cd frontend
npm run dev

# Should show:
# ✓ Local: http://localhost:3000/
```

### 6. Configure MetaMask

1. **Add Localhost Network** (if not already added)
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import Test Account**
   - Click MetaMask → Import Account
   - Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has 10,000 ETH

3. **Switch to Localhost Network**
   - Click network dropdown
   - Select "Localhost 8545"

### 7. Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Approve in MetaMask
4. You should see your address in top right

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Hardhat node is running (`ps aux | grep hardhat`)
- [ ] Contracts are deployed (`cat deployment.json`)
- [ ] ABIs are copied (`ls frontend/src/utils/abis/`)
- [ ] Frontend is running (`curl http://localhost:3000`)
- [ ] MetaMask is installed
- [ ] Localhost network is added to MetaMask
- [ ] Connected to Localhost 8545 network
- [ ] Test account is imported
- [ ] Wallet is connected to the app
- [ ] Browser console shows no errors

---

## Still Having Issues?

### Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press F12
3. Go to Console tab
4. Look for error messages
5. Check the error details

### Check Network Tab

1. In browser DevTools
2. Go to Network tab
3. Reload page
4. Check if any requests are failing

### Restart Everything

```bash
# Kill all processes
pkill -f "hardhat node"
pkill -f "vite"

# Start fresh
cd nft-marketplace-royalty

# Terminal 1
npx hardhat node

# Terminal 2
npm run deploy:local
npm run copy-abis
npm run mint-samples

# Terminal 3
cd frontend
npm run dev
```

### Check Contract Addresses in Code

Open `frontend/src/utils/contracts.js` and verify:

```javascript
localhost: {
  nftContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  marketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  chainId: 31337,
}
```

These should match the addresses in `deployment.json`.

---

## Getting Help

If you're still stuck:

1. **Check the logs**:
   - Hardhat node logs
   - Browser console logs
   - Frontend terminal logs

2. **Verify versions**:
   ```bash
   node --version  # Should be v16+
   npm --version   # Should be v8+
   ```

3. **Clean install**:
   ```bash
   rm -rf node_modules
   rm -rf frontend/node_modules
   npm install
   cd frontend && npm install
   ```

---

## Common MetaMask Issues

### Reset Account

If transactions are stuck:
1. MetaMask → Settings
2. Advanced
3. Clear activity tab data
4. Confirm

### Switch Networks

If wrong network:
1. Click network dropdown
2. Select "Localhost 8545"
3. Refresh page

### Import Account

If no funds:
1. MetaMask → Import Account
2. Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. This account has 10,000 ETH

---

**Most issues are solved by ensuring:**
1. ✅ Hardhat node is running
2. ✅ Contracts are deployed
3. ✅ Correct network in MetaMask
4. ✅ Wallet is connected

Good luck! 🚀
