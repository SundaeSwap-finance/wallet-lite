export const getCardanoCore = async () => {
  const { Serialization, Cardano } = await import("@cardano-sdk/core");
  return {
    Serialization,
    Cardano,
  };
};

export const getCardanoUtil = async () => {
  const { typedHex } = await import("@cardano-sdk/util");
  return { typedHex };
};

export const getPeerConnect = async () => {
  const { DAppPeerConnect } = await import(
    "@fabianbormann/cardano-peer-connect"
  );
  return { DAppPeerConnect };
};
