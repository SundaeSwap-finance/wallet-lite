import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { afterEach, describe, expect, it, spyOn, test } from "bun:test";

import { WalletObserver } from "../packages/sync/src/classes/WalletObserver.class";
import {
  EWalletObserverEvents,
  IWalletObserverOptions,
} from "../packages/sync/src/exports";
import { assetIds } from "./data/assets";
import { network, unusedAddresses, usedAddresses } from "./data/eternl";

afterEach(() => {
  window.localStorage.clear();
});

describe("WalletObserver", async () => {
  describe("errors", () => {
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
      expect(() => observer.getCip45Instance()).toThrowError(
        "No CIP-45 peer connect arguments were provided when instantiating this WalletObserver instance!"
      );
    });

    it("should throw appropriate error when trying to connect to a non-injected wallet", () => {
      // Low connect timeout just for testing.
      expect(() =>
        new WalletObserver({
          connectTimeout: 10,
        }).connectWallet("flint")
      ).toThrowError("Wallet extension not found in the global context.");
    });
  });

  describe("constructor()", () => {
    test("no parameters", () => {
      const observer = new WalletObserver();
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

    test("with parameters", () => {
      const handler = async (ids: string[]) => {
        const metadata = ids.map((id) => ({ decimals: 6, assetId: id }));
        const map = new Map<string, IAssetAmountMetadata>();
        metadata.forEach((m) => map.set(m.assetId, m));
        return map;
      };
      const observer = new WalletObserver({
        connectTimeout: 5000,
        metadataResolver: handler,
        peerConnectArgs: {
          dAppInfo: {
            name: "My Test dApp",
            url: "http://example.com",
          },
        },
        persistence: true,
      });
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
      expect(observer.getOptions()).toMatchObject({
        metadataResolver: handler,
        persistence: true,
        connectTimeout: 5000,
        peerConnectArgs: expect.objectContaining({
          dAppInfo: {
            name: "My Test dApp",
            url: "http://example.com",
          },
        }),
      } as IWalletObserverOptions);
    });
  });

  describe("connectWallet()", () => {
    it("should connect correctly", async () => {
      const observer = new WalletObserver();
      const spiedDispatch = spyOn(observer, "dispatch");
      const spiedOnSyncApi = spyOn(observer, "syncApi");

      await observer.connectWallet("eternl");
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        1,
        EWalletObserverEvents.CONNECT_WALLET_START
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        2,
        EWalletObserverEvents.CONNECT_WALLET_END,
        {
          extension: "eternl",
        }
      );

      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY)
      ).toBeNull();
      expect(observer.getActiveWallet()).toEqual("eternl");
      expect(observer.api).toBeDefined();
      expect(spiedOnSyncApi).toHaveBeenNthCalledWith(1, "eternl");

      const syncResults = await observer.sync();
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        3,
        EWalletObserverEvents.SYNCING_WALLET_START
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        4,
        EWalletObserverEvents.GET_BALANCE_MAP_START
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        5,
        EWalletObserverEvents.GET_BALANCE_MAP_END,
        {
          balanceMap: expect.objectContaining({
            size: assetIds.length,
          }),
        }
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        6,
        EWalletObserverEvents.SYNCING_WALLET_END,
        {
          balanceMap: expect.objectContaining({
            size: assetIds.length,
          }),
          network,
          unusedAddresses,
          usedAddresses,
        }
      );

      expect(syncResults.balanceMap.size).toEqual(assetIds.length);
      expect(syncResults.network).toBe(network);
      expect(syncResults.unusedAddresses).toEqual(unusedAddresses);
      expect(syncResults.usedAddresses).toEqual(usedAddresses);
    });

    it("should connect correctly with persistence", async () => {
      const observer = new WalletObserver({
        persistence: true,
      });
      const spiedOnSyncApi = spyOn(observer, "syncApi");
      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY)
      ).toBeNull();

      await observer.connectWallet("eternl");

      expect(observer.getActiveWallet()).toEqual("eternl");
      expect(observer.api).toBeDefined();
      expect(spiedOnSyncApi).toHaveBeenNthCalledWith(1, "eternl");

      const syncResults = await observer.sync();

      expect(syncResults.balanceMap.size).toEqual(assetIds.length);
      expect(syncResults.network).toBe(network);
      expect(syncResults.unusedAddresses).toEqual(unusedAddresses);
      expect(syncResults.usedAddresses).toEqual(usedAddresses);
      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY)
      ).toEqual('{"activeWallet":"eternl"}');
    });
  });

  describe("disconnect()", () => {
    it("should disconnect correctly", async () => {
      const observer = new WalletObserver({
        persistence: true,
      });
      const spiedDispatch = spyOn(observer, "dispatch");
      await observer.connectWallet("eternl");

      expect(observer.getActiveWallet()).toEqual("eternl");
      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY)
      ).toEqual('{"activeWallet":"eternl"}');

      await observer.sync();

      expect(observer.getActiveWallet()).toEqual("eternl");
      expect(observer.getCachedAssetMetadata().size).toEqual(assetIds.length);

      observer.disconnect();

      expect(observer.getActiveWallet()).toBeUndefined();
      expect(observer.getCachedAssetMetadata().size).toEqual(0);
      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY)
      ).toBeNull();
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        7,
        EWalletObserverEvents.DISCONNECT
      );
    });
  });

  describe("getCip45Instance()", async () => {
    const observer = new WalletObserver({
      peerConnectArgs: {
        dAppInfo: {
          name: "My Test dApp",
          url: "http://example.com",
        },
      },
    });

    expect(observer.peerConnectInstance).toBeUndefined();

    const instance = await observer.getCip45Instance();
    expect(observer.peerConnectInstance).not.toBeUndefined();
  });
});
