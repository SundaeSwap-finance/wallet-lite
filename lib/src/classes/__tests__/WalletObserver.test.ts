import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { afterEach, describe, expect, it, spyOn, test } from "bun:test";

import { assetIds } from "../../__data__/assets.js";
import {
  network,
  unusedAddresses,
  usedAddresses,
} from "../../__data__/eternl.js";
import {
  EWalletObserverEvents,
  TMetadataResolverFunc,
  TWalletObserverOptions,
} from "../../index.js";
import * as getLibModules from "../../utils/getLibs.js";
import { WalletObserver } from "../WalletObserver.class.js";

const spiedOnGetCardano = spyOn(getLibModules, "getCardanoCore");
const spiedOnGetUtils = spyOn(getLibModules, "getCardanoUtil");
const spiedOnGetPeerConnect = spyOn(getLibModules, "getPeerConnect");

afterEach(() => {
  window.localStorage.clear();
});

describe("WalletObserver", async () => {
  describe("errors", () => {
    it("should throw appropriate errors before connected", () => {
      const observer = new WalletObserver();
      expect(() => observer.getBalanceMap()).toThrowError(
        "Attempted to query balance without an API instance.",
      );
      expect(() => observer.getNetwork()).toThrowError(
        "Attempted to query network without an API instance.",
      );
      expect(() => observer.syncApi()).toThrowError(
        "A wallet is required to be passed as a parameter, or to be defined in the class.",
      );
      expect(() => observer.sync()).toThrowError(
        "Attempted to perform a sync operation without a connected wallet.",
      );
    });

    it("should throw appropriate error when trying to connect to a non-injected wallet", () => {
      // Low connect timeout just for testing.
      expect(() =>
        new WalletObserver({
          connectTimeout: 10,
        }).connectWallet("flint"),
      ).toThrowError("Could not find extension (flint) in the global context.");
    });
  });

  describe("constructor()", () => {
    test("no parameters", () => {
      const observer = new WalletObserver();
      expect(observer.eventList().size).toEqual(0);
      expect(observer.isSyncing()).toBeFalse();
      expect(observer.activeWallet).toBeUndefined();
      expect(observer.network).toEqual(0);
      expect(observer.api).toBeUndefined();
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
      const handler: TMetadataResolverFunc<IAssetAmountMetadata> = async ({
        assetIds,
        normalizeAssetId,
      }) => {
        const metadata = assetIds.map((id) => ({ decimals: 6, assetId: id }));
        const map = new Map<string, IAssetAmountMetadata>();
        metadata.forEach((m) => map.set(normalizeAssetId(m.assetId), m));
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
      expect(observer.activeWallet).toBeUndefined();
      expect(observer.network).toEqual(0);
      expect(observer.api).toBeUndefined();
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
        EWalletObserverEvents.CONNECT_WALLET_START,
      );

      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY),
      ).toBeNull();
      expect(observer.activeWallet).toEqual("eternl");
      expect(observer.api).toBeDefined();
      expect(spiedOnSyncApi).toHaveBeenNthCalledWith(1, "eternl");

      const syncResults = await observer.sync();
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        2,
        EWalletObserverEvents.SYNCING_WALLET_START,
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        3,
        EWalletObserverEvents.GET_BALANCE_MAP_START,
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        4,
        EWalletObserverEvents.GET_BALANCE_MAP_END,
        {
          balanceMap: expect.objectContaining({
            size: assetIds.length,
          }),
        },
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        5,
        EWalletObserverEvents.SYNCING_WALLET_END,
        expect.objectContaining({
          balanceMap: expect.objectContaining({
            size: assetIds.length,
          }),
          network,
          unusedAddresses,
          usedAddresses,
        }),
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
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY),
      ).toBeNull();

      await observer.connectWallet("eternl");

      expect(observer.activeWallet).toEqual("eternl");
      expect(observer.api).toBeDefined();
      expect(spiedOnSyncApi).toHaveBeenNthCalledWith(1, "eternl");

      const syncResults = await observer.sync();

      expect(syncResults.balanceMap.size).toEqual(assetIds.length);
      expect(syncResults.network).toBe(network);
      expect(syncResults.unusedAddresses).toEqual(unusedAddresses);
      expect(syncResults.usedAddresses).toEqual(usedAddresses);
      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY),
      ).toEqual(
        `{"activeWallet":"eternl","mainAddress":"${usedAddresses[0]}"}`,
      );
    });
  });

  describe("disconnect()", () => {
    it("should disconnect correctly", async () => {
      const observer = new WalletObserver({
        persistence: true,
      });
      const spiedDispatch = spyOn(observer, "dispatch");
      await observer.connectWallet("eternl");

      expect(spiedOnGetCardano).toHaveBeenCalled();
      expect(spiedOnGetPeerConnect).not.toHaveBeenCalled();
      expect(spiedOnGetUtils).toHaveBeenCalled();

      expect(observer.activeWallet).toEqual("eternl");
      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY),
      ).toEqual(
        `{"activeWallet":"eternl","mainAddress":"${usedAddresses[0]}"}`,
      );

      await observer.sync();

      expect(observer.activeWallet).toEqual("eternl");
      expect(observer.getCachedAssetMetadata().size).toEqual(assetIds.length);

      observer.disconnect();

      expect(observer.activeWallet).toBeUndefined();
      expect(observer.getCachedAssetMetadata().size).not.toEqual(0);
      expect(
        window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY),
      ).toBeNull();
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        7,
        EWalletObserverEvents.SYNCING_WALLET_START,
      );
      expect(spiedDispatch).toHaveBeenNthCalledWith(
        11,
        EWalletObserverEvents.DISCONNECT,
      );
      expect(spiedOnGetPeerConnect).not.toHaveBeenCalled();
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
        }),
      );

      // Simulate injection.
      // @ts-expect-error Simulating the actual function.
      data.instance.__testStartServer();
      expect(spiedOnConnect).toHaveBeenCalledWith("eternl-p2p");

      data.instance.shutdownServer();
      expect(spiedOnDisconnect).toHaveBeenCalled();

      // Restore window.
      delete window.cardano?.["eternl-p2p"];
    });
  });
});
