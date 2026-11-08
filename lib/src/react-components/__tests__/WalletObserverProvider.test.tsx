import type { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "bun:test";
import { FC, Profiler } from "react";

import { EWalletObserverEvents } from "../../@types/events.js";
import { mockUtxos } from "../../__data__/eternl.js";
import { WalletObserver } from "../../classes/WalletObserver.class.js";
import {
  useWalletConnectionContext,
  useWalletDataContext,
} from "../contexts/observer/context.js";
import type {
  IWalletObserverProviderProps,
  IWalletObserverWalletDataContext,
} from "../contexts/observer/types.js";
import { useWalletLoadingState } from "../hooks/useWalletLoadingState.js";
import { useWalletObserver } from "../hooks/useWalletObserver.js";
import { useWalletSyncing } from "../hooks/useWalletSyncing.js";
import { RenderWalletState } from "../RenderWalletState.js";
import WalletObserverProvider from "../WalletObserverProvider/WalletObserverProvider.js";

interface IHarness {
  queryClient: QueryClient;
  /** Commits that rendered the provider or anything under it. */
  commits: number;
  renders: Record<
    "observer" | "loadingState" | "connection" | "data" | "syncing",
    number
  >;
  syncingHistory: boolean[];
  /** Each `syncingWallet` that RenderWalletState passed to its render function. */
  renderStateSyncingHistory: boolean[];
  utxos?: IWalletObserverWalletDataContext["utxos"];
  observer?: WalletObserver;
  connectWallet?: (wallet: string) => Promise<unknown>;
  syncWallet?: () => Promise<void>;
}

/**
 * Mounts one render-counting consumer per wallet hook under a real provider
 * (React 18 root), so tests can tell which consumers a sync re-renders.
 */
const mountHarness = (
  options?: IWalletObserverProviderProps["options"],
): IHarness => {
  const harness: IHarness = {
    queryClient: new QueryClient(),
    commits: 0,
    renders: {
      observer: 0,
      loadingState: 0,
      connection: 0,
      data: 0,
      syncing: 0,
    },
    syncingHistory: [],
    renderStateSyncingHistory: [],
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
    harness.utxos = useWalletDataContext().utxos;
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
    <QueryClientProvider client={harness.queryClient}>
      <Profiler
        id="provider"
        onRender={() => {
          harness.commits++;
        }}
      >
        <WalletObserverProvider options={options}>
          <ObserverConsumer />
          <LoadingStateConsumer />
          <ConnectionConsumer />
          <DataConsumer />
          <SyncingConsumer />
          <RenderWalletState
            render={({ syncingWallet }) => {
              harness.renderStateSyncingHistory.push(syncingWallet);
              return null;
            }}
          />
        </WalletObserverProvider>
      </Profiler>
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

  it("reports syncing through useWalletSyncing and RenderWalletState while a sync is in flight", async () => {
    const harness = mountHarness();
    await connect(harness);
    expect(harness.syncingHistory.at(-1)).toBeFalse();
    expect(harness.renderStateSyncingHistory.at(-1)).toBeFalse();

    await syncInTwoSteps(harness, () => {
      expect(harness.syncingHistory.at(-1)).toBeTrue();
      expect(harness.renderStateSyncingHistory.at(-1)).toBeTrue();
    });

    expect(harness.syncingHistory.at(-1)).toBeFalse();
    expect(harness.renderStateSyncingHistory.at(-1)).toBeFalse();
  });

  it("clears the syncing flag when a sync ends, while onSyncWalletEnd still runs", async () => {
    // The hook never settles here. Waiting on it would leave the flag true
    // for good if the hook rejects, or clear it late, during the next sync.
    const endHook = Promise.withResolvers<void>();
    const harness = mountHarness({
      hooks: { onSyncWalletEnd: () => endHook.promise },
    });
    await connect(harness);

    await syncInTwoSteps(harness, () => {
      expect(harness.syncingHistory.at(-1)).toBeTrue();
    });

    expect(harness.syncingHistory.at(-1)).toBeFalse();
    endHook.resolve();
  });

  it("re-renders the data consumers when a sync returns new UTXOs", async () => {
    const harness = mountHarness();
    await connect(harness);
    expect(harness.utxos).toHaveLength(mockUtxos.length);

    const api = harness.observer!.api as Cip30WalletApi;
    const getUtxos = api.getUtxos;
    api.getUtxos = async () => mockUtxos.slice(1);
    try {
      const before = { ...harness.renders };

      await act(async () => {
        await harness.syncWallet!();
      });
      await settle();

      expect(harness.utxos).toHaveLength(mockUtxos.length - 1);
      expect(harness.renders.connection).toEqual(before.connection);
      expect(harness.renders.loadingState).toEqual(before.loadingState);
    } finally {
      api.getUtxos = getUtxos;
    }
  });

  it("doesn't re-render the provider when the interval query fetches", async () => {
    // No wallet is connected, so each fetch's sync returns at once: only the
    // query's own fetch status could re-render anything.
    const harness = mountHarness({ refreshInterval: 60_000 });
    await settle();
    // The provider's interval query is the client's only query.
    const [query] = harness.queryClient.getQueryCache().getAll();
    const before = {
      commits: harness.commits,
      fetches: query.state.dataUpdateCount,
    };

    await act(async () => {
      await harness.queryClient.refetchQueries();
    });
    await settle();

    expect(query.state.dataUpdateCount).toEqual(before.fetches + 1);
    expect(harness.commits).toEqual(before.commits);
  });
});
