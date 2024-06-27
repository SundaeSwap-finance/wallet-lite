import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { TGetPeerConnectInstance } from "../../@types/observer.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletPeerConnect = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>() => {
  const state = useWalletObserver<AssetMetadata>();
  const [peerConnect, setPeerConnect] =
    useState<ReturnType<TGetPeerConnectInstance>>();
  const [error, setError] = useState<string>();
  const qrCode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.observer) {
      return;
    }

    state.observer
      .getCip45Instance()
      .then((res) => setPeerConnect(res))
      .catch((e) => setError((e as Error).message));
  }, [state.observer, state.ready, setPeerConnect, setError]);

  useEffect(() => {
    if (peerConnect && qrCode.current) {
      peerConnect.instance.generateQRCode(qrCode.current);
    }
  }, [peerConnect, qrCode]);

  const memoizedState = useMemo(
    () => ({
      peerConnect,
      QRCodeElement: <div ref={qrCode as MutableRefObject<HTMLDivElement>} />,
      error,
    }),
    [peerConnect, qrCode, error]
  );

  return memoizedState;
};
