# 🚨 QUICK FIX: "Could not connect to NFT contract"

## The Problem
You're getting this error when trying to mint an NFT because **MetaMask is on the wrong network**.

## The Solution (2 Minutes)

### 1️⃣ Check Your MetaMask Network

Look at the **TOP CENTER** of MetaMask. What does it say?

❌ **If it says:**
- "Ethereum Mainnet"
- "Polygon"
- "Sepolia"
- Anything OTHER than "Localhost 8545"

✅ **It MUST say:**
- "Localhost 8545"

---

### 2️⃣ Add Localhost Network

**If you don't see "Localhost 8545":**

1. Open MetaMask
2. Click the network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter these EXACT values:

```
Network Name:     Localhost 8545
New RPC URL:      http://127.0.0.1:8545
Chain ID:         31337
Currency Symbol:  ETH
```

5. Click "Save"
6. **Switch to this network**

---

### 3️⃣ Import Test Account

1. MetaMask → Click account icon → "Import Account"
2. Select "Private Key"
3. Paste: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Click "Import"

This account has **10,000 ETH**!

---

### 4️⃣ Verify & Mint

1. **Refresh the browser** (Ctrl+Shift+R)
2. **Connect wallet** (top right button)
3. **Check the bottom right corner** - you should see a green "✅ Connected" badge
4. Go to **"Mint NFT"** page
5. Fill the form and click **"Mint NFT"**

---

## 🎯 Visual Checklist

Your MetaMask should look like this:

```
┌─────────────────────────┐
│  Localhost 8545     ▼   │ ← MUST say this!
├─────────────────────────┤
│  Account 1              │
│  0xf39F...2266          │
│  9,999.99 ETH           │ ← Should have ~10,000 ETH
└─────────────────────────┘
```

Your app should show:

```
Bottom right corner:
┌──────────────────────┐
│ ✅ Connected         │ ← Green badge
│ Chain ID: 31337      │
└──────────────────────┘
```

---

## ⚠️ Common Mistakes

### Mistake #1: Wrong Network
**Problem**: MetaMask shows "Ethereum Mainnet"
**Fix**: Switch to "Localhost 8545"

### Mistake #2: No Test Account
**Problem**: Account has 0 ETH
**Fix**: Import the test account (Step 3)

### Mistake #3: Hardhat Not Running
**Problem**: Can't connect even on correct network
**Fix**: 
```bash
npx hardhat node
```

---

## 🔍 How to Verify It's Working

### Test 1: Check Browser Console
1. Press **F12**
2. Go to **Console** tab
3. You should see:
   ```
   Getting contract addresses for chainId: 31337
   Using localhost contracts: { nftContract: '0x5Fb...', ... }
   ```

### Test 2: Check Network Badge
- Look at **bottom right corner** of the app
- Should show **green "✅ Connected"** badge
- Should show **"Chain ID: 31337"**

### Test 3: Try Minting
- Go to "Mint NFT" page
- If the form is enabled and you can fill it, you're good!
- If you see "Wrong Network" warning, switch networks

---

## 🆘 Still Not Working?

### Complete Reset:

```bash
# Terminal 1: Restart Hardhat
pkill -f "hardhat node"
npx hardhat node

# Terminal 2: Redeploy
cd nft-marketplace-royalty
npm run deploy:local
npm run copy-abis

# Terminal 3: Restart Frontend
cd frontend
npm run dev
```

Then:
1. **Close MetaMask completely**
2. **Reopen MetaMask**
3. **Switch to "Localhost 8545"**
4. **Hard refresh browser**: Ctrl+Shift+R
5. **Connect wallet**
6. **Try minting**

---

## 📞 Debug Commands

```bash
# Check if Hardhat is running
lsof -i :8545

# Check if contracts are deployed
cat deployment.json

# Run full diagnostic
npm run check

# Check frontend is running
curl http://localhost:3000
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ MetaMask shows "Localhost 8545"
2. ✅ Bottom right shows green "Connected" badge
3. ✅ Browser console shows "chainId: 31337"
4. ✅ Account has ~10,000 ETH
5. ✅ Mint form is enabled
6. ✅ No error messages

---

## 🎉 Once It Works

After fixing the network:

1. Go to "Mint NFT"
2. Fill in:
   - Name: "My First NFT"
   - Description: "Test"
   - Upload image
   - Royalty: 5
3. Click "Mint NFT"
4. Approve in MetaMask
5. Wait 2 seconds
6. Success! 🎨

---

**The #1 issue is always the network. Make sure MetaMask says "Localhost 8545"!**

Need more help? Check **MINT_NFT_GUIDE.md** for detailed instructions.
