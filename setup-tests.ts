import type { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { jest, mock } from "bun:test";

// Peer connect uses indexeddb internally.
import "fake-indexeddb/auto.js";
import { IWindowCip30Extension } from "./lib/src/@types/observer.js";
import {
  mockBalance,
  mockNetwork,
  mockUnusedAddresses,
  mockUsedAddresses,
  mockUtxos,
} from "./lib/src/__data__/eternl.js";

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
  | "getCollateral"
>;

export const mockedEternlApi = jest
  .fn<() => Promise<TMockedCip30Wallet>>()
  .mockResolvedValue({
    getBalance: mock(async () => mockBalance),
    getNetworkId: mock(async () => mockNetwork),
    getUnusedAddresses: mock(async () => mockUnusedAddresses),
    getUsedAddresses: mock(async () => mockUsedAddresses),
    getUtxos: mock(async () => mockUtxos),
    getCollateral: mock(async () => mockUtxos),
  });

export const mockedEternlWallet: IWindowCip30Extension = {
  apiVersion: "1.0",
  enable: mockedEternlApi as unknown as () => Promise<Cip30WalletApi>,
  icon: "",
  isEnabled: async () => true,
  name: "eternl",
  experimental: {
    feeAddress:
      "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s",
  },
};

Object.defineProperty(window, "cardano", {
  writable: true,
  value: {
    eternl: mockedEternlWallet,
  },
});
