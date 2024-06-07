import merge from "lodash/merge";
import { FC, PropsWithChildren, useMemo } from "react";

import {
  IWalletObserverProviderProps,
  IWalletObserverState,
  WalletObserverContext,
  defaultObserverContextValue,
} from "../../contexts/observer";
import { useProviderEventListeners } from "./hooks/effects/useProviderEventListeners";
import { useProviderRefreshInterval } from "./hooks/effects/useProviderRefreshInterval";
import { useProviderWalletObserverRef } from "./hooks/useProviderWalletObserverRef";
import { useWalletObserverState } from "./hooks/useSyncWalletFunction";

const WalletObserverProvider: FC<
  PropsWithChildren<IWalletObserverProviderProps>
> = ({ children, ...rest }) => {
  const mergedProps = useMemo(() => {
    return merge(
      {},
      defaultObserverContextValue,
      rest
    ) as IWalletObserverProviderProps;
  }, [rest]);

  const observerRef = useProviderWalletObserverRef(mergedProps.observerOptions);
  const { syncWallet, ...reactiveState } = useWalletObserverState(
    observerRef.current
  );

  useProviderEventListeners(observerRef.current, syncWallet);
  useProviderRefreshInterval(
    mergedProps.refreshInterval,
    syncWallet,
    observerRef.current
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
