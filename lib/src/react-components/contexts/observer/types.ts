import type { TransactionUnspentOutput } from "@cardano-sdk/core/dist/cjs/Serialization/index.js";
import type { IHandle } from "@koralabs/adahandle-sdk";
import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import type {
  TSupportedWalletExtensions,
  TWalletObserverOptions,
} from "../../../@types/observer.js";
import { WalletBalanceMap } from "../../../classes/WalletBalanceMap.class.js";
import type { WalletObserver } from "../../../classes/WalletObserver.class.js";

/**
 * Available hooks to apply at various events.
 */
export type TWalletProviderHooks = {
  onSyncWalletStart?: () => void;
  onSyncWalletEnd?: () => void;
  onConnectWalletStart?: () => void;
  onConnectWalletEnd?: () => void;
};

/**
 * The resolved internal props of the WalletObserverProvider.
 */
export interface IWalletObserverProviderState<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  observerOptions: TWalletObserverOptions<AssetMetadata>;
  hooks: TWalletProviderHooks;
  refreshInterval: number;
}

/**
 * The main WalletObserverProvider props.
 */
export interface IWalletObserverProviderProps<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  options?: Partial<IWalletObserverProviderState<AssetMetadata>>;
}

/**
 * The WalletObserverProvider's internal state.
 */
export interface IWalletObserverState<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  observerRef: MutableRefObject<WalletObserver<AssetMetadata>>;
  refreshInterval: number | false;
  state: {
    ready: boolean;
    isCip45: boolean;
    setIsCip45: Dispatch<SetStateAction<boolean>>;
    setReady: Dispatch<SetStateAction<boolean>>;
    activeWallet?: TSupportedWalletExtensions;
    setActiveWallet: Dispatch<
      SetStateAction<TSupportedWalletExtensions | undefined>
    >;
    adaBalance: AssetAmount<AssetMetadata>;
    balance: WalletBalanceMap<AssetMetadata>;
    utxos?: TransactionUnspentOutput[];
    setUtxos: Dispatch<SetStateAction<TransactionUnspentOutput[] | undefined>>;
    collateral?: TransactionUnspentOutput[];
    setCollateral: Dispatch<
      SetStateAction<TransactionUnspentOutput[] | undefined>
    >;
    setBalance: Dispatch<SetStateAction<WalletBalanceMap<AssetMetadata>>>;
    observer: WalletObserver;
    mainAddress?: string;
    stakeAddress?: string;
    network?: number;
    setNetwork: Dispatch<SetStateAction<number | undefined>>;
    unusedAddresses: string[];
    setUnusedAddresses: Dispatch<SetStateAction<string[]>>;
    usedAddresses: string[];
    setUsedAddresses: Dispatch<SetStateAction<string[]>>;
    syncWallet: () => Promise<void>;
  };
}

/**
 * A generic to extend the default IHandle type that comes
 * back from the Kora Lab's API, and merged with the metadata
 * returned from the metadataResolver.
 */
export type THandleMetadata<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> = AssetMetadata & IHandle;

/**
 * The exposed state of the WalletObserverProvider.
 */
export type TUseWalletObserverState<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> = Omit<
  IWalletObserverState<AssetMetadata>["state"],
  | "setActiveWallet"
  | "setBalance"
  | "setNetwork"
  | "setUnusedAddresses"
  | "setUsedAddresses"
  | "setReady"
  | "setIsCip45"
  | "setUtxos"
  | "setCollateral"
>;
