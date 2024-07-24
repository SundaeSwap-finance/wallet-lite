import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { ReactElement, ReactNode, Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { useWalletHandles } from "./hooks/useWalletHandles.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletHandlesFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = ReturnType<typeof useWalletObserver<T>> &
  ReturnType<typeof useWalletHandles<T>>;

export type TRenderWalletHandlesFunction<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> = (state: TRenderWalletHandlesFunctionState<T>) => JSX.Element | ReactNode;

export interface IRenderWalletHandlesProps<
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
> {
  render: TRenderWalletHandlesFunction<T>;
  loader?: ReactNode;
  fallback?: ReactElement;
}

/**
 * This component is the same as RenderWallet, but supports
 * fetching and updating wallet Handles with their extra
 * metadata.
 */
export const RenderWalletHandles = <
  T extends IAssetAmountMetadata = IAssetAmountMetadata,
>({
  render,
  loader,
  fallback,
}: IRenderWalletHandlesProps<T>) => {
  const state = useWalletObserver<T>();
  const handleData = useWalletHandles<T>();

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
        {render({ ...state, ...handleData })}
      </Suspense>
    </ErrorBoundary>
  );
};
