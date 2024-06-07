import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { TSupportWalletExtensions, TWalletBalanceMap } from "./observer";

export enum EWalletObserverEvents {
  CONNECT_WALLET_START = "connectWalletStart",
  CONNECT_WALLET_END = "connectWalletEnd",
  SYNCING_WALLET_START = "syncingWalletStart",
  SYNCING_WALLET_END = "syncingWalletEnd",
  GET_BALANCE_MAP_START = "getBalanceMapStart",
  GET_BALANCE_MAP_END = "getBalanceMapEnd",
  DISCONNECT = "disconnect",
}
export interface EWalletObserverEventValues<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> {
  [EWalletObserverEvents.SYNCING_WALLET_START]: undefined;
  [EWalletObserverEvents.SYNCING_WALLET_END]: undefined;
  [EWalletObserverEvents.CONNECT_WALLET_START]: undefined;
  [EWalletObserverEvents.CONNECT_WALLET_END]: {
    extension: TSupportWalletExtensions;
  };
  [EWalletObserverEvents.GET_BALANCE_MAP_START]: undefined;
  [EWalletObserverEvents.GET_BALANCE_MAP_END]: {
    balanceMap: TWalletBalanceMap<T>;
  };
  [EWalletObserverEvents.DISCONNECT]: undefined;
}

export type TWalletObserverEventFunction<
  E extends keyof EWalletObserverEventValues
> = (data?: EWalletObserverEventValues[E]) => void;
