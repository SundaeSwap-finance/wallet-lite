import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode } from "react";

import { useWalletLoadingState } from "./hooks/useWalletLoadingState.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type TRenderWalletStateFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>> &
  ReturnType<typeof useWalletLoadingState<T>>;

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
  const loadingState = useWalletLoadingState();

  return (
    <>
      {render({
        ...state,
        ...loadingState,
      })}
    </>
  );
};
