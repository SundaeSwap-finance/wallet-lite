import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactElement, ReactNode, Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>>;

export type TRenderWalletFunction = (
  state: TRenderWalletFunctionState<any>
) => JSX.Element | ReactNode;

export interface IRenderWalletProps {
  render: TRenderWalletFunction;
  loader?: ReactNode;
  fallback?: ReactElement;
}

/**
 * This component is responsible for rendering just the wallet state
 * that is returned from syncWallet. It is the basics. Other components
 * compose on this and include state for Handles, PeerConnect (CIP-45),
 * and syncing state (RenderWalletState).
 */
export const RenderWallet: FC<IRenderWalletProps> = ({
  render,
  loader,
  fallback,
}) => {
  const state = useWalletObserver();

  return (
    <ErrorBoundary
      fallback={fallback || <p>Error.</p>}
      onError={(error) => {
        if (state.observer.getOptions().debug) {
          console.log(error.message, error.stack);
        }
      }}
    >
      <Suspense fallback={loader}>{render(state)}</Suspense>
    </ErrorBoundary>
  );
};
