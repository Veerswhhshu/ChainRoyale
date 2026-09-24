// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTContract
 * @dev ERC721 NFT contract with EIP-2981 royalty support
 * @notice This contract allows minting NFTs with customizable royalty percentages
 */
contract NFTContract is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) private _tokenCreators;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed to,
        string tokenURI,
        uint96 royaltyFeeNumerator
    );

    constructor() ERC721("NFT Marketplace Collection", "NFTM") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    /**
     * @dev Mints a new NFT with royalty information
     * @param to Address to mint the NFT to
     * @param tokenURI Metadata URI for the NFT
     * @param royaltyFeeNumerator Royalty fee in basis points (e.g., 500 = 5%)
     * @return tokenId The ID of the newly minted token
     */
    function mintNFT(
        address to,
        string memory tokenURI,
        uint96 royaltyFeeNumerator
    ) public returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
        // If royaltyFeeNumerator is 0, default to 5% (500 basis points)
        if (royaltyFeeNumerator == 0) {
            royaltyFeeNumerator = 500;
        }
        
        // Ensure royalty doesn't exceed 10% (1000 basis points)
        require(royaltyFeeNumerator <= 1000, "Royalty fee too high");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Set royalty info - creator (msg.sender) receives royalties
        _setTokenRoyalty(tokenId, msg.sender, royaltyFeeNumerator);
        
        // Store creator address
        _tokenCreators[tokenId] = msg.sender;
        
        emit NFTMinted(tokenId, msg.sender, to, tokenURI, royaltyFeeNumerator);
        
        return tokenId;
    }

    /**
     * @dev Simplified mint function for testing in Remix
     * @param tokenURI Metadata URI for the NFT
     * @return tokenId The ID of the newly minted token
     */
    function simpleMint(string memory tokenURI) public returns (uint256) {
        return mintNFT(msg.sender, tokenURI, 500); // 5% royalty
    }

    /**
     * @dev Returns the creator of a token
     * @param tokenId The token ID to query
     * @return The address of the token creator
     */
    function getTokenCreator(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenCreators[tokenId];
    }

    /**
     * @dev Returns the current token counter value
     * @return The next token ID that will be minted
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     * @notice Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override to prevent accidental token burning with royalty info
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // If burning (to == address(0)), reset royalty
        if (to == address(0)) {
            _resetTokenRoyalty(tokenId);
        }
        
        return super._update(to, tokenId, auth);
    }
}