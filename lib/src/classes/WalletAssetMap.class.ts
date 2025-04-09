import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { ADA_ASSET_ID } from "../constants.js";
import { normalizeAssetIdWithDot } from "../utils/assets.js";

/**
 * Map wrapper to enforce asset id normalization when setting and getting assets.
 */
export class WalletAssetMap<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> extends Map<string, AssetAmount<AssetMetadata>> {
  /**
   * Overlay to enforce asset ID normalization.
   *
   * @param {string} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @returns {AssetAmount<AssetMetadata> | undefined}
   */
  get(key: string): AssetAmount<AssetMetadata> | undefined {
    return super.get(
      this.__normalizeIfAdaAssetId(normalizeAssetIdWithDot(key)),
    );
  }

  /**
   * Overlay to enforce asset ID normalization.
   *
   * @param {string} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @param {AssetAmount<AssetMetadata>} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @returns {this}
   */
  set(key: string, value: AssetAmount<AssetMetadata>): this {
    return super.set(
      this.__normalizeIfAdaAssetId(normalizeAssetIdWithDot(key)),
      value.metadata
        ? value.withMetadata(this.__normalizeIfAdaMetadata(value.metadata))
        : value,
    );
  }

  /**
   * Overlay to enforce asset ID normalization.
   *
   * @param {string} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @returns {AssetAmount<AssetMetadata> | undefined}
   */
  has(key: string): boolean {
    return super.has(
      this.__normalizeIfAdaAssetId(normalizeAssetIdWithDot(key)),
    );
  }

  /**
   * Overlay to enforce asset ID normalization.
   *
   * @param {string} key Delete the asset ID as a HEX string (either with dot or without).
   * @returns {boolean}
   */
  delete(key: string): boolean {
    return super.delete(
      this.__normalizeIfAdaAssetId(normalizeAssetIdWithDot(key)),
    );
  }

  /**
   * Helper function to normalize asset ID if it is an ADA asset name.
   *
   * @param {string} assetId The asset ID as a HEX string (either with dot or without).
   * @returns {string}
   */
  private __normalizeIfAdaAssetId(assetId: string): string {
    const ADA_ASSET_IDS = [
      "",
      ".",
      "ada.lovelace",
      "cardano.ada",
      "616461.6c6f76656c616365",
    ];

    if (ADA_ASSET_IDS.includes(assetId)) {
      return ADA_ASSET_ID;
    }

    return assetId;
  }

  /**
   * Helper function to normalize asset's metadata if it is ADA.
   *
   * @param {AssetMetadata} metadata The asset's metadata.
   * @returns {AssetMetadata}
   */
  private __normalizeIfAdaMetadata(metadata: AssetMetadata): AssetMetadata {
    return {
      ...metadata,
      assetId: this.__normalizeIfAdaAssetId(metadata.assetId),
    };
  }
}
