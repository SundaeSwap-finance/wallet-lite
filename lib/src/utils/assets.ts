import { WalletObserver } from "../classes/WalletObserver.class.js";

/**
 * Helper function to normalize asset ID notation.
 *
 * @param {string} assetId The asset ID as a HEX string (either with dot or without).
 * @returns {string}
 */
export const normalizeAssetIdWithDot = (assetId: string): string => {
  if (assetId.includes(".") || assetId === WalletObserver.ADA_ASSET_ID) {
    return assetId;
  }

  const policyId = assetId.slice(0, 56);
  const assetName = assetId.slice(56);

  if (assetName) {
    return `${policyId}.${assetName}`;
  }

  return policyId;
};

/**
 * Helper function to internally check if an asset is ADA.
 *
 * @param {string} id The asset id.
 * @returns {boolean}
 */
export const isAdaAsset = (id: string): boolean =>
  id === WalletObserver.ADA_ASSET_ID;
