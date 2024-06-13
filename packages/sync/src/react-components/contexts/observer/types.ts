import type { IHandle } from "@koralabs/adahandle-sdk";
import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import type {
  TSupportWalletExtensions,
  TWalletObserverOptions,
} from "../../../@types/observer";
import { WalletBalanceMap } from "../../../classes/WalletBalanceMap.class";
import type { WalletObserver } from "../../../classes/WalletObserver.class";

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
 * The main WalletObserverProvider props.
 */
export interface IWalletObserverProviderProps {
  options: {
    observerOptions?: TWalletObserverOptions;
    hooks?: TWalletProviderHooks;
    refreshInterval?: number;
  };
}

/**
 * The resolved internal props of the WalletObserverProvider.
 */
export interface IWalletObserverProviderState
  extends Omit<IWalletObserverProviderProps["options"], "refreshInterval"> {
  refreshInterval: number;
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
    activeWallet?: TSupportWalletExtensions;
    setActiveWallet: Dispatch<
      SetStateAction<TSupportWalletExtensions | undefined>
    >;
    adaBalance: AssetAmount<AssetMetadata>;
    balance: WalletBalanceMap<AssetMetadata>;
    setBalance: Dispatch<SetStateAction<WalletBalanceMap<AssetMetadata>>>;
    observer: WalletObserver;
    mainAddress?: string;
    network?: 0 | 1;
    setNetwork: Dispatch<SetStateAction<0 | 1 | undefined>>;
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
>;
