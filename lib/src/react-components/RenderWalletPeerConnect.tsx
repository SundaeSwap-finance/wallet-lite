import { IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  FC,
  MutableRefObject,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

import { TGetPeerConnectInstance } from "../@types/observer.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletPeerConnectFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>> & {
  peerConnect?: ReturnType<TGetPeerConnectInstance>;
  QRCodeElement: ReactNode;
};

export type TRenderWalletPeerConnectFunction = (
  state: TRenderWalletPeerConnectFunctionState
) => ReactNode;

export interface IRenderWalletPeerConnectProps {
  render: TRenderWalletPeerConnectFunction;
}

/**
 * This component is responsible for generating CIP-45 utilities
 * and exposing them to the render function, including a QR Code
 * element that can be placed in the consuming app.
 */
export const RenderWalletPeerConnect: FC<IRenderWalletPeerConnectProps> = ({
  render,
}) => {
  const state = useWalletObserver();
  const [peerConnect, setPeerConnect] =
    useState<ReturnType<TGetPeerConnectInstance>>();
  const [error, setError] = useState<string>();
  const qrCode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.observer) {
      return;
    }

    state.observer
      .getCip45Instance()
      .then((res) => setPeerConnect(res))
      .catch((e) => setError((e as Error).message));
  }, [state.observer, state.ready, setPeerConnect, setError]);

  useEffect(() => {
    if (peerConnect && qrCode.current) {
      peerConnect.instance.generateQRCode(qrCode.current);
    }
  }, [peerConnect, qrCode]);

  const memoizedState = useMemo(
    () => ({
      ...state,
      peerConnect,
      QRCodeElement: <div ref={qrCode as MutableRefObject<HTMLDivElement>} />,
    }),
    [state, peerConnect]
  );

  if (!memoizedState.peerConnect) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<p>{error}</p>}>
      {render(memoizedState)}
    </ErrorBoundary>
  );
};
