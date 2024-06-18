import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { afterEach, describe, expect, it, spyOn, test } from "bun:test";

import { assetIds } from "../../__data__/assets.js";
import {
  network,
  unusedAddresses,
  usedAddresses,
} from "../../__data__/eternl.js";
import { EWalletObserverEvents, TWalletObserverOptions } from "../../index.js";
import { WalletObserver } from "../WalletObserver.class.js";

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
        peerConnectArgs: {
          announce: [
            "wss://tracker.de-5.eternl.art",
            "wss://tracker.de-6.eternl.art",
            "wss://tracker.us-5.eternl.art",
          ],
          dAppInfo: {
            name: "Placeholder dApp Connecter Name",
            url: "localhost.com",
          },
          onApiEject: expect.anything(),
          onApiInject: expect.anything(),
          useWalletDiscovery: true,
          verifyConnection: expect.anything(),
        },
      } as TWalletObserverOptions);
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
      } as TWalletObserverOptions);
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
        expect.objectContaining({
          balanceMap: expect.objectContaining({
            size: assetIds.length,
          }),
          network,
          unusedAddresses,
          usedAddresses,
        })
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

  describe("getCip45Instance()", () => {
    it("should properly get the instance", async () => {
      const observer = new WalletObserver({
        // For quick testing.
        connectTimeout: 10,
        peerConnectArgs: {
          dAppInfo: {
            name: "My Test dApp",
            url: "http://example.com",
          },
        },
      });
      const spiedOnConnect = spyOn(observer, "connectWallet");
      const spiedOnDisconnect = spyOn(observer, "disconnect");

      expect(observer.peerConnectInstance).toBeUndefined();

      const data = await observer.getCip45Instance();
      expect(observer.peerConnectInstance).not.toBeUndefined();
      expect(data).toMatchObject(
        expect.objectContaining({
          icon: undefined,
          name: "My Test dApp",
          instance: data.instance,
        })
      );

      // Simulate injection.
      // @ts-ignore
      data.instance.__testStartServer();
      expect(spiedOnConnect).toHaveBeenCalledWith("eternl-p2p");

      data.instance.shutdownServer();
      expect(spiedOnConnect).toHaveBeenCalled();
    });
  });
});
