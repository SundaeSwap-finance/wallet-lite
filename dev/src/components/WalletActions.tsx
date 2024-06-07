// import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
// import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";

// import cx from "classnames";
// import { lazy, useCallback, useState } from "react";
// import { duotoneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// const LazySyntax = lazy(() => import("react-syntax-highlighter"));

// interface IPayloadObject {
//   data: string;
//   author: string;
// }

// export const WalletActions = () => {
//   const { usedAddresses, stakeAddress, signMessage } = useCardano({
//     limitNetwork: NetworkType.TESTNET,
//   });
//   const [signingMessage, setSigningMessage] = useState(false);
//   const mainAddress = usedAddresses[0];

//   const [data, setData] = useState("");
//   const [response, setResponse] = useState<{
//     signature: string;
//     key: string;
//   }>();

//   const getPayload = useCallback(() => {
//     const payload: IPayloadObject = {
//       data,
//       author: stakeAddress,
//     };

//     return JSON.stringify(payload);
//   }, [data, stakeAddress]);

//   const handleSignData = async () => {
//     if (!data || data === "") {
//       return;
//     }

//     setSigningMessage(true);

//     await signMessage(
//       getPayload(),
//       (signature, key) => {
//         console.log({
//           signature,
//           key,
//         });
//         setResponse({
//           signature,
//           key,
//         });
//         setSigningMessage(false);
//       },
//       (e) => {
//         setSigningMessage(false);
//         throw e;
//       }
//     );
//   };

//   return (
//     <div className="flex w-2/3 flex-col">
//       <h4 className="text-2xl font-bold">Wallet Actions</h4>
//       {!mainAddress ? (
//         <p>Wallet not connected.</p>
//       ) : (
//         <div className="flex flex-col items-stretch gap-4">
//           <div className="flex items-center gap-4">
//             <input
//               className="w-full"
//               type="text"
//               value={data}
//               placeholder="Your payload here..."
//               onChange={(e) => setData(e.target.value)}
//             />
//             <input
//               className={cx(
//                 "w-1/4 px-4 py-2",
//                 { "cursor-pointer": data !== "" },
//                 { "cursor-not-allowed bg-gray-200 text-gray-400": data === "" }
//               )}
//               type="button"
//               value={signingMessage ? "Waiting for signature..." : "Sign Data"}
//               onClick={handleSignData}
//               disabled={signingMessage}
//             />
//           </div>
//           <LazySyntax language="json" style={duotoneLight}>
//             {response
//               ? `
// // hex-encoded values:
// {
//   "key": "${response.key}",
//   "signature": "${response.signature}"
//   "payload": "${getPayload()}"
// }
//             `
//               : "// Sign something to see the response..."}
//           </LazySyntax>
//         </div>
//       )}
//     </div>
//   );
// };
export {};
