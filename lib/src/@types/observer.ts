import type { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
import type { DAppPeerConnect } from "@fabianbormann/cardano-peer-connect";
import type { DAppPeerConnectParameters } from "@fabianbormann/cardano-peer-connect/dist/src/types.js";
import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { WalletBalanceMap } from "../classes/WalletBalanceMap.class.js";

/**
 * A list of support CIP-30 wallet extensions in the browser.
 */
export type TSupportedWalletExtensions =
  | "nami"
  | "eternl"
  | "typhoncip30"
  | "ccvault"
  | "typhon"
  | "yoroi"
  | "flint"
  | "gerowallet"
  | "cardwallet"
  | "nufi"
  | "begin"
  | "lace"
  | "sorbet";

/**
 * Interface to describe window extension.
 */
export interface IWindowCip30Extension {
  apiVersion: string;
  enable: () => Promise<Cip30WalletApi>;
  icon: string;
  isEnabled: () => Promise<boolean>;
  name: TSupportedWalletExtensions;
}

/**
 * Interface to describe our expected window configuration.
 */
export type TWindowCardano = {
  [K in TSupportedWalletExtensions]?: IWindowCip30Extension;
};

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
export interface IResolvedWalletObserverOptions<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  metadataResolver: TMetadataResolverFunc<AssetMetadata>;
  persistence: boolean;
  peerConnectArgs: DAppPeerConnectParameters;
  connectTimeout: number;
}

/**
 * Options that are passed to the WalletObserver instance.
 */
export type TWalletObserverOptions<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> = Partial<IResolvedWalletObserverOptions<AssetMetadata>>;

/**
 * Interface describing the Map type of an asset.
 */
export type TAssetAmountMap<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = Map<string, AssetAmount<T>>;

/**
 * Interface describing the structure of the persistent
 * data located in local storage.
 */
export interface IWalletObserverSeed {
  activeWallet: TSupportedWalletExtensions;
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
  network: number;
}
