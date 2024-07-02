import type { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
import { jest, mock } from "bun:test";
// @ts-ignore commonjs import
import { GlobalRegistrator } from "@happy-dom/global-registrator";

import { IWindowCip30Extension } from "./src/@types/observer.js";
import { assetIds, assetMap } from "./src/__data__/assets.js";
import {
  balance,
  network,
  unusedAddresses,
  usedAddresses,
  utxos,
} from "./src/__data__/eternl.js";

GlobalRegistrator.register({
  url: "http://localhost.com",
});

type TMockedCip30Wallet = Pick<
  Cip30WalletApi,
  | "getBalance"
  | "getNetworkId"
  | "getUnusedAddresses"
  | "getUsedAddresses"
  | "getUtxos"
>;

export const mockedEternlApi = jest
  .fn<() => Promise<TMockedCip30Wallet>>()
  .mockResolvedValue({
    getBalance: mock(async () => balance),
    getNetworkId: mock(async () => network),
    getUnusedAddresses: mock(async () => unusedAddresses),
    getUsedAddresses: mock(async () => usedAddresses),
    getUtxos: mock(async () => utxos),
  });

export const mockedEternlWallet: IWindowCip30Extension = {
  apiVersion: "1.0",
  enable: mockedEternlApi as unknown as () => Promise<Cip30WalletApi>,
  icon: "",
  isEnabled: async () => true,
  name: "eternl",
};

window.cardano = {
  eternl: mockedEternlWallet,
};

/**
 * Mock necessary @cardano-sdk/core exports with basic values.
 * This is necessary because the library uses libsodium-wrappers-sumo,
 * which uses CommonJS exports, which are incompatible with
 * Bun runtime.
 */
export const coreModuleMock = {
  Cardano: {
    Address: {
      fromBytes: mock((val) => ({
        // Convert back to string just for testing.
        toBech32: mock(() => Buffer.from(val).toString()),
      })),
    },
  },
  Serialization: {
    TransactionUnspentOutput: {
      fromCbor: mock(() => ({
        input: mock(),
        output: mock(),
        toCbor: mock(),
      })),
    },
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
};

mock.module("@cardano-sdk/core", () => coreModuleMock);

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
      window.cardano["eternl-p2p"] = mockedEternlWallet;
      args.onApiInject("eternl-p2p");
    }),
  })),
}));
