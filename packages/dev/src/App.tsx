import { ObserverTypes, WalletObserverProvider } from "@sundaeswap/sync";
import { FC, StrictMode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ConnectWallet } from "./components/ConnectWallet";
import { WalletData } from "./components/WalletData";

export interface IWalletMetadata {
  decimals: number;
  assetId: string;
  assetName: string;
}

const observerOptions: ObserverTypes.TWalletObserverOptions<IWalletMetadata> = {
  metadataResolver: async (assetIds) => {
    const metadataMap = new Map<string, IWalletMetadata>();
    assetIds.forEach((id) => {
      const assetName = Buffer.from(id.slice(56), "hex").toString("utf-8");
      metadataMap.set(id, {
        assetId: id,
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
