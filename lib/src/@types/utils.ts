import type { Credential } from "@cardano-sdk/core/dist/cjs/Cardano/index.js";

export type TAddressDetails = {
  paymentCredential?: Credential;
  stakingCredential?: Credential;
};
