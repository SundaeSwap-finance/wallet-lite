import type { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "bun:test";
import { FC } from "react";

import { EWalletObserverEvents } from "../../@types/events.js";
import { WalletObserver } from "../../classes/WalletObserver.class.js";
import {
  useWalletConnectionContext,
  useWalletDataContext,
} from "../contexts/observer/context.js";
import { useWalletLoadingState } from "../hooks/useWalletLoadingState.js";
import { useWalletObserver } from "../hooks/useWalletObserver.js";
import { useWalletSyncing } from "../hooks/useWalletSyncing.js";
import WalletObserverProvider from "../WalletObserverProvider/WalletObserverProvider.js";

interface IHarness {
  renders: Record<
    "observer" | "loadingState" | "connection" | "data" | "syncing",
    number
  >;
  syncingHistory: boolean[];
  observer?: WalletObserver;
  connectWallet?: (wallet: string) => Promise<unknown>;
  syncWallet?: () => Promise<void>;
}

/**
 * Mounts one render-counting consumer per wallet hook under a real provider
 * (React 18 root), so tests can tell which consumers a sync re-renders.
 */
const mountHarness = (): IHarness => {
  const harness: IHarness = {
    renders: {
      observer: 0,
      loadingState: 0,
      connection: 0,
      data: 0,
      syncing: 0,
    },
    syncingHistory: [],
  };

  const ObserverConsumer: FC = () => {
    const { observer, connectWallet, syncWallet } = useWalletObserver();
    harness.renders.observer++;
    harness.observer = observer;
    harness.connectWallet = connectWallet;
    harness.syncWallet = syncWallet;
    return null;
  };
  const LoadingStateConsumer: FC = () => {
    useWalletLoadingState();
    harness.renders.loadingState++;
    return null;
  };
  const ConnectionConsumer: FC = () => {
    useWalletConnectionContext();
    harness.renders.connection++;
    return null;
  };
  const DataConsumer: FC = () => {
    useWalletDataContext();
    harness.renders.data++;
    return null;
  };
  const SyncingConsumer: FC = () => {
    const syncing = useWalletSyncing();
    harness.renders.syncing++;
    harness.syncingHistory.push(syncing);
    return null;
  };

  render(
    <QueryClientProvider client={new QueryClient()}>
      <WalletObserverProvider>
        <ObserverConsumer />
        <LoadingStateConsumer />
        <ConnectionConsumer />
        <DataConsumer />
        <SyncingConsumer />
      </WalletObserverProvider>
    </QueryClientProvider>,
  );

  return harness;
};

/** Lets pending promise chains and effects (e.g. the stake address) settle. */
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

const connect = async (harness: IHarness) => {
  await act(async () => {
    await harness.connectWallet!("eternl");
  });
  await settle();
};

/**
 * Runs one sync in two steps, like a real wallet does: the sync starts and
 * holds at its first wallet call, `whileSyncing` runs after React commits that,
 * then the sync is released and finishes in a later commit.
 */
const syncInTwoSteps = async (harness: IHarness, whileSyncing: () => void) => {
  const api = harness.observer!.api as Cip30WalletApi;
  const getBalance = api.getBalance;
  const balanceGate = Promise.withResolvers<void>();
  api.getBalance = async () => {
    await balanceGate.promise;
    return getBalance();
  };

  try {
    let sync: Promise<void> | undefined;
    await act(async () => {
      sync = harness.syncWallet!();
      await Promise.resolve();
    });
    whileSyncing();

    await act(async () => {
      balanceGate.resolve();
      await sync;
    });
    await settle();
  } finally {
    api.getBalance = getBalance;
  }
};

describe("WalletObserverProvider", () => {
  it("re-renders no wallet consumer when a sync returns unchanged data", async () => {
    const harness = mountHarness();
    await connect(harness);

    let syncsEnded = 0;
    harness.observer!.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_END,
      () => syncsEnded++,
    );
    const sharedRenders = () => {
      const { observer, loadingState, connection, data } = harness.renders;
      return { observer, loadingState, connection, data };
    };
    const before = sharedRenders();

    await syncInTwoSteps(harness, () => {
      expect(sharedRenders()).toEqual(before);
    });

    expect(syncsEnded).toEqual(1);
    expect(sharedRenders()).toEqual(before);
  });

  it("reports syncing through useWalletSyncing while a sync is in flight", async () => {
    const harness = mountHarness();
    await connect(harness);
    expect(harness.syncingHistory.at(-1)).toBeFalse();

    await syncInTwoSteps(harness, () => {
      expect(harness.syncingHistory.at(-1)).toBeTrue();
    });

    expect(harness.syncingHistory.at(-1)).toBeFalse();
  });
});
