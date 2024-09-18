import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { TAssetAmountMap } from "../../@types/observer.js";
import { getHandleMetadata } from "../../utils/handles.js";
import { THandleMetadata } from "../contexts/observer/types.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletHandles = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>() => {
  const state = useWalletObserver<AssetMetadata>();
  const memoizedHandleDep = useMemo(
    () => [...state.balance.getHandles().keys()],
    [state.balance],
  );

  const queryKey = [memoizedHandleDep, state.mainAddress, state.network];
  const { data: handles, isLoading } = useQuery<
    TAssetAmountMap<THandleMetadata<AssetMetadata>> | undefined
  >({
    queryKey,
    queryFn: async () => {
      return getHandleMetadata(state.balance.getHandles(), state.network || 0);
    },
    refetchInterval: false,
    notifyOnChangeProps: ["data", "isLoading"],
  });

  const memoizedResult = useMemo(
    () => ({
      handles,
      loadingHandles: isLoading,
      totalCount: memoizedHandleDep.length,
    }),
    [handles, isLoading, memoizedHandleDep],
  );

  return memoizedResult;
};
