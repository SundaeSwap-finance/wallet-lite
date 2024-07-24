import { RenderWalletHandles, THandleMetadata } from "@sundaeswap/wallet-lite";
import { FC, useState } from "react";

export const WalletHandles: FC = () => {
  const [currentHandleData, setCurrentHandleData] = useState<THandleMetadata>();

  return (
    <>
      <h4 className="text-2xl font-bold">Wallet Handles</h4>
      <ul>
        <RenderWalletHandles
          render={({ handles, loadingHandles }) => {
            if (loadingHandles) {
              return <p>Fetching handle data...</p>;
            } else if (handles.size === 0) {
              return <p>No handles.</p>;
            }

            return (
              <>
                {[...handles.values()].map(({ metadata }) => (
                  <li
                    key={metadata.assetId}
                    onClick={() => {
                      setCurrentHandleData(metadata);
                    }}
                  >{`ADA Handle: $${metadata.assetName}`}</li>
                ))}
              </>
            );
          }}
        />
      </ul>
      {currentHandleData && (
        <pre className="w-100 whitespace-pre-wrap break-all">
          {JSON.stringify(currentHandleData)}
          <button onClick={() => setCurrentHandleData(undefined)}>Clear</button>
        </pre>
      )}
    </>
  );
};
