import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { TWalletBalanceMap } from "../@types/observer";
import { WalletObserver } from "./WalletObserver.class";

/**
 * A custom Map instance that describes a list of assets and their metadata,
 * including the asset's wallet balance. It also includes associated helper methods
 * for convenience when querying against the map.
 *
 * @template AssetMetadata - Type extending IAssetAmountMetadata.
 * @extends {Map<string, AssetAmount<AssetMetadata>>}
 */
export class WalletBalanceMap<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> extends Map<string, AssetAmount<AssetMetadata>> {
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
   * and return them as a subset.
   *
   * @returns {TWalletBalanceMap<AssetMetadata>} A map of fungible tokens.
   */
  getFungibleTokens = (): TWalletBalanceMap<AssetMetadata> => {
    const map: TWalletBalanceMap<AssetMetadata> = new Map();
    [...this.values()].forEach((asset) => {
      if (asset.decimals > 0) {
        map.set(asset.metadata.assetId, asset);
      }
    });

    return map;
  };

  /**
   * Get only Handle NFTs from the wallet balance map
   * and return them as a subset.
   *
   * @returns {TWalletBalanceMap<AssetMetadata>} A map of handles.
   */
  getHandles = (): TWalletBalanceMap<AssetMetadata> => {
    const map: TWalletBalanceMap<AssetMetadata> = new Map();
    [...this.values()].forEach((asset) => {
      const isHandle = this._handlePolicyIds[this._observer.network].some(
        (policyId) => asset.metadata.assetId.includes(policyId)
      );

      if (isHandle) {
        map.set(asset.metadata.assetId, asset);
      }
    });

    return map;
  };

  /**
   * Get only non-fungible tokens (NFTs) from the wallet balance map
   * and return them as a subset.
   *
   * @returns {TWalletBalanceMap<AssetMetadata>} A map of non-fungible tokens.
   */
  getNonFungibleTokens = (): TWalletBalanceMap<AssetMetadata> => {
    const map: TWalletBalanceMap<AssetMetadata> = new Map();
    [...this.values()].forEach((asset) => {
      if (asset.metadata.decimals === 0 && asset.amount === 1n) {
        map.set(asset.metadata.assetId, asset);
      }
    });

    return map;
  };

  /**
   * Alias for getNonFungibleTokens.
   *
   * @returns {TWalletBalanceMap<AssetMetadata>} A map of non-fungible tokens.
   */
  getNFTs = this.getNonFungibleTokens;
}
