import {
  TWalletObserverOptions,
  WalletObserverProvider,
} from "@sundaeswap/wallet-lite";
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
  metadataResolver: async (assetIds, normalize, isAda) => {
    const metadataMap = new Map<string, IWalletMetadata>();
    assetIds.forEach((id) => {
      const hexName = id.split(".")?.[1] ?? "";
      const assetName = isAda(id)
        ? "ADA"
        : Buffer.from(hexName, "hex").toString("utf-8");

      metadataMap.set(normalize(id), {
        assetId: normalize(id),
        assetName,
        decimals: 6,
      });
    });

    return metadataMap;
  },
  persistence: true,
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

export const Root = () => {
  return (
    <StrictMode>
      <ErrorBoundary
        fallbackRender={({ error }) => <p>Whoops: {error.message}</p>}
      >
        <Suspense fallback={<p>Loading...</p>}>
          <WalletObserverProvider
            options={{
              observerOptions: observerOptions,
            }}
          >
            <App />
          </WalletObserverProvider>
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default Root;
