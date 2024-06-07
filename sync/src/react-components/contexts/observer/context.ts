import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { createContext, useContext } from "react";

import { IWalletObserverProviderState, IWalletObserverState } from "./types";

/**
 * Default state applied to the context.
 */
export const defaultObserverContextValue: IWalletObserverProviderState = {
  refreshInterval: 30000,
};

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
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>(): IWalletObserverState<AssetMetadata> {
  const context = useContext(
    WalletObserverContext
  ) as unknown as IWalletObserverState<AssetMetadata>;

  if (!context) {
    throw new Error(
      "useWalletObserverContext must be used within a WalletObserverProvider"
    );
  }

  return context;
}
