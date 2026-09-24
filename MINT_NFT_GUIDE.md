# 🎨 How to Mint Your First NFT - Step by Step

## ⚠️ Getting "Could not connect to NFT contract" Error?

This error means your wallet is not connected to the correct network. Follow these steps **exactly**:

---

## 📋 Step-by-Step Solution

### Step 1: Check What Network You're On

1. Open MetaMask
2. Look at the top - it shows your current network
3. **You MUST be on "Localhost 8545"** (not Ethereum Mainnet, not any other network)

---

### Step 2: Add Localhost Network to MetaMask

**If you don't see "Localhost 8545" in your networks:**

1. **Open MetaMask**
2. **Click the network dropdown** (top center, shows current network)
3. **Click "Add Network"** (at the bottom)
4. **Click "Add a network manually"**
5. **Fill in these EXACT values:**

```
Network Name: Localhost 8545
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

6. **Click "Save"**
7. **Switch to this network** (click the network dropdown and select "Localhost 8545")

---

### Step 3: Import Test Account

You need an account with funds:

1. **Open MetaMask**
2. **Click the account icon** (top right)
3. **Click "Import Account"**
4. **Select "Private Key"**
5. **Paste this private key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
6. **Click "Import"**

This account has **10,000 ETH** for testing!

---

### Step 4: Verify Your Setup

**Open browser console (F12) and check:**

1. Go to http://localhost:3000
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. You should see:
   ```
   Getting contract addresses for chainId: 31337
   Using localhost contracts: { nftContract: '0x5Fb...', marketplace: '0xe7f...' }
   ```

**If you see a different chainId (like 1, 137, etc.):**
- You're on the wrong network!
- Switch to "Localhost 8545" in MetaMask
- Refresh the page

---

### Step 5: Connect Your Wallet

1. Click **"Connect Wallet"** button (top right)
2. **Approve** the connection in MetaMask
3. You should see your address in the top right
4. The network badge should show **"Localhost"**

---

### Step 6: Mint Your NFT

Now you can mint!

1. Go to **"Mint NFT"** page
2. Fill in:
   - **Name**: "My First NFT"
   - **Description**: "This is my test NFT"
   - **Image**: Upload any image (keep it small, < 1MB)
   - **Royalty**: 5
3. Click **"Mint NFT"**
4. **Approve** the transaction in MetaMask
5. Wait for confirmation (should be instant on localhost)

---

## 🔍 Troubleshooting

### Error: "Could not connect to NFT contract"

**Cause**: Wrong network or contracts not deployed

**Solution**:
```bash
# 1. Check if Hardhat node is running
lsof -i :8545

# 2. If not running, start it:
npx hardhat node

# 3. In another terminal, redeploy:
npm run deploy:local
npm run copy-abis

# 4. Refresh browser
```

---

### Error: "Please switch to Polygon Amoy or Localhost network"

**Solution**: 
- Open MetaMask
- Click network dropdown
- Select "Localhost 8545"
- Refresh page

---

### Error: "Insufficient funds"

**Solution**:
- Make sure you imported the test account (Step 3)
- The private key is: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- This account has 10,000 ETH

---

### MetaMask Shows Wrong Network

**If MetaMask shows "Ethereum Mainnet" or any other network:**

1. Click the network dropdown in MetaMask
2. Scroll down to find "Localhost 8545"
3. If you don't see it, add it (see Step 2)
4. Click to switch to it
5. Refresh the browser page

---

### Browser Console Shows Different Chain ID

**If console shows:**
```
Getting contract addresses for chainId: 1
```
or
```
Getting contract addresses for chainId: 137
```

**This means you're on the wrong network!**

**Fix:**
1. Switch to "Localhost 8545" in MetaMask
2. Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

---

## ✅ Verification Checklist

Before minting, verify:

- [ ] Hardhat node is running (`lsof -i :8545` shows node process)
- [ ] Contracts are deployed (`cat deployment.json` shows addresses)
- [ ] MetaMask is installed
- [ ] MetaMask shows "Localhost 8545" network (top center)
- [ ] Test account is imported (shows ~10,000 ETH balance)
- [ ] Wallet is connected (address shows in top right of app)
- [ ] Browser console shows chainId: 31337
- [ ] No errors in browser console

---

## 🎯 Quick Test

**To verify everything works:**

1. Open http://localhost:3000
2. Press F12 (open console)
3. Type this in console:
   ```javascript
   window.ethereum.request({ method: 'eth_chainId' })
   ```
4. You should see: `"0x7a69"` (which is 31337 in hex)

**If you see anything else, you're on the wrong network!**

---

## 📸 Visual Guide

### What MetaMask Should Look Like:

```
┌─────────────────────────┐
│   Localhost 8545    ▼   │  ← Should say "Localhost 8545"
├─────────────────────────┤
│  Account 1              │
│  0xf39F...2266          │  ← Your imported account
│  9,999.99 ETH           │  ← Should have ~10,000 ETH
└─────────────────────────┘
```

### What the App Should Show:

```
┌─────────────────────────────────────┐
│  🎨 NFT Marketplace                 │
│                                     │
│  Home | Mint | My NFTs              │
│                                     │
│  [Localhost] [0xf39F...2266] ←─────┤ Should show these
└─────────────────────────────────────┘
```

---

## 🚀 Still Not Working?

### Complete Reset:

```bash
# Terminal 1: Stop everything
pkill -f "hardhat node"
pkill -f "vite"

# Terminal 2: Fresh start
cd nft-marketplace-royalty
npx hardhat node

# Terminal 3: Redeploy
npm run deploy:local
npm run copy-abis

# Terminal 4: Start frontend
cd frontend
npm run dev
```

Then:
1. Close and reopen MetaMask
2. Switch to Localhost 8545
3. Refresh browser (Ctrl+Shift+R)
4. Connect wallet
5. Try minting again

---

## 💡 Pro Tips

1. **Always check the network** in MetaMask before any transaction
2. **Keep browser console open** (F12) to see errors
3. **Use the test account** - it has unlimited funds
4. **Refresh after switching networks** - the app needs to reload
5. **Check Hardhat node logs** if transactions fail

---

## 📞 Need More Help?

1. **Check browser console** (F12) for error messages
2. **Check Hardhat node terminal** for transaction logs
3. **Run diagnostic**: `npm run check`
4. **Read**: TROUBLESHOOTING.md

---

**Once you're on the correct network, minting will work perfectly!** 🎨✨

The key is: **MetaMask MUST show "Localhost 8545"** at the top!
