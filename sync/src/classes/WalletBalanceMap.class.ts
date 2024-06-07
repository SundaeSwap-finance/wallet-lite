import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { TWalletBalanceMap } from "../@types/observer";
import { WalletObserver } from "./WalletObserver.class";

export class WalletBalanceMap<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> extends Map<string, AssetAmount<AssetMetadata>> {
  private _handlePolicyIds: Record<number, string[]> = {
    0: ["8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3"],
    1: ["f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a"],
  };

  constructor(private _observer: WalletObserver) {
    super();
  }

  getFungibleTokens = () => {
    const list = [...this.values()].filter(({ amount }) => amount > 1n);
    const map: TWalletBalanceMap<AssetMetadata> = new Map();
    list.forEach((val) => map.set(val.metadata.assetId, val));
    return map;
  };

  getHandles = () => {
    const list = [...this.values()].filter(({ metadata }) =>
      this._handlePolicyIds[this._observer.network].some((policyId) =>
        metadata.assetId.includes(policyId)
      )
    );
    const map: TWalletBalanceMap<AssetMetadata> = new Map();
    list.forEach((val) => map.set(val.metadata.assetId, val));
    return map;
  };

  getNonFungibleTokens = () => {
    const list = [...this.values()].filter(
      ({ metadata, amount }) => metadata.decimals === 0 && amount === 1n
    );
    const map: TWalletBalanceMap<AssetMetadata> = new Map();
    list.forEach((val) => map.set(val.metadata.assetId, val));
    return map;
  };
  getNFTs = this.getNonFungibleTokens;
}
