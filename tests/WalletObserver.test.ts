import { describe, expect, it, spyOn } from "bun:test";

import { WalletObserver } from "../packages/sync/src/classes/WalletObserver.class";
import { IWalletObserverOptions } from "../packages/sync/src/exports";
import { assetIds } from "./data/assets";
import { network, unusedAddresses, usedAddresses } from "./data/eternl";

describe("WalletObserver with defaults", async () => {
  it("should instantiate appropriately", () => {
    const observer = new WalletObserver();
    expect(observer.peerConnectInstance).toBeUndefined();
    expect(observer.eventList().size).toEqual(0);
    expect(observer.isSyncing()).toBeFalse();
    expect(observer.getActiveWallet()).toBeUndefined();
    expect(observer.network).toEqual(0);
    expect(observer.api).toBeUndefined();
    expect(observer.getSupportedExtensions()).toEqual([
      "eternl",
      "lace",
      "typhon",
      "sorbet",
      "flint",
      "nami",
    ]);
    expect(observer.peerConnectInstance).toBeUndefined();
    expect(observer.getOptions()).toMatchObject({
      metadataResolver: expect.anything(),
      persistence: false,
      connectTimeout: 10000,
      peerConnectArgs: undefined,
    } as IWalletObserverOptions);
  });

  it("should throw appropriate errors before connected", () => {
    const observer = new WalletObserver();
    expect(() => observer.getBalanceMap()).toThrowError(
      "Attempted to query balance without an API instance."
    );
    expect(() => observer.getNetwork()).toThrowError(
      "Attempted to query network without an API instance."
    );
    expect(() => observer.syncApi()).toThrowError(
      "A wallet is required to be passed as a parameter, or to be defined in the class."
    );
    expect(() => observer.sync()).toThrowError(
      "Attempted to perform a sync operation without a connected wallet."
    );
  });

  it("should throw appropriate error when trying to connect to a non-injected wallet", () => {
    const observer = new WalletObserver({
      connectTimeout: 10,
    });

    expect(() => observer.connectWallet("flint")).toThrowError(
      "Wallet extension not found in the global context."
    );
  });

  it("should connect to eternl", async () => {
    const observer = new WalletObserver();
    const spiedOnSyncApi = spyOn(observer, "syncApi");
    await observer.connectWallet("eternl");
    expect(
      window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY)
    ).toBeNull();
    expect(observer.getActiveWallet()).toEqual("eternl");
    expect(observer.api).toBeDefined();
    expect(spiedOnSyncApi).toHaveBeenNthCalledWith(1, "eternl");

    const syncResults = await observer.sync();

    expect(syncResults.balanceMap.size).toEqual(assetIds.length);
    expect(syncResults.network).toBe(network);
    expect(syncResults.unusedAddresses).toEqual(unusedAddresses);
    expect(syncResults.usedAddresses).toEqual(usedAddresses);
  });
});
