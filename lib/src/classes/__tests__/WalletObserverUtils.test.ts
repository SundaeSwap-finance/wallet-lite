import { afterAll, describe, expect, it, mock, spyOn } from "bun:test";

// import { coreModuleMock } from "../../../setup-tests.js";
import * as getLibModules from "../../utils/getLibs.js";
import { WalletObserverUtils } from "../WalletObserverUtils.class.js";

const testAddress =
  "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s";
const stakeAddress =
  "stake_test1uqfpl53wpdt6cgr0alrk879l5pm3jx04yx95q6g7afz3f5quuwrwt";

const spiedOnGetCardanoCore = spyOn(getLibModules, "getCardanoCore");

afterAll(() => {
  mock.restore();
});

describe("WalletObserverUtils", async () => {
  const instance = await WalletObserverUtils.new(0);
  const isValidMock = spyOn(instance.Cardano.Address, "isValidBech32");
  const fromBech32Mock = spyOn(instance.Cardano.Address, "fromBech32");

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
      isValidMock.mockImplementationOnce(() => false);
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

      isValidMock.mockImplementationOnce(() => false);
      expect(() => instance.getBech32StakingAddress("invalid")).toThrowError(
        "Expected a Bech32 encoded address.",
      );
      expect(isValidMock).toHaveBeenCalled();

      expect(() => instance.getBech32StakingAddress("invalid")).toThrowError(
        "Expected a Bech32 encoded address.",
      );
    });
  });
});
