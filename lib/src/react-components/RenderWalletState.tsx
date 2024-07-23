import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactElement, ReactNode, Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { useWalletLoadingState } from "./hooks/useWalletLoadingState.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletStateFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = ReturnType<typeof useWalletObserver<T>> &
  ReturnType<typeof useWalletLoadingState<T>>;

export type TRenderWalletStateFunction = (
  state: TRenderWalletStateFunctionState,
) => JSX.Element | ReactNode;

export interface IRenderWalletStateProps {
  render: TRenderWalletStateFunction;
  loader?: ReactNode;
  fallback?: ReactElement;
}

/**
 * This component is the same as RenderWallet, but will
 * trigger a re-render every time the WalletObserver performs
 * a sync or connection operation. Useful for displaying
 * internal operation states of the wallet.
 */
export const RenderWalletState: FC<IRenderWalletStateProps> = ({
  render,
  loader,
  fallback = null,
}) => {
  const state = useWalletObserver();
  const loadingState = useWalletLoadingState();

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error) => {
        if (state.observer.getOptions().debug) {
          console.log(error.message, error.stack);
        }
      }}
    >
      <Suspense fallback={loader}>
        {render({
          ...state,
          ...loadingState,
        })}
      </Suspense>
    </ErrorBoundary>
  );
};
