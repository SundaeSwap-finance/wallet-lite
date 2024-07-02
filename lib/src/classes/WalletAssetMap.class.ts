import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { normalizeAssetIdWithDot } from "../utils/assets.js";

/**
 * Map wrapper to enforce asset id normalization when setting and getting assets.
 */
export class WalletAssetMap<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> extends Map<string, AssetAmount<AssetMetadata>> {
  /**
   * Overlay to enforce asset ID normalization.
   *
   * @param {string} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @returns {AssetAmount<AssetMetadata> | undefined}
   */
  get(key: string): AssetAmount<AssetMetadata> | undefined {
    return super.get(normalizeAssetIdWithDot(key));
  }

  /**
   * Overlay to enforce asset ID normalization.
   *
   * @param {string} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @param {AssetAmount<AssetMetadata>} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @returns {this}
   */
  set(key: string, value: AssetAmount<AssetMetadata>): this {
    return super.set(normalizeAssetIdWithDot(key), value);
  }

  /**
   * Overlay to enforce asset ID normalization.
   *
   * @param {string} key Retrieve the asset ID as a HEX string (either with dot or without).
   * @returns {AssetAmount<AssetMetadata> | undefined}
   */
  has(key: string): boolean {
    return super.has(normalizeAssetIdWithDot(key));
  }
}
