import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { ReactElement, ReactNode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useWalletObserver } from "./hooks/useWalletObserver.js";
import { useWalletPeerConnect } from "./hooks/useWalletPeerConnect.js";

export type TRenderWalletPeerConnectFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = ReturnType<typeof useWalletObserver<T>> &
  ReturnType<typeof useWalletPeerConnect<T>>;

export type TRenderWalletPeerConnectFunction<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = (state: TRenderWalletPeerConnectFunctionState<T>) => ReactNode;

export interface IRenderWalletPeerConnectProps<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  render: TRenderWalletPeerConnectFunction<T>;
  loader?: ReactNode;
  fallback?: ReactElement;
}

/**
 * This component is responsible for generating CIP-45 utilities
 * and exposing them to the render function, including a QR Code
 * element that can be placed in the consuming app.
 */
export const RenderWalletPeerConnect = <
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
>({
  render,
  loader,
  fallback,
}: IRenderWalletPeerConnectProps<T>) => {
  const state = useWalletObserver<T>();
  const peerConnectState = useWalletPeerConnect<T>();

  if (!peerConnectState.peerConnect) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={fallback || <p>{peerConnectState.error}</p>}
      onError={(error) => {
        if (state.observer.getOptions().debug) {
          console.log(error.message, error.stack);
        }
      }}
    >
      <Suspense fallback={loader}>
        {render({ ...state, ...peerConnectState })}
      </Suspense>
    </ErrorBoundary>
  );
};
