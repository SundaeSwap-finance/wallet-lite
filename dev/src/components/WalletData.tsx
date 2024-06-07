import { RenderWallet, TRenderWalletFunctionState } from "@sundaeswap/sync";

import { IWalletMetadata } from "../App";
import { WalletHandles } from "./WalletHandles";

export const WalletData = () => {
  return (
    <div>
      <h4 className="text-xl font-bold">ADA Balance</h4>
      <RenderWallet
        render={({
          adaBalance,
        }: TRenderWalletFunctionState<IWalletMetadata>) => {
          return <p>{adaBalance.value.toString()}</p>;
        }}
      />
      <div className="grid w-full grid-cols-2">
        <div>
          <h4 className="text-xl font-bold">Native Assets</h4>
          <ul>
            <RenderWallet
              render={({
                balance,
              }: TRenderWalletFunctionState<IWalletMetadata>) => {
                return Array.from(balance).map(([key, aa]) => (
                  <li key={key}>
                    {aa.metadata.assetName || aa.metadata.assetId}:{" "}
                    {aa.value.toString()}
                  </li>
                ));
              }}
            />
          </ul>
        </div>
        <div>
          <WalletHandles />
        </div>
      </div>
    </div>
  );

  // useEffect(() => {
  //   if (strategy === "cip45" && qrCode.current) {
  //     dAppConnector?.instance().generateQRCode(qrCode.current);
  //   }
  // }, [strategy, dAppConnector]);

  // const addr = (addr: string) => {
  //   const prefix = addr.slice(0, 6);
  //   const suffix = addr.slice(addr.length - 10, addr.length);
  //   return `${prefix}...${suffix}`;
  // };

  // if (!enabledWallet) {
  //   return <p>Connect a wallet.</p>;
  // }

  // return (
  //   <>
  //     {/* {strategy === "cip45" && !activeWallet && (
  //       <div>
  //         <p>Connect via CardanoConnect</p>
  //         <p>Address: {dAppConnector?.instance().getAddress()}</p>
  //         <div ref={qrCode} />
  //       </div>
  //     )} */}
  //     <div className={`w-1/3 ${enabledWallet ? "block" : "hidden"}`}>
  //       <h4 className="text-2xl font-bold">Wallet Details</h4>
  //       {isConnecting && <p>Loading...</p>}
  //       {!enabledWallet && <p>Wallet not connected.</p>}
  //       {isConnecting && (
  //         <ul>
  //           <li>
  //             <p>
  //               <strong>Network</strong>:{" "}
  //               {"Testnet"}
  //             </p>
  //           </li>
  //           <li>
  //             <p>
  //               <strong>Main Address</strong>: {addr(details?.mainAddress)}
  //             </p>
  //           </li>
  //           <li>
  //             <p>
  //               <strong>Staking Address</strong>:{" "}
  //               {addr(details?.stakingAddress)}
  //             </p>
  //           </li>
  //           <li>
  //             <p>
  //               <strong>Payment Keyhash</strong>:{" "}
  //               {addr(details?.credentials?.payment)}
  //             </p>
  //           </li>
  //           <li>
  //             <p>
  //               <strong>Staking Keyhash</strong>:{" "}
  //               {addr(details?.credentials?.staking)}
  //             </p>
  //           </li>
  //           <li>
  //             <p>
  //               <strong>Used Addresses</strong>:{" "}
  //               {details?.usedAddresses.map((address) => (
  //                 <span className="block" key={address}>
  //                   {addr(address)}
  //                 </span>
  //               ))}
  //             </p>
  //           </li>
  //           <li>
  //             <p>
  //               <strong>Unused Addresses</strong>:{" "}
  //               {details?.unusedAddresses?.map((address) => (
  //                 <span className="block" key={address}>
  //                   {addr(address)}
  //                 </span>
  //               ))}
  //             </p>
  //           </li>
  //         </ul>
  //       )}
  //       {error && <p style={{ color: "red" }}>{error}</p>}
  //     </div>
  //     <div className={`w-1/3 ${activeWallet ? "block" : "hidden"}`}>
  //       <h4 className="text-2xl font-bold">Wallet Assets</h4>
  //       {loading.balance && <p>Loading...</p>}
  //       {loaded.balance && !balance && <p>Wallet has no assets.</p>}
  //       {loaded.balance && (
  //         <ul>
  //           {assets.map(([key, { metadata, quantity, utxos }]) => (
  //             <li key={key}>
  //               {/* @ts-ignore */}
  //               {metadata?.assetName || metadata.assetId}:{" "}
  //               {quantity.value.toString()}
  //               {utxos && (
  //                 <>
  //                   <p>
  //                     <strong>UTXOS</strong>
  //                   </p>
  //                   <ul>
  //                     {utxos?.map(({ hash, index }) => (
  //                       <li key={`${hash}-${index}`}>{`${hash}#${index}`}</li>
  //                     ))}
  //                   </ul>
  //                 </>
  //               )}
  //             </li>
  //           ))}
  //         </ul>
  //       )}
  //     </div>
  // </>
  // );
};
