import type {
  Cip30Wallet,
  Cip30WalletApiWithPossibleExtensions,
} from "@cardano-sdk/dapp-connector";
import { jest, mock } from "bun:test";
// @ts-ignore commonjs import
import { GlobalRegistrator } from "@happy-dom/global-registrator";

import {
  assetIds,
  assetMap,
} from "./packages/sync/src/__tests__/__data__/assets";
import {
  balance,
  network,
  unusedAddresses,
  usedAddresses,
} from "./packages/sync/src/__tests__/__data__/eternl";

GlobalRegistrator.register({
  url: "http://localhost.com",
});

type TMockedCip30Wallet = Pick<
  Cip30WalletApiWithPossibleExtensions,
  "getBalance" | "getNetworkId" | "getUnusedAddresses" | "getUsedAddresses"
>;

export const mockedEternlApi = jest
  .fn<() => Promise<TMockedCip30Wallet>>()
  .mockResolvedValue({
    getBalance: mock(async () => balance),
    getNetworkId: mock(async () => network),
    getUnusedAddresses: mock(async () => unusedAddresses),
    getUsedAddresses: mock(async () => usedAddresses),
  });

export const mockedEternlWallet: Omit<Cip30Wallet, "#private"> = {
  apiVersion: "1.0",
  enable:
    mockedEternlApi as unknown as () => Promise<Cip30WalletApiWithPossibleExtensions>,
  icon: "",
  isEnabled: async () => true,
  name: "eternl",
  supportedExtensions: [],
};

window.cardano = {
  eternl: mockedEternlWallet as unknown as Cip30Wallet,
};

/**
 * Mock necessary @cardano-sdk/core exports with basic values.
 * This is necessary because the library uses libsodium-wrappers-sumo,
 * which uses CommonJS exports, which are incompatible with
 * Bun runtime.
 */
mock.module("@cardano-sdk/core", () => ({
  Cardano: {
    Address: {
      fromBytes: mock((val) => ({
        // Just keep as hex for testing.
        toBech32: mock(() => val),
      })),
    },
  },
  Serialization: {
    Value: {
      fromCbor: mock(() => ({
        coin: mock(
          () =>
            assetMap.find(({ key }) => key === "ada.lovelace")?.assetAmount
              .amount
        ),
        multiasset: mock(() => ({
          keys: mock(() => assetIds),
          entries: mock(() =>
            assetIds.map((id) => [
              id,
              assetMap.find(({ key }) => key === id)?.assetAmount.amount,
            ])
          ),
        })),
      })),
    },
  },
}));

/**
 * Mock the peer connect library for cip-45 support.
 */
mock.module("@fabianbormann/cardano-peer-connect", () => ({
  DAppPeerConnect: mock((args) => ({
    getIdenticon: mock(),
    shutdownServer: mock(() => {
      args.onApiEject();
    }),
    __testStartServer: mock(() => {
      // @ts-ignore This is injected by eternl.
      window.cardano["eternl-p2p"] =
        mockedEternlWallet as unknown as Cip30Wallet;
      args.onApiInject("eternl-p2p");
    }),
  })),
}));
