import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { WalletAssetMap } from "../../classes/WalletAssetMap.class.js";
import { getHandleMetadata } from "../../utils/handles.js";
import { THandleMetadata } from "../contexts/observer/types.js";
import {
  useWalletConnectionContext,
  useWalletDataContext,
} from "../contexts/observer/context.js";

export const useWalletHandles = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>() => {
  const { balance } = useWalletDataContext<AssetMetadata>();
  const { mainAddress, network } = useWalletConnectionContext();

  const memoizedHandleDep = useMemo(
    () => [...balance.getHandles().keys()],
    [balance],
  );

  const queryKey = useMemo(
    () => [memoizedHandleDep, mainAddress, network],
    [memoizedHandleDep, mainAddress, network],
  );
  const { data: handles, isLoading } = useQuery<
    WalletAssetMap<THandleMetadata<AssetMetadata>> | undefined
  >({
    queryKey,
    queryFn: async () => {
      const result = await getHandleMetadata(
        balance.getHandles(),
        network || 0,
      );

      return result;
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
