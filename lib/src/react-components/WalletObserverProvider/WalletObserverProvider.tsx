import { FC, PropsWithChildren, useEffect, useMemo } from "react";

import { WalletObserver } from "../../classes/WalletObserver.class.js";
import {
  IWalletObserverProviderProps,
  IWalletObserverState,
  WalletObserverContext,
} from "../contexts/observer/index.js";
import { useDerivedState } from "./hooks/effects/useDerivedState.js";
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
  const {
    observerRef,
    connectingWallet,
    syncingWallet,
    ready,
    eventListenersAttached,
  } = useProviderWalletObserverRef(options?.observerOptions, options?.hooks);
  const state = useWalletObserverState(observerRef.current);

  useProviderRefreshInterval(
    observerRef.current,
    state.syncWallet,
    options?.refreshInterval,
  );

  const derivedState = useDerivedState(observerRef.current, {
    usedAddresses: state.usedAddresses,
    unusedAddresses: state.unusedAddresses,
    changeAddress: state.changeAddress,
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
        connectingWallet,
        syncingWallet,
        ready,
      },
    }),
    [
      options,
      state,
      derivedState,
      connectingWallet,
      syncingWallet,
      ready,
      observerRef.current,
    ],
  );

  useEffect(() => {
    if (!eventListenersAttached) {
      return;
    }

    const wallet = window.localStorage.getItem(
      WalletObserver.PERSISTENCE_CACHE_KEY,
    );

    if (wallet && observerRef.current?.getOptions()?.persistence) {
      state.connectWallet(JSON.parse(wallet).activeWallet);
    }
  }, [eventListenersAttached]);

  return (
    <WalletObserverContext.Provider value={contextValue}>
      {children}
    </WalletObserverContext.Provider>
  );
};

export default WalletObserverProvider;
