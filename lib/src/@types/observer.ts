import type { TransactionUnspentOutput } from "@cardano-sdk/core/dist/cjs/Serialization/index.js";
import type { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
import type { DAppPeerConnect } from "@fabianbormann/cardano-peer-connect";
import type { DAppPeerConnectParameters } from "@fabianbormann/cardano-peer-connect/dist/src/types.js";
import type { IAssetAmountMetadata } from "@sundaeswap/asset";

import { ReadOnlyProvider } from "src/classes/ReadOnlyProvider.Abstract.class.js";
import { WalletAssetMap } from "../classes/WalletAssetMap.class.js";
import { WalletBalanceMap } from "../classes/WalletBalanceMap.class.js";
import { isAdaAsset, normalizeAssetIdWithDot } from "../utils/assets.js";

/**
 * Interface to describe window extension.
 */
export interface IWindowCip30Extension {
  apiVersion: string;
  enable: () => Promise<Cip30WalletApi>;
  icon: string;
  isEnabled: () => Promise<boolean>;
  name: string;
}

/**
 * Interface to describe our expected window configuration.
 */
export type TWindowCardano = {
  // eslint-disable-next-line
  [key: string]: any;
};

/**
 * Describes the function arguments for the metadata resolver.
 */
export interface IMetadataResolverFuncArgs {
  assetIds: string[];
  normalizeAssetId: typeof normalizeAssetIdWithDot;
  isAdaAsset: typeof isAdaAsset;
}

/**
 * The metadata resolver should return a map composed of
 * the asset ID as the key, and the metadata as the value.
 */
export type TMetadataResolverFunc<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = (args: IMetadataResolverFuncArgs) => Promise<Map<string, T>>;

/**
 * Options that are passed to the WalletObserver instance.
 */
export interface IResolvedWalletObserverOptions<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  metadataResolver: TMetadataResolverFunc<AssetMetadata>;
  persistence: boolean;
  peerConnectArgs: DAppPeerConnectParameters;
  connectTimeout: number;
  readOnlyProvider?: ReadOnlyProvider;
  debug: boolean;
}

/**
 * Options that are passed to the WalletObserver instance.
 */
export type TWalletObserverOptions<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> = Partial<IResolvedWalletObserverOptions<AssetMetadata>>;

/**
 * Interface describing the Map type of an asset.
 */
export type TAssetAmountMap<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = WalletAssetMap<T>;

/**
 * Interface describing the structure of the persistent
 * data located in local storage.
 */
export interface IWalletObserverSeed {
  activeWallet: string;
  mainAddress: string;
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
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  balanceMap: Error | WalletBalanceMap<AssetMetadata>;
  usedAddresses: Error | string[];
  unusedAddresses: Error | string[];
  utxos?: Error | TransactionUnspentOutput[];
  collateral?: Error | TransactionUnspentOutput[];
  network: Error | number;
  feeAddress?: Error | string;
  changeAddress?: Error | string;
}
