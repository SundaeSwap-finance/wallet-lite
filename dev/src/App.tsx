import type { IWalletObserverOptions } from "@sundaeswap/turbo";
import {
  RenderWalletPeerConnect,
  WalletObserverProvider,
} from "@sundaeswap/turbo";
import { FC, StrictMode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ConnectWallet } from "./components/ConnectWallet";
import { WalletData } from "./components/WalletData";

export interface IWalletMetadata {
  decimals: number;
  assetId: string;
  assetName: string;
}

const options: IWalletObserverOptions<IWalletMetadata> = {
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
      <RenderWalletPeerConnect
        render={({ peerConnect, QRCodeElement }) =>
          peerConnect && (
            <div className="m-4 w-1/4 border border-gray-400 p-4">
              <h4>CIP-45</h4>

              <p>Address: {peerConnect.instance.getAddress()}</p>
              {QRCodeElement}
            </div>
          )
        }
      />
      <div className="w-3/4 p-4">
        <ConnectWallet />
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
            observerOptions={options}
            refreshInterval={10000}
          >
            <App />
          </WalletObserverProvider>
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default Root;
