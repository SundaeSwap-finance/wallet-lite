import type { Cip30Wallet } from "@cardano-sdk/dapp-connector";
import type { DAppPeerConnect } from "@fabianbormann/cardano-peer-connect";
import type { DAppPeerConnectParameters } from "@fabianbormann/cardano-peer-connect/dist/src/types";
import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

declare global {
  interface Window {
    cardano?: {
      [k in TSupportWalletExtensions]?: Cip30Wallet;
    };
  }
}

export type TMetadataResolverFunc<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = (assetIds: string[]) => Promise<Map<string, T>>;

export interface IWalletObserverOptions<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  metadataResolver: TMetadataResolverFunc<AssetMetadata>;
  persistence: boolean;
  peerConnectArgs?: DAppPeerConnectParameters & { qrCodeTarget: string };
}

export type TSupportWalletExtensions =
  | "eternl"
  | "lace"
  | "typhon"
  | "sorbet"
  | "flint"
  | "nami";

export interface IWalletExtension {
  property: TSupportWalletExtensions;
  name: string;
}

export type TWalletBalanceMap<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = Map<string, AssetAmount<T>>;

export interface IWalletObserverSeed {
  activeWallet: TSupportWalletExtensions;
}

export type TGetPeerConnectInstance = () => {
  name: string;
  icon: string | null;
  instance: DAppPeerConnect;
};
