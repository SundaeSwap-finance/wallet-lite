import { useQuery } from "@tanstack/react-query";

/**
 * This hook is responsible for attaching
 * calling the sync function on an interval.
 * If set to 0, then the refresh interval is not attached.
 *
 * @param syncWalletFn
 * @param refreshInterval
 */
export const useSyncWalletWithInterval = (
  syncWalletFn: () => Promise<void>,
  refreshInterval?: number,
) => {
  useQuery({
    queryKey: ["useSyncWalletWithInterval"],
    queryFn: () => {
      syncWalletFn();
      return true;
    },
    refetchInterval: refreshInterval,
    enabled: refreshInterval ? refreshInterval > 0 : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
