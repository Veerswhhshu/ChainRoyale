/**
 * Utility functions for handling NFT metadata and images
 * For production, integrate with IPFS services like Pinata or NFT.Storage
 */

/**
 * Convert file to base64 data URI
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 data URI
 */
export async function fileToDataURI(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create NFT metadata JSON
 * @param {string} name - NFT name
 * @param {string} description - NFT description
 * @param {string} imageURI - Image URI (data URI or IPFS)
 * @returns {object} Metadata object
 */
export function createMetadata(name, description, imageURI) {
  return {
    name,
    description,
    image: imageURI,
    attributes: [],
  };
}

/**
 * Convert metadata object to data URI
 * @param {object} metadata - Metadata object
 * @returns {string} Data URI
 */
export function metadataToDataURI(metadata) {
  const json = JSON.stringify(metadata);
  return `data:application/json;base64,${btoa(json)}`;
}

/**
 * Upload to IPFS (placeholder for actual implementation)
 * In production, integrate with Pinata, NFT.Storage, or Web3.Storage
 * @param {File} file - File to upload
 * @returns {Promise<string>} IPFS URI
 */
export async function uploadToIPFS(file) {
  // TODO: Implement actual IPFS upload
  // For now, return data URI as fallback
  console.log('IPFS upload not implemented, using data URI');
  return await fileToDataURI(file);
}

/**
 * Upload metadata to IPFS (placeholder)
 * @param {object} metadata - Metadata object
 * @returns {Promise<string>} IPFS URI
 */
export async function uploadMetadataToIPFS(metadata) {
  // TODO: Implement actual IPFS upload
  // For now, return data URI as fallback
  console.log('IPFS metadata upload not implemented, using data URI');
  return metadataToDataURI(metadata);
}
