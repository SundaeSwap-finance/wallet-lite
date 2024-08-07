export const getCardanoCore = async () => {
  return import("@cardano-sdk/core").then((module) => {
    return {
      Serialization: module.Serialization,
      Cardano: module.Cardano,
    };
  });
};

export const getCardanoUtil = async () => {
  return import("@cardano-sdk/util").then((module) => {
    return module.typedHex;
  });
};

export const getPeerConnect = async () => {
  return import("@fabianbormann/cardano-peer-connect").then((module) => {
    return module?.DAppPeerConnect || module.default.DAppPeerConnect;
  });
};

export const getHandleLib = async () => {
  return import("@koralabs/adahandle-sdk").then((module) => {
    return {
      HandleClient: module.HandleClient,
      HandleClientContext: module.HandleClientContext,
      KoraLabsProvider: module.KoraLabsProvider,
    };
  });
};
