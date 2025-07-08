import {
  ReadOnlyBlockfrostProvider,
  TWalletObserverOptions,
  WalletObserverProvider,
} from "@sundaeswap/wallet-lite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, StrictMode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ConnectWallet } from "./components/ConnectWallet.js";
import { WalletData } from "./components/WalletData.js";

export interface IWalletMetadata {
  decimals: number;
  assetId: string;
  assetName: string;
}

const observerOptions: TWalletObserverOptions<IWalletMetadata> = {
  debug: true,
  metadataResolver: async ({ assetIds, isAdaAsset, normalizeAssetId }) => {
    const metadataMap = new Map<string, IWalletMetadata>();
    assetIds.forEach((id) => {
      const hexName = id.split(".")?.[1] ?? "";
      const assetName = isAdaAsset(id)
        ? "ADA"
        : Buffer.from(hexName, "hex").toString("utf-8");

      metadataMap.set(normalizeAssetId(id), {
        assetId: normalizeAssetId(id),
        assetName,
        decimals: 6,
      });
    });

    return metadataMap;
  },
  persistence: true,
  // @ts-expect-error I haven't added types for this.
  readOnlyProvider: new ReadOnlyBlockfrostProvider(window.blockfrostApiKey),
};

export const App: FC = () => {
  return (
    <div className="flex gap-10">
      <ConnectWallet />
      <div className="w-3/4 p-4">
        <div className="mt-8 flex items-start gap-8">
          <WalletData />
        </div>
      </div>
    </div>
  );
};

const client = new QueryClient();

export const Root = () => {
  return (
    <StrictMode>
      <ErrorBoundary
        fallbackRender={({ error }) => <p>Whoops: {error.message}</p>}
      >
        <Suspense fallback={<p>Loading...</p>}>
          <QueryClientProvider client={client}>
            <WalletObserverProvider
              options={{
                observerOptions: observerOptions,
              }}
            >
              <App />
            </WalletObserverProvider>
          </QueryClientProvider>
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default Root;
