import type { Cip30Wallet } from "@cardano-sdk/dapp-connector";
import type { DAppPeerConnect } from "@fabianbormann/cardano-peer-connect";
import type { DAppPeerConnectParameters } from "@fabianbormann/cardano-peer-connect/dist/src/types";
import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { WalletBalanceMap } from "../classes/WalletBalanceMap.class";
declare global {
  interface Window {
    cardano?: {
      [k in TSupportWalletExtensions]?: Cip30Wallet;
    };
  }
}

/**
 * The metadata resolver should return a map composed of
 * the asset ID as the key, and the metadata as the value.
 */
export type TMetadataResolverFunc<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = (assetIds: string[]) => Promise<Map<string, T>>;

/**
 * Options that are passed to the WalletObserver instance.
 */
export interface IWalletObserverOptions<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  metadataResolver: TMetadataResolverFunc<AssetMetadata>;
  persistence: boolean;
  peerConnectArgs?: DAppPeerConnectParameters;
}

/**
 * A list of support CIP-30 wallet extensions in the browser.
 */
export type TSupportWalletExtensions =
  | "eternl"
  | "lace"
  | "typhon"
  | "sorbet"
  | "flint"
  | "nami";

/**
 * Interface describing all assets within a wallet.
 */
export type TWalletBalanceMap<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = Map<string, AssetAmount<T>>;

/**
 * Interface describing the structure of the persistent
 * data located in local storage.
 */
export interface IWalletObserverSeed {
  activeWallet: TSupportWalletExtensions;
}

/**
 * The return type for the WalletObserver.getCip45Instance
 * method.
 */
export type TGetPeerConnectInstance = () => {
  name: string;
  icon: string | null;
  instance: DAppPeerConnect;
};

export interface IWalletObserverSync<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  balanceMap: WalletBalanceMap<AssetMetadata>;
  usedAddresses: string[];
  unusedAddresses: string[];
  network: 0 | 1;
}
