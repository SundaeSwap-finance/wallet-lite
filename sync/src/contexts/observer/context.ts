import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { createContext, useContext } from "react";

import { IWalletObserverProviderProps, IWalletObserverState } from "./types";

export const defaultObserverContextValue: Pick<
  IWalletObserverProviderProps,
  "observerOptions" | "refreshInterval"
> = {
  refreshInterval: 30000,
};

export const WalletObserverContext = createContext<
  IWalletObserverState | undefined
>(undefined);

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
