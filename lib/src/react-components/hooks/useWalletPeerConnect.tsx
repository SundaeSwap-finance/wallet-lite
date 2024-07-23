import { IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  MutableRefObject,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { TGetPeerConnectInstance } from "../../@types/observer.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletPeerConnect = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>() => {
  const state = useWalletObserver<AssetMetadata>();
  const [isPending, startTransition] = useTransition();
  const [peerConnect, setPeerConnect] =
    useState<ReturnType<TGetPeerConnectInstance>>();
  const [error, setError] = useState<string>();
  const qrCode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.observer) {
      return;
    }

    state.observer.getCip45Instance().then((res) => {
      startTransition(() => {
        try {
          setPeerConnect(res);
        } catch (e) {
          setError((e as Error).message);
        }
      });
    });
  }, [state.observer, setPeerConnect, setError]);

  useEffect(() => {
    if (peerConnect && qrCode.current) {
      peerConnect.instance.generateQRCode(qrCode.current);
    }
  }, [peerConnect, qrCode]);

  return {
    peerConnect,
    QRCodeElement: <div ref={qrCode as MutableRefObject<HTMLDivElement>} />,
    error,
    isLoading: isPending,
  };
};
