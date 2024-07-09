import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactElement, ReactNode, Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { useWalletHandles } from "./hooks/useWalletHandles.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletHandlesFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>> &
  ReturnType<typeof useWalletHandles<T>>;

export type TRenderWalletHandlesFunction = (
  state: TRenderWalletHandlesFunctionState
) => JSX.Element | ReactNode;

export interface IRenderWalletHandlesProps {
  render: TRenderWalletHandlesFunction;
  loader?: ReactNode;
  fallback?: ReactElement;
}

/**
 * This component is the same as RenderWallet, but supports
 * fetching and updating wallet Handles with their extra
 * metadata.
 */
export const RenderWalletHandles: FC<IRenderWalletHandlesProps> = ({
  render,
  loader,
  fallback,
}) => {
  const state = useWalletObserver();
  const handleData = useWalletHandles();

  return (
    <ErrorBoundary
      fallback={fallback || <p>Error.</p>}
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
