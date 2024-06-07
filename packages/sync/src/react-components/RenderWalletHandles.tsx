import HandleClient, {
  HandleClientContext,
  KoraLabsProvider,
} from "@koralabs/adahandle-sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { TWalletBalanceMap } from "../@types/observer";
import { THandleMetadata } from "./contexts/observer";
import { useWalletObserver } from "./hooks/useWalletObserver";

export type IWalletHandles<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> = {
  handles: TWalletBalanceMap<THandleMetadata<AssetMetadata>>;
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
  const state = useWalletObserver<THandleMetadata>();
  const [loadingHandles, setLoadingHandles] = useState(true);
  const [handles, setHandles] = useState<TWalletBalanceMap<THandleMetadata>>(
    new Map()
  );

  const syncHandles = useCallback<
    () => Promise<TWalletBalanceMap<THandleMetadata>>
  >(async () => {
    const context =
      state.network === 1
        ? HandleClientContext.MAINNET
        : HandleClientContext.PREVIEW;

    // @ts-ignore Type isn't exported from default.
    const sdk = new HandleClient({
      context,
      provider: new KoraLabsProvider(context),
    });

    const handles: TWalletBalanceMap<THandleMetadata> =
      state.balance.getHandles();

    if (handles.size === 0) {
      return handles;
    }

    const assetNames = [...handles.keys()];
    const data = await sdk
      .provider()
      .getAllData({ value: assetNames[0].slice(56) });

    const asset = state.balance.get(assetNames[0]);
    asset &&
      handles.set(
        asset.metadata.assetId,
        new AssetAmount(1n, {
          ...data,
          ...asset.metadata,
          decimals: 0,
        })
      );

    // Restore once SDK updated
    // const assetNames = [...handles.keys()];
    // const data = await sdk
    //   .provider()
    //   .getAllDataBatch(assetNames.map((n) => ({ value: n.slice(56) })));

    // assetNames.forEach((n) => {
    //   const assetMetadata = state.balance.get(n).metadata;
    //   handles.set(
    //     assetMetadata.assetId,
    //     new AssetAmount(1n, {
    //       ...data,
    //       ...assetMetadata,
    //       decimals: 0,
    //     })
    //   );
    // });

    return handles;
  }, [state.balance]);

  useEffect(() => {
    if (!state.balance.size) {
      return;
    }

    setLoadingHandles(true);
    syncHandles().then((newHandles) => {
      setHandles((prevHandles) => {
        let handleMetadataChanged = false;

        if (newHandles.size !== prevHandles?.size) {
          handleMetadataChanged = true;
        } else {
          for (const [key, val] of newHandles) {
            if (
              !prevHandles.has(key) ||
              prevHandles.get(key)?.amount !== val?.amount
            ) {
              handleMetadataChanged = true;
            }
          }
        }

        if (!handleMetadataChanged) {
          return prevHandles;
        }

        return newHandles;
      });

      setLoadingHandles(false);
    });
  }, [state.balance, syncHandles, setLoadingHandles, setHandles]);

  return (
    <>
      {render({
        ...state,
        handles,
        loadingHandles,
      })}
    </>
  );
};
