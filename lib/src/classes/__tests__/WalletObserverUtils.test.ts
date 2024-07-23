import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { merge } from "lodash";

import { coreModuleMock } from "../../../setup-tests.js";
import * as getLibModules from "../../utils/getLibs.js";
import { WalletObserverUtils } from "../WalletObserverUtils.class.js";

const testAddress =
  "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s";
const stakeAddress =
  "stake_test1uqfpl53wpdt6cgr0alrk879l5pm3jx04yx95q6g7afz3f5quuwrwt";

const fromBech32Mock = mock();
const getStakeCredentialMock = mock(() => ({
  hash: "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
  type: 1,
}));
const fromAddressMock = mock(() => ({
  getPaymentCredential: mock(() => ({
    hash: "c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a",
    type: 0,
  })),
  getStakeCredential: getStakeCredentialMock,
}));
const isValidMock = mock();
const spiedOnGetCardanoCore = spyOn(getLibModules, "getCardanoCore");

beforeAll(() => {
  mock.module("@cardano-sdk/core", () =>
    merge(coreModuleMock, {
      Cardano: {
        Address: {
          isValidBech32: isValidMock,
          fromBech32: fromBech32Mock,
        },
        BaseAddress: {
          fromAddress: fromAddressMock,
        },
        RewardAddress: {
          fromCredentials: mock(() => ({
            toAddress: mock(() => ({
              toBech32: mock(() => stakeAddress),
            })),
          })),
        },
      },
    }),
  );
});

afterAll(() => {
  mock.restore();
});

describe("WalletObserverUtils", async () => {
  const instance = await WalletObserverUtils.new(0);

  beforeEach(() => {
    isValidMock.mockImplementation(() => true);
  });

  it("should instantiate with expected defaults", () => {
    expect(instance).toBeInstanceOf(WalletObserverUtils);
    expect(instance.network).toEqual(0);
    expect(spiedOnGetCardanoCore).toHaveBeenCalledTimes(1);
  });

  it("should be able to switch networks", () => {
    expect(instance.network).toEqual(0);
    instance.setNetwork(1);
    expect(instance.network).toEqual(1);
    instance.setNetwork(0);
  });

  describe("getAddressDetails()", () => {
    it("should call correct dependency functions", () => {
      instance.getAddressDetails(testAddress);
      expect(isValidMock).toHaveBeenNthCalledWith(1, testAddress);
      expect(fromBech32Mock).toHaveBeenNthCalledWith(1, testAddress);
    });

    it("should throw an error if the address is malformed", () => {
      isValidMock.mockImplementation(() => false);
      expect(() => instance.getAddressDetails("invalid")).toThrowError(
        "Expected a Bech32 encoded address.",
      );
    });
  });

  describe("getBech32StakingAddress()", () => {
    it("should call correct dependency functions", () => {
      expect(() => instance.getBech32StakingAddress(testAddress)).not.toThrow();
      expect(instance.getBech32StakingAddress(testAddress)).toEqual(
        stakeAddress,
      );

      isValidMock.mockImplementation(() => false);
      expect(() => instance.getBech32StakingAddress("invalid")).toThrowError(
        "Expected a Bech32 encoded address.",
      );
      expect(isValidMock).toHaveBeenCalled();

      // @ts-expect-error It can be undefined.
      getStakeCredentialMock.mockImplementation(() => undefined);
      expect(() => instance.getBech32StakingAddress("invalid")).toThrowError(
        "Expected a Bech32 encoded address.",
      );
    });
  });
});
