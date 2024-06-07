import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { TSupportWalletExtensions, TWalletBalanceMap } from "./observer";

/**
 * A list of observer events that a client can hook into.
 */
export enum EWalletObserverEvents {
  CONNECT_WALLET_START = "connectWalletStart",
  CONNECT_WALLET_END = "connectWalletEnd",
  SYNCING_WALLET_START = "syncingWalletStart",
  SYNCING_WALLET_END = "syncingWalletEnd",
  GET_BALANCE_MAP_START = "getBalanceMapStart",
  GET_BALANCE_MAP_END = "getBalanceMapEnd",
  DISCONNECT = "disconnect",
}

/**
 * A map of what each event passes to the event listener function.
 */
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

/**
 * The function declaration so that an even handler can get
 * type definitions for the arguments.
 */
export type TWalletObserverEventFunction<
  E extends keyof EWalletObserverEventValues
> = (data?: EWalletObserverEventValues[E]) => void;
