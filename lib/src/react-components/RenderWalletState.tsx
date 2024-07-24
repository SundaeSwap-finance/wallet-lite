import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { ReactElement, ReactNode, Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { useWalletLoadingState } from "./hooks/useWalletLoadingState.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletStateFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = ReturnType<typeof useWalletObserver<T>> &
  ReturnType<typeof useWalletLoadingState<T>>;

export type TRenderWalletStateFunction<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = (state: TRenderWalletStateFunctionState<T>) => JSX.Element | ReactNode;

export interface IRenderWalletStateProps<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  render: TRenderWalletStateFunction<T>;
  loader?: ReactNode;
  fallback?: ReactElement;
}

/**
 * This component is the same as RenderWallet, but will
 * trigger a re-render every time the WalletObserver performs
 * a sync or connection operation. Useful for displaying
 * internal operation states of the wallet.
 */
export const RenderWalletState = <
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
>({
  render,
  loader,
  fallback,
}: IRenderWalletStateProps<T>) => {
  const state = useWalletObserver<T>();
  const loadingState = useWalletLoadingState<T>();

  return (
    <ErrorBoundary
      fallback={fallback || null}
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
