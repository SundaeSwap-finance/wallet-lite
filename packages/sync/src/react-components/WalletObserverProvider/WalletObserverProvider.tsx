import merge from "lodash/merge";
import { FC, PropsWithChildren, useMemo } from "react";

import {
  IWalletObserverProviderProps,
  IWalletObserverProviderState,
  IWalletObserverState,
  WalletObserverContext,
  defaultObserverContextValue,
} from "../contexts/observer";
import { useProviderEventListeners } from "./hooks/effects/useProviderEventListeners";
import { useProviderRefreshInterval } from "./hooks/effects/useProviderRefreshInterval";
import { useProviderWalletObserverRef } from "./hooks/useProviderWalletObserverRef";
import { useWalletObserverState } from "./hooks/useSyncWalletFunction";

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
  const mergedProps: IWalletObserverProviderState = useMemo(() => {
    return merge({}, defaultObserverContextValue, options);
  }, [options]);

  const observerRef = useProviderWalletObserverRef(mergedProps.observerOptions);
  const { syncWallet, ...reactiveState } = useWalletObserverState(
    observerRef.current
  );

  useProviderEventListeners(observerRef.current, syncWallet);
  useProviderRefreshInterval(
    observerRef.current,
    mergedProps.refreshInterval,
    syncWallet
  );

  // Memoize the context value
  const contextValue: IWalletObserverState = useMemo(
    () => ({
      ...mergedProps,
      observerRef: observerRef,
      state: {
        ...reactiveState,
        mainAddress: reactiveState.usedAddresses?.[0],
        observer: observerRef.current,
        syncWallet,
      },
    }),
    [mergedProps, syncWallet, reactiveState]
  );

  return (
    <WalletObserverContext.Provider value={contextValue}>
      {children}
    </WalletObserverContext.Provider>
  );
};

export default WalletObserverProvider;
