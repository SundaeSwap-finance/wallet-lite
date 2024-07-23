import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { TAssetAmountMap } from "../@types/observer.js";
import { WalletAssetMap } from "./WalletAssetMap.class.js";
import { WalletObserver } from "./WalletObserver.class.js";

/**
 * A custom Map instance that describes a list of assets and their metadata,
 * including the asset's wallet balance. It also includes associated helper methods
 * for convenience when querying against the map.
 *
 * @template AssetMetadata - Type extending IAssetAmountMetadata.
 * @extends {WalletAssetMap<AssetMetadata>}
 */
export class WalletBalanceMap<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> extends WalletAssetMap<AssetMetadata> {
  /**
   * @private
   * @type {Record<number, string[]>}
   * @description Handle policy IDs mapped by network number. We use this
   * manually since the SDK includes the necessity of an instance and we
   * don't really need all the extra stuff yet.
   */
  private _handlePolicyIds: Record<number, string[]> = {
    0: ["8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3"],
    1: ["f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a"],
  };

  /**
   * Creates an instance of WalletBalanceMap.
   * @param {WalletObserver} _observer - An instance of the associated WalletObserver.
   */
  constructor(private _observer: WalletObserver) {
    super();
  }

  /**
   * Get only fungible assets from the wallet balance map
   * and return them as a subset Map.
   *
   * @returns {TAssetAmountMap<AssetMetadata>} A map of fungible tokens.
   */
  getFungibleTokens = (): TAssetAmountMap<AssetMetadata> => {
    const map: TAssetAmountMap<AssetMetadata> = new WalletAssetMap();
    [...this.entries()].forEach(([key, asset]) => {
      if (asset.metadata.decimals > 0) {
        map.set(key, asset);
      }
    });

    return map;
  };

  /**
   * Get only Handle NFTs from the wallet balance map
   * and return them as a subset Map.
   *
   * @returns {TAssetAmountMap<AssetMetadata>} A map of handle assets.
   */
  getHandles = (): TAssetAmountMap<AssetMetadata> => {
    const map: TAssetAmountMap<AssetMetadata> = new WalletAssetMap();
    [...this.entries()].forEach(([key, asset]) => {
      const isHandle = this._handlePolicyIds[this._observer.network].some(
        (policyId) => asset.metadata.assetId.includes(policyId),
      );

      if (isHandle) {
        map.set(key, asset);
      }
    });

    return map;
  };

  /**
   * Get only non-fungible tokens (NFTs) from the wallet balance map
   * and return them as a subset.
   *
   * @param {boolean} [withHandles] - Optional parameter to include Handles. Defaults to false.
   * @returns {TAssetAmountMap<AssetMetadata>} A map of non-fungible tokens.
   */
  getNonFungibleTokens = (
    withHandles?: boolean,
  ): TAssetAmountMap<AssetMetadata> => {
    const map: TAssetAmountMap<AssetMetadata> = new WalletAssetMap();
    [...this.entries()].forEach(([key, asset]) => {
      if (
        !withHandles &&
        this._handlePolicyIds[this._observer.network].some((policyId) =>
          asset.metadata.assetId.includes(policyId),
        )
      ) {
        return;
      }

      if (asset.metadata.decimals === 0 && asset.amount === 1n) {
        map.set(key, asset);
      }
    });

    return map;
  };

  /**
   * Alias for getNonFungibleTokens.
   *
   * @param {boolean} [withHandles] - Optional parameter to include Handles. Defaults to false.
   * @returns {TAssetAmountMap<AssetMetadata>} A map of non-fungible tokens.
   */
  getNFTs = (withHandles?: boolean): TAssetAmountMap<AssetMetadata> =>
    this.getNonFungibleTokens(withHandles);
}
