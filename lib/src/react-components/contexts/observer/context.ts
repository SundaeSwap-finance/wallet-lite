import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { createContext, useContext } from "react";

import {
  IWalletObserverActionsContext,
  IWalletObserverConnectionContext,
  IWalletObserverState,
  IWalletObserverWalletDataContext,
} from "./types.js";

/**
 * Context instance.
 */
export const WalletObserverContext = createContext<
  IWalletObserverState | undefined
>(undefined);

/**
 * Usability function to avoid needing to do two imports.
 * @returns {IWalletObserverState<AssetMetadata>}
 */
export function useWalletObserverContext<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(): IWalletObserverState<AssetMetadata> {
  const context = useContext(
    WalletObserverContext,
  ) as unknown as IWalletObserverState<AssetMetadata>;

  if (!context) {
    throw new Error(
      "useWalletObserverContext must be used within a WalletObserverProvider",
    );
  }

  return context;
}

/**
 * Focused context for stable actions and observer ref.
 */
export const WalletActionsContext = createContext<
  IWalletObserverActionsContext | undefined
>(undefined);

/**
 * Focused context for connection and loading state.
 */
export const WalletConnectionContext = createContext<
  IWalletObserverConnectionContext | undefined
>(undefined);

/**
 * Focused context for wallet data that changes every sync.
 */
export const WalletDataContext = createContext<
  IWalletObserverWalletDataContext | undefined
>(undefined);

export function useWalletActionsContext<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(): IWalletObserverActionsContext<AssetMetadata> {
  const context = useContext(
    WalletActionsContext,
  ) as unknown as IWalletObserverActionsContext<AssetMetadata>;

  if (!context) {
    throw new Error(
      "useWalletActionsContext must be used within a WalletObserverProvider",
    );
  }

  return context;
}

export function useWalletConnectionContext(): IWalletObserverConnectionContext {
  const context = useContext(WalletConnectionContext);

  if (!context) {
    throw new Error(
      "useWalletConnectionContext must be used within a WalletObserverProvider",
    );
  }

  return context;
}

export function useWalletDataContext<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(): IWalletObserverWalletDataContext<AssetMetadata> {
  const context = useContext(
    WalletDataContext,
  ) as unknown as IWalletObserverWalletDataContext<AssetMetadata>;

  if (!context) {
    throw new Error(
      "useWalletDataContext must be used within a WalletObserverProvider",
    );
  }

  return context;
}
