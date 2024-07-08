import { FC, PropsWithChildren, useMemo } from "react";

import {
  IWalletObserverProviderProps,
  IWalletObserverState,
  WalletObserverContext,
} from "../contexts/observer/index.js";
import { useDerivedState } from "./hooks/effects/useDerivedState.js";
import { useProviderEventListeners } from "./hooks/effects/useProviderEventListeners.js";
import { useProviderRefreshInterval } from "./hooks/effects/useProviderRefreshInterval.js";
import { useProviderWalletObserverRef } from "./hooks/useProviderWalletObserverRef.js";
import { useWalletObserverState } from "./hooks/useWalletObserverState.js";

/**
 * The main context provider component. This handles setting up all the initial
 * state, handlers, and side effects with a new WalletObserver class.
 *
 * @param {IWalletObserverProviderProps} [options]
 * @returns {FC<PropsWithChildren<IWalletObserverProviderProps>>}
 */
const WalletObserverProvider: FC<
  PropsWithChildren<IWalletObserverProviderProps>
> = ({ children, options }) => {
  const observerRef = useProviderWalletObserverRef(options?.observerOptions);
  const state = useWalletObserverState(observerRef.current);

  useProviderEventListeners(observerRef.current, state);
  useProviderRefreshInterval(
    observerRef.current,
    state.syncWallet,
    options?.refreshInterval
  );

  const derivedState = useDerivedState(observerRef.current, {
    usedAddresses: state.usedAddresses,
  });

  // Memoize the context value
  const contextValue: IWalletObserverState = useMemo(
    () => ({
      observerRef: observerRef,
      refreshInterval: options?.refreshInterval || 30000,
      state: {
        ...state,
        ...derivedState,
        observer: observerRef.current,
      },
    }),
    [options, state, derivedState]
  );

  return (
    <WalletObserverContext.Provider value={contextValue}>
      {children}
    </WalletObserverContext.Provider>
  );
};

export default WalletObserverProvider;
