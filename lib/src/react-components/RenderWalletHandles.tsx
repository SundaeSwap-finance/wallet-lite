import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode } from "react";

import { TAssetAmountMap } from "../@types/observer.js";
import { THandleMetadata } from "./contexts/observer/index.js";
import { useWalletHandles } from "./hooks/useWalletHandles.js";
import { useWalletObserver } from "./hooks/useWalletObserver.js";

export type IWalletHandles<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> = {
  handles: TAssetAmountMap<THandleMetadata<AssetMetadata>>;
  loadingHandles: boolean;
};

export type TRenderWalletHandlesFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>> & IWalletHandles;

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
