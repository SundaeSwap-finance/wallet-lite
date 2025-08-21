import type { IHandle } from "@koralabs/adahandle-sdk";
import type { IAssetAmountMetadata } from "@sundaeswap/asset";
import type { MutableRefObject } from "react";

import type {
  IWalletObserverSync,
  TWalletObserverOptions,
} from "../../../@types/observer.js";
import type { WalletObserver } from "../../../classes/WalletObserver.class.js";
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
