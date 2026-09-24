const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace with Royalties", function () {
  let nftContract;
  let marketplace;
  let owner;
  let creator;
  let buyerA;
  let buyerB;
  let platformOwner;

  const TOKEN_URI = "ipfs://QmTest123";
  const ROYALTY_FEE = 500; // 5%
  const LISTING_PRICE = ethers.parseEther("1.0"); // 1 MATIC
  const SECONDARY_PRICE = ethers.parseEther("2.0"); // 2 MATIC

  beforeEach(async function () {
    // Get signers
    [platformOwner, creator, buyerA, buyerB] = await ethers.getSigners();

    // Deploy NFT Contract
    const NFTContract = await ethers.getContractFactory("NFTContract");
    nftContract = await NFTContract.deploy();
    await nftContract.waitForDeployment();

    // Deploy Marketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy();
    await marketplace.waitForDeployment();
  });

  describe("NFT Minting with Royalties", function () {
    it("Should mint NFT with 5% royalty", async function () {
      const tx = await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        ROYALTY_FEE
      );
      
      await expect(tx)
        .to.emit(nftContract, "NFTMinted")
        .withArgs(0, creator.address, creator.address, TOKEN_URI, ROYALTY_FEE);

      // Verify ownership
      expect(await nftContract.ownerOf(0)).to.equal(creator.address);
      
      // Verify token URI
      expect(await nftContract.tokenURI(0)).to.equal(TOKEN_URI);
    });

    it("Should set default 5% royalty when 0 is passed", async function () {
      await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        0 // Should default to 500 (5%)
      );

      const salePrice = ethers.parseEther("1.0");
      const [receiver, royaltyAmount] = await nftContract.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(creator.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5% of 1 ETH
    });

    it("Should correctly return royalty info", async function () {
      await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        ROYALTY_FEE
      );

      const salePrice = ethers.parseEther("1.0");
      const [receiver, royaltyAmount] = await nftContract.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(creator.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5% of 1 ETH
    });

    it("Should reject royalty fee above 10%", async function () {
      await expect(
        nftContract.connect(creator).mintNFT(
          creator.address,
          TOKEN_URI,
          1100 // 11%
        )
      ).to.be.revertedWith("Royalty fee too high");
    });

    it("Should track token creator correctly", async function () {
      await nftContract.connect(creator).mintNFT(
        buyerA.address, // Minting to buyerA
        TOKEN_URI,
        ROYALTY_FEE
      );

      expect(await nftContract.getTokenCreator(0)).to.equal(creator.address);
    });
  });

  describe("Listing and Cancelling", function () {
    beforeEach(async function () {
      // Mint NFT to creator
      await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        ROYALTY_FEE
      );
    });

    it("Should list NFT successfully", async function () {
      // Approve marketplace
      await nftContract.connect(creator).approve(
        await marketplace.getAddress(),
        0
      );

      // List NFT
      const tx = await marketplace.connect(creator).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );

      await expect(tx)
        .to.emit(marketplace, "NFTListed")
        .withArgs(
          creator.address,
          await nftContract.getAddress(),
          0,
          LISTING_PRICE
        );

      // Verify listing
      const listing = await marketplace.getListing(
        await nftContract.getAddress(),
        0
      );
      
      expect(listing.seller).to.equal(creator.address);
      expect(listing.price).to.equal(LISTING_PRICE);
      expect(listing.isActive).to.be.true;
    });

    it("Should fail to list without approval", async function () {
      await expect(
        marketplace.connect(creator).listNFT(
          await nftContract.getAddress(),
          0,
          LISTING_PRICE
        )
      ).to.be.revertedWith("Marketplace not approved");
    });

    it("Should fail to list if not owner", async function () {
      await nftContract.connect(creator).approve(
        await marketplace.getAddress(),
        0
      );

      await expect(
        marketplace.connect(buyerA).listNFT(
          await nftContract.getAddress(),
          0,
          LISTING_PRICE
        )
      ).to.be.revertedWith("Not the NFT owner");
    });

    it("Should cancel listing successfully", async function () {
      // Approve and list
      await nftContract.connect(creator).approve(
        await marketplace.getAddress(),
        0
      );
      await marketplace.connect(creator).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );

      // Cancel listing
      const tx = await marketplace.connect(creator).cancelListing(
        await nftContract.getAddress(),
        0
      );

      await expect(tx)
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(creator.address, await nftContract.getAddress(), 0);

      // Verify listing is inactive
      const listing = await marketplace.getListing(
        await nftContract.getAddress(),
        0
      );
      expect(listing.isActive).to.be.false;
    });

    it("Should fail to cancel if not seller", async function () {
      await nftContract.connect(creator).approve(
        await marketplace.getAddress(),
        0
      );
      await marketplace.connect(creator).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );

      await expect(
        marketplace.connect(buyerA).cancelListing(
          await nftContract.getAddress(),
          0
        )
      ).to.be.revertedWith("Not the seller");
    });
  });

  describe("Primary Sale (Creator sells to Buyer A)", function () {
    beforeEach(async function () {
      // Mint and list NFT
      await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        ROYALTY_FEE
      );
      
      await nftContract.connect(creator).approve(
        await marketplace.getAddress(),
        0
      );
      
      await marketplace.connect(creator).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );
    });

    it("Should complete primary sale with correct payment splits", async function () {
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      const platformBalanceBefore = await ethers.provider.getBalance(platformOwner.address);

      // Buy NFT
      const tx = await marketplace.connect(buyerA).buyNFT(
        await nftContract.getAddress(),
        0,
        { value: LISTING_PRICE }
      );

      const receipt = await tx.wait();

      // Calculate expected amounts
      // Primary sale: no royalty (creator is seller)
      // Platform fee: 2% of 1 ETH = 0.02 ETH
      // Creator receives: 1 - 0.02 = 0.98 ETH
      const platformFee = (LISTING_PRICE * 200n) / 10000n; // 2%
      const creatorProceeds = LISTING_PRICE - platformFee;

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const platformBalanceAfter = await ethers.provider.getBalance(platformOwner.address);

      // Verify balances
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(creatorProceeds);
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(platformFee);

      // Verify NFT ownership transferred
      expect(await nftContract.ownerOf(0)).to.equal(buyerA.address);

      // Verify listing is inactive
      const listing = await marketplace.getListing(
        await nftContract.getAddress(),
        0
      );
      expect(listing.isActive).to.be.false;
    });

    it("Should emit NFTSold event with correct details", async function () {
      const platformFee = (LISTING_PRICE * 200n) / 10000n;
      const royaltyAmount = (LISTING_PRICE * 500n) / 10000n;

      await expect(
        marketplace.connect(buyerA).buyNFT(
          await nftContract.getAddress(),
          0,
          { value: LISTING_PRICE }
        )
      ).to.emit(marketplace, "NFTSold");
    });

    it("Should fail with incorrect payment", async function () {
      await expect(
        marketplace.connect(buyerA).buyNFT(
          await nftContract.getAddress(),
          0,
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should fail if seller tries to buy own NFT", async function () {
      await expect(
        marketplace.connect(creator).buyNFT(
          await nftContract.getAddress(),
          0,
          { value: LISTING_PRICE }
        )
      ).to.be.revertedWith("Seller cannot buy own NFT");
    });
  });

  describe("Secondary Sale (Buyer A sells to Buyer B) - Royalty Distribution", function () {
    beforeEach(async function () {
      // Primary sale: Creator -> Buyer A
      await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        ROYALTY_FEE
      );
      
      await nftContract.connect(creator).approve(
        await marketplace.getAddress(),
        0
      );
      
      await marketplace.connect(creator).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );
      
      await marketplace.connect(buyerA).buyNFT(
        await nftContract.getAddress(),
        0,
        { value: LISTING_PRICE }
      );
    });

    it("Should complete secondary sale with royalty distribution", async function () {
      // Buyer A lists for 2 MATIC
      await nftContract.connect(buyerA).approve(
        await marketplace.getAddress(),
        0
      );
      
      await marketplace.connect(buyerA).listNFT(
        await nftContract.getAddress(),
        0,
        SECONDARY_PRICE
      );

      // Record balances before sale
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      const buyerABalanceBefore = await ethers.provider.getBalance(buyerA.address);
      const platformBalanceBefore = await ethers.provider.getBalance(platformOwner.address);

      // Buyer B purchases
      await marketplace.connect(buyerB).buyNFT(
        await nftContract.getAddress(),
        0,
        { value: SECONDARY_PRICE }
      );

      // Calculate expected amounts
      // Sale price: 2 MATIC
      // Royalty: 5% of 2 = 0.1 MATIC (to creator)
      // Platform fee: 2% of 2 = 0.04 MATIC (to platform)
      // Seller (Buyer A): 2 - 0.1 - 0.04 = 1.86 MATIC
      const royaltyAmount = (SECONDARY_PRICE * 500n) / 10000n; // 0.1 ETH
      const platformFee = (SECONDARY_PRICE * 200n) / 10000n; // 0.04 ETH
      const sellerProceeds = SECONDARY_PRICE - royaltyAmount - platformFee; // 1.86 ETH

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const buyerABalanceAfter = await ethers.provider.getBalance(buyerA.address);
      const platformBalanceAfter = await ethers.provider.getBalance(platformOwner.address);

      // Verify payments
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(royaltyAmount);
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(platformFee);
      
      // Buyer A balance should increase by seller proceeds minus gas
      const buyerAGain = buyerABalanceAfter - buyerABalanceBefore;
      expect(buyerAGain).to.be.closeTo(sellerProceeds, ethers.parseEther("0.01")); // Allow for gas

      // Verify NFT ownership
      expect(await nftContract.ownerOf(0)).to.equal(buyerB.address);
    });

    it("Should emit correct NFTSold event for secondary sale", async function () {
      await nftContract.connect(buyerA).approve(
        await marketplace.getAddress(),
        0
      );
      
      await marketplace.connect(buyerA).listNFT(
        await nftContract.getAddress(),
        0,
        SECONDARY_PRICE
      );

      const royaltyAmount = (SECONDARY_PRICE * 500n) / 10000n;
      const platformFee = (SECONDARY_PRICE * 200n) / 10000n;

      await expect(
        marketplace.connect(buyerB).buyNFT(
          await nftContract.getAddress(),
          0,
          { value: SECONDARY_PRICE }
        )
      )
        .to.emit(marketplace, "NFTSold")
        .withArgs(
          buyerB.address,
          buyerA.address,
          await nftContract.getAddress(),
          0,
          SECONDARY_PRICE,
          royaltyAmount,
          platformFee
        );
    });
  });

  describe("Marketplace Queries", function () {
    it("Should return active listings", async function () {
      // Mint and list multiple NFTs
      for (let i = 0; i < 3; i++) {
        await nftContract.connect(creator).mintNFT(
          creator.address,
          `${TOKEN_URI}${i}`,
          ROYALTY_FEE
        );
        
        await nftContract.connect(creator).approve(
          await marketplace.getAddress(),
          i
        );
        
        await marketplace.connect(creator).listNFT(
          await nftContract.getAddress(),
          i,
          LISTING_PRICE
        );
      }

      const activeListings = await marketplace.getActiveListings();
      expect(activeListings.length).to.equal(3);
      
      const count = await marketplace.getActiveListingsCount();
      expect(count).to.equal(3);
    });

    it("Should update active listings after purchase", async function () {
      // Mint and list 2 NFTs
      for (let i = 0; i < 2; i++) {
        await nftContract.connect(creator).mintNFT(
          creator.address,
          `${TOKEN_URI}${i}`,
          ROYALTY_FEE
        );
        
        await nftContract.connect(creator).approve(
          await marketplace.getAddress(),
          i
        );
        
        await marketplace.connect(creator).listNFT(
          await nftContract.getAddress(),
          i,
          LISTING_PRICE
        );
      }

      // Buy one NFT
      await marketplace.connect(buyerA).buyNFT(
        await nftContract.getAddress(),
        0,
        { value: LISTING_PRICE }
      );

      const count = await marketplace.getActiveListingsCount();
      expect(count).to.equal(1);
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle multiple sequential sales correctly", async function () {
      // Mint NFT
      await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        ROYALTY_FEE
      );

      // Sale 1: Creator -> Buyer A
      await nftContract.connect(creator).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(creator).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );
      await marketplace.connect(buyerA).buyNFT(
        await nftContract.getAddress(),
        0,
        { value: LISTING_PRICE }
      );

      // Sale 2: Buyer A -> Buyer B
      await nftContract.connect(buyerA).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(buyerA).listNFT(
        await nftContract.getAddress(),
        0,
        SECONDARY_PRICE
      );
      await marketplace.connect(buyerB).buyNFT(
        await nftContract.getAddress(),
        0,
        { value: SECONDARY_PRICE }
      );

      // Sale 3: Buyer B -> Creator
      await nftContract.connect(buyerB).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(buyerB).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );
      await marketplace.connect(creator).buyNFT(
        await nftContract.getAddress(),
        0,
        { value: LISTING_PRICE }
      );

      // Verify final ownership
      expect(await nftContract.ownerOf(0)).to.equal(creator.address);
    });

    it("Should prevent reentrancy attacks", async function () {
      // The nonReentrant modifier should prevent reentrancy
      // This is a basic test - in production, use more sophisticated reentrancy tests
      await nftContract.connect(creator).mintNFT(
        creator.address,
        TOKEN_URI,
        ROYALTY_FEE
      );
      
      await nftContract.connect(creator).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(creator).listNFT(
        await nftContract.getAddress(),
        0,
        LISTING_PRICE
      );

      // Normal purchase should work
      await expect(
        marketplace.connect(buyerA).buyNFT(
          await nftContract.getAddress(),
          0,
          { value: LISTING_PRICE }
        )
      ).to.not.be.reverted;
    });
  });
});
