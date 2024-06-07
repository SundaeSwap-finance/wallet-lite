import {
  EWalletObserverEvents,
  TWalletObserverEventFunction,
} from "../@types/events";
import { WalletObserver } from "../classes/WalletObserver.class";

export const onConnectHandler: TWalletObserverEventFunction<
  EWalletObserverEvents.CONNECT_WALLET_END
> = (data) => {
  if (!data) {
    return;
  }

  window.localStorage.setItem(
    WalletObserver.PERSISTENCE_CACHE_KEY,
    JSON.stringify({
      activeWallet: data.extension,
    })
  );
};

export const onDisconnectHandler: TWalletObserverEventFunction<
  EWalletObserverEvents.DISCONNECT
> = () => {
  window.localStorage.removeItem(WalletObserver.PERSISTENCE_CACHE_KEY);
};
