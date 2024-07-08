import { useEffect } from "react";

import { EWalletObserverEvents } from "../../../../@types/events.js";
import { WalletObserver } from "../../../../classes/WalletObserver.class.js";
import { TWalletProviderHooks } from "../../../contexts/observer/index.js";
import { useWalletObserverState } from "../useWalletObserverState.js";

/**
 * Internal use only. This is run in every WalletObserverProvider
 * component on initial mount. It adds all relevant event listeners
 * to the WalletObserver class.
 *
 * @param observer
 * @param syncWallet
 * @param hooks
 */
export const useProviderEventListeners = (
  observer: WalletObserver,
  state: ReturnType<typeof useWalletObserverState>,
  hooks?: TWalletProviderHooks
) => {
  /**
   * Add user-defined hooks into the event stream.
   */
  useEffect(() => {
    if (!hooks) {
      return;
    }

    const setConnectingStart = () => {
      hooks?.onConnectWalletStart?.();
    };
    const setConnectingEnd = () => {
      hooks?.onConnectWalletEnd?.();
    };
    const setSyncingStart = () => {
      hooks?.onSyncWalletStart?.();
    };
    const setSyncingEnd = () => {
      hooks?.onSyncWalletEnd?.();
    };

    observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_START,
      setConnectingStart
    );
    observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      setConnectingEnd
    );
    observer.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_START,
      setSyncingStart
    );
    observer.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_END,
      setSyncingEnd
    );

    return () => {
      observer.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_START,
        setConnectingStart
      );
      observer.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_END,
        setConnectingEnd
      );
      observer.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_START,
        setSyncingStart
      );
      observer.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_END,
        setSyncingEnd
      );
    };
  }, [observer, hooks]);

  /**
   * Ensure the wallet syncs on connect and disconnect.
   */
  useEffect(() => {
    window.addEventListener("focus", state.syncWallet);

    observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      state.syncWallet
    );

    return () => {
      window.addEventListener("focus", state.syncWallet);
      observer.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_END,
        state.syncWallet
      );
    };
  }, [observer, state.syncWallet]);
};
