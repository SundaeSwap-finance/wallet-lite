import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode } from "react";

import { useWalletObserver } from "./hooks/useWalletObserver";

export type TRenderWalletFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>>;

export type TRenderWalletFunction = (
  state: TRenderWalletFunctionState<any>
) => JSX.Element | ReactNode;

export interface IRenderWalletProps {
  render: TRenderWalletFunction;
}

/**
 * This component is responsible for rendering just the wallet state
 * that is returned from syncWallet. It is the basics. Other components
 * compose on this and include state for Handles, PeerConnect (CIP-45),
 * and syncing state (RenderWalletState).
 */
export const RenderWallet: FC<IRenderWalletProps> = ({ render }) => {
  const state = useWalletObserver();

  return <>{render(state)}</>;
};
