import type { IHandle } from "@koralabs/adahandle-sdk";
import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { MutableRefObject } from "react";

import type {
  IWalletObserverSync,
  TWalletObserverOptions,
} from "../../../@types/observer.js";
import type { WalletBalanceMap } from "../../../classes/WalletBalanceMap.class.js";
import type { WalletObserver } from "../../../classes/WalletObserver.class.js";
import type { TransactionUnspentOutput } from "@cardano-sdk/core/dist/cjs/Serialization/TransactionUnspentOutput.js";
import { useDerivedState } from "../../WalletObserverProvider/hooks/effects/useDerivedState.js";
import { useWalletObserverState } from "../../WalletObserverProvider/hooks/useWalletObserverState.js";

/**
 * Available hooks to apply at various events.
 */
export type TWalletProviderHooks<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> = {
  onSyncWalletStart?: () => Promise<void>;
  onSyncWalletEnd?: (
    data?: IWalletObserverSync<AssetMetadata> & { activeWallet: string },
  ) => Promise<void>;
  onConnectWalletStart?: () => Promise<void>;
  onConnectWalletEnd?: (
    data?: IWalletObserverSync<AssetMetadata> & { activeWallet: string },
  ) => Promise<void>;
  onDisconnectWallet?: () => Promise<void>;
};

/**
 * The resolved internal props of the WalletObserverProvider.
 */
export interface IWalletObserverProviderState<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  observerOptions: TWalletObserverOptions<AssetMetadata>;
  hooks: TWalletProviderHooks<AssetMetadata>;
  refreshInterval: number;
}

/**
 * The main WalletObserverProvider props.
 */
export interface IWalletObserverProviderProps<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  options?: Partial<IWalletObserverProviderState<AssetMetadata>>;
  /**
   * When provided, the provider will only sync the wallet when this value is `true`.
   * Useful for gating syncs until external dependencies (e.g. a metadata resolver) are ready.
   * Defaults to `true` if not provided.
   */
  loading?: boolean;
}

/**
 * The WalletObserverProvider's internal state.
 */
export interface IWalletObserverState<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  observerRef: MutableRefObject<WalletObserver<AssetMetadata>>;
  refreshInterval: number | false;
  state: ReturnType<typeof useWalletObserverState<AssetMetadata>> &
    ReturnType<typeof useDerivedState> & {
      isPending: boolean;
      observer: WalletObserver<AssetMetadata>;
      connectingWallet: boolean;
      syncingWallet: boolean;
      ready: boolean;
    };
}

/**
 * Focused context: stable callbacks and observer reference.
 * Rarely changes — only if the observer instance is recreated.
 */
export interface IWalletObserverActionsContext<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  observer: WalletObserver<AssetMetadata>;
  observerRef: MutableRefObject<WalletObserver<AssetMetadata>>;
  connectWallet: (wallet: string) => Promise<unknown>;
  disconnect: () => void;
  syncWallet: (
    importedData?: IWalletObserverSync<AssetMetadata>,
  ) => Promise<void>;
  resyncMetadata: () => Promise<void>;
}

/**
 * Focused context: connection and loading state.
 * Changes on connect/disconnect and sync start/end.
 */
export interface IWalletObserverConnectionContext {
  activeWallet: string | undefined;
  ready: boolean;
  connectingWallet: boolean;
  syncingWallet: boolean;
  network: number | undefined;
  isCip45: boolean;
  switching: boolean;
  isReadOnlyMode: boolean;
  willAutoConnect: boolean;
  errorSyncing: boolean;
  mainAddress: string | undefined;
  stakeAddress: string | undefined;
}

/**
 * Focused context: wallet data that changes every sync cycle.
 */
export interface IWalletObserverWalletDataContext<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  balance: WalletBalanceMap<AssetMetadata>;
  adaBalance: AssetAmount<AssetMetadata>;
  usedAddresses: string[];
  unusedAddresses: string[];
  changeAddress: string | undefined;
  feeAddress: string | undefined;
  utxos: TransactionUnspentOutput[] | undefined;
  collateral: TransactionUnspentOutput[] | undefined;
  isPending: boolean;
  refreshInterval: number | false;
}

/**
 * A generic to extend the default IHandle type that comes
 * back from the Kora Lab's API, and merged with the metadata
 * returned from the metadataResolver.
 */
export type THandleMetadata<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> = AssetMetadata & IHandle;

/**
 * The exposed state of the WalletObserverProvider.
 */
export type TUseWalletObserverState<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> = Omit<
  IWalletObserverState<AssetMetadata>["state"],
  | "setActiveWallet"
  | "setAdaBalance"
  | "setHandles"
  | "setSwitching"
  | "setBalance"
  | "setNetwork"
  | "setUnusedAddresses"
  | "setUsedAddresses"
  | "setReady"
  | "setIsCip45"
  | "setUtxos"
  | "setCollateral"
  | "setFeeAddress"
  | "setIsReadOnlyMode"
  | "setChangeAddress"
>;
