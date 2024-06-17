import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode, useEffect, useState } from "react";

import { EWalletObserverEvents } from "../@types/events.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletStateFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>> & {
  connectingWallet: boolean;
  syncingWallet: boolean;
};

export type TRenderWalletStateFunction = (
  state: TRenderWalletStateFunctionState
) => JSX.Element | ReactNode;

export interface IRenderWalletStateProps {
  render: TRenderWalletStateFunction;
}

/**
 * This component is the same as RenderWallet, but will
 * trigger a re-render every time the WalletObserver performs
 * a sync or connection operation. Useful for displaying
 * internal operation states of the wallet.
 */
export const RenderWalletState: FC<IRenderWalletStateProps> = ({ render }) => {
  const state = useWalletObserver();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!state.observer) {
      return;
    }

    const setConnectingStart = () => {
      setConnecting(true);
    };
    const setConnectingEnd = () => {
      setConnecting(false);
    };
    const setSyncingStart = () => {
      setSyncing(true);
    };
    const setSyncingEnd = () => {
      setSyncing(false);
    };

    state.observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_START,
      setConnectingStart
    );
    state.observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      setConnectingEnd
    );
    state.observer.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_START,
      setSyncingStart
    );
    state.observer.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_END,
      setSyncingEnd
    );

    return () => {
      state.observer.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_START,
        setConnectingStart
      );
      state.observer.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_END,
        setConnectingEnd
      );
      state.observer.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_START,
        setSyncingStart
      );
      state.observer.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_END,
        setSyncingEnd
      );
    };
  }, [state.observer, setConnecting, setSyncing]);

  return (
    <>
      {render({
        ...state,
        connectingWallet: connecting,
        syncingWallet: syncing,
      })}
    </>
  );
};
