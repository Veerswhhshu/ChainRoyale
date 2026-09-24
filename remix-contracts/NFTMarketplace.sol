// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @dev Marketplace contract for buying and selling NFTs with automatic royalty distribution
 * @notice Supports EIP-2981 royalty standard and charges a 2% platform fee
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    // Platform fee: 2% (200 basis points out of 10000)
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 200;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Struct to store listing information
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }
    
    // Mapping from (nftContract, tokenId) to Listing
    mapping(address => mapping(uint256 => Listing)) private _listings;
    
    // Array to track all active listings for enumeration
    Listing[] private _activeListings;
    mapping(address => mapping(uint256 => uint256)) private _listingIndex;
    
    // Events
    event NFTListed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event NFTSold(
        address indexed buyer,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 royaltyAmount,
        uint256 platformFee
    );
    
    event ListingCancelled(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Lists an NFT for sale
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Listing price in wei
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(nftContract != address(0), "Invalid NFT contract");
        require(price > 0, "Price must be greater than zero");
        
        IERC721 nft = IERC721(nftContract);
        
        // Verify caller owns the NFT
        require(nft.ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        
        // Verify marketplace is approved
        require(
            nft.getApproved(tokenId) == address(this) || 
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        
        // Check if already listed
        require(!_listings[nftContract][tokenId].isActive, "Already listed");
        
        // Create listing
        _listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isActive: true
        });
        
        // Add to active listings array
        _listingIndex[nftContract][tokenId] = _activeListings.length;
        _activeListings.push(_listings[nftContract][tokenId]);
        
        emit NFTListed(msg.sender, nftContract, tokenId, price);
    }

    /**
     * @dev Cancels an active listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to cancel
     */
    function cancelListing(address nftContract, uint256 tokenId) external nonReentrant {
        Listing storage listing = _listings[nftContract][tokenId];
        
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        // Mark as inactive
        listing.isActive = false;
        
        // Remove from active listings array
        _removeFromActiveListings(nftContract, tokenId);
        
        emit ListingCancelled(msg.sender, nftContract, tokenId);
    }

    /**
     * @dev Buys an NFT from the marketplace
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to buy
     */
    function buyNFT(address nftContract, uint256 tokenId) 
        external 
        payable 
        nonReentrant 
    {
        Listing storage listing = _listings[nftContract][tokenId];
        
        require(listing.isActive, "Listing not active");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Seller cannot buy own NFT");
        
        address seller = listing.seller;
        uint256 salePrice = listing.price;
        
        // Mark listing as inactive before transfers (CEI pattern)
        listing.isActive = false;
        
        // Remove from active listings
        _removeFromActiveListings(nftContract, tokenId);
        
        // Calculate fees and payments
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        
        // Check if contract supports EIP-2981
        if (_supportsERC2981(nftContract)) {
            (royaltyReceiver, royaltyAmount) = IERC2981(nftContract).royaltyInfo(
                tokenId,
                salePrice
            );
        }
        
        // Calculate platform fee (2%)
        uint256 platformFee = (salePrice * PLATFORM_FEE_PERCENTAGE) / FEE_DENOMINATOR;
        
        // Calculate seller proceeds
        uint256 sellerProceeds = salePrice - royaltyAmount - platformFee;
        
        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);
        
        // Distribute payments
        // 1. Pay royalty to creator (if applicable)
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(royaltySuccess, "Royalty payment failed");
        }
        
        // 2. Pay platform fee to contract owner
        (bool feeSuccess, ) = payable(owner()).call{value: platformFee}("");
        require(feeSuccess, "Platform fee payment failed");
        
        // 3. Pay remaining amount to seller
        (bool sellerSuccess, ) = payable(seller).call{value: sellerProceeds}("");
        require(sellerSuccess, "Seller payment failed");
        
        emit NFTSold(
            msg.sender,
            seller,
            nftContract,
            tokenId,
            salePrice,
            royaltyAmount,
            platformFee
        );
    }

    /**
     * @dev Returns listing information
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to query
     * @return Listing struct
     */
    function getListing(address nftContract, uint256 tokenId) 
        external 
        view 
        returns (Listing memory) 
    {
        return _listings[nftContract][tokenId];
    }

    /**
     * @dev Returns all active listings
     * @return Array of active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        // Count active listings
        uint256 activeCount = 0;
        for (uint256 i = 0; i < _activeListings.length; i++) {
            if (_activeListings[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < _activeListings.length; i++) {
            if (_activeListings[i].isActive) {
                activeListings[currentIndex] = _activeListings[i];
                currentIndex++;
            }
        }
        
        return activeListings;
    }

    /**
     * @dev Returns the number of active listings
     * @return Count of active listings
     */
    function getActiveListingsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _activeListings.length; i++) {
            if (_activeListings[i].isActive) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Internal function to check if contract supports ERC2981
     * @param nftContract Address to check
     * @return bool indicating support
     */
    function _supportsERC2981(address nftContract) private view returns (bool) {
        try IERC165(nftContract).supportsInterface(type(IERC2981).interfaceId) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    /**
     * @dev Internal function to remove listing from active array
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     */
    function _removeFromActiveListings(address nftContract, uint256 tokenId) private {
        uint256 index = _listingIndex[nftContract][tokenId];
        if (index < _activeListings.length && 
            _activeListings[index].nftContract == nftContract && 
            _activeListings[index].tokenId == tokenId) {
            _activeListings[index].isActive = false;
        }
    }

    /**
     * @dev Allows contract to receive NFTs
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}