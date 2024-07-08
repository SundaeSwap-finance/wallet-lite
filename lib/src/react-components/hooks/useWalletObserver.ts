import { IAssetAmountMetadata } from "@sundaeswap/asset";

import {
  TUseWalletObserverState,
  useWalletObserverContext,
} from "../contexts/observer/index.js";

/**
 * Exposes the WalletObserver state.
 *
 * @returns {TUseWalletObserverState<AssetMetadata>}
 */
export const useWalletObserver = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>(): TUseWalletObserverState<AssetMetadata> => {
  const { state } = useWalletObserverContext<AssetMetadata>();

  const result: TUseWalletObserverState<AssetMetadata> = {
    isCip45: state.isCip45,
    activeWallet: state.activeWallet,
    adaBalance: state.adaBalance,
    balance: state.balance,
    mainAddress: state.mainAddress,
    stakeAddress: state.stakeAddress,
    network: state.network,
    utxos: state.utxos,
    collateral: state.collateral,
    observer: state.observer,
    unusedAddresses: state.unusedAddresses,
    usedAddresses: state.usedAddresses,
    syncWallet: state.syncWallet,
    disconnect: state.disconnect,
    connectWallet: state.connectWallet,
    switching: state.switching,
  };

  return result;
};
