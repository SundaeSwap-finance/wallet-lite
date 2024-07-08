import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode } from "react";

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
}

/**
 * This component is the same as RenderWallet, but supports
 * fetching and updating wallet Handles with their extra
 * metadata.
 */
export const RenderWalletHandles: FC<IRenderWalletHandlesProps> = ({
  render,
}) => {
  const state = useWalletObserver();
  const handleData = useWalletHandles();

  return <>{render({ ...state, ...handleData })}</>;
};
