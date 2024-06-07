import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode } from "react";

import { useWalletObserver } from "../hooks/useWalletObserver";

export type TRenderWalletFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>>;

export type TRenderWalletFunction = (
  state: TRenderWalletFunctionState
) => JSX.Element | ReactNode;

export interface IRenderWalletProps {
  render: TRenderWalletFunction;
}

export const RenderWallet: FC<IRenderWalletProps> = ({ render }) => {
  const state = useWalletObserver();

  return <>{render(state)}</>;
};
