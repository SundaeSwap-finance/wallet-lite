import type { IHandle } from "@koralabs/adahandle-sdk";
import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import type {
  IWalletObserverOptions,
  TSupportWalletExtensions,
} from "../../@types/observer";
import { WalletBalanceMap } from "../../classes/WalletBalanceMap.class";
import type { WalletObserver } from "../../classes/WalletObserver.class";

export type TWalletProviderHooks = {
  onSyncWalletStart?: () => void;
  onSyncWalletEnd?: () => void;
  onConnectWalletStart?: () => void;
  onConnectWalletEnd?: () => void;
};

export interface IWalletObserverProviderProps {
  observerOptions?: IWalletObserverOptions;
  hooks?: TWalletProviderHooks;
  refreshInterval: number;
}

export interface IWalletObserverState<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  observerRef: MutableRefObject<WalletObserver<AssetMetadata>>;
  refreshInterval: number | false;
  state: {
    ready: boolean;
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

export type THandleMetadata<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> = AssetMetadata & IHandle;

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
>;
