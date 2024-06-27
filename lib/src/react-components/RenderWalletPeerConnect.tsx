import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { TGetPeerConnectInstance } from "../@types/observer.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";
import { useWalletPeerConnect } from "./hooks/useWalletPeerConnect.js";

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
  const peerConnectState = useWalletPeerConnect();

  if (!peerConnectState.peerConnect) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<p>{peerConnectState.error}</p>}>
      {render({ ...state, ...peerConnectState })}
    </ErrorBoundary>
  );
};
