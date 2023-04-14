import { expect } from "chai";
import { FirmCore } from '../src/firmcore-network-mock/firmcore';
import { ZeroAddr } from "firmcontracts/interface/types";

// TODO: How to do fixtures in mocha
function firmcoreFixt() {
  return new FirmCore();
}

describe('firmcore', function() {
  it("Should create EdenPlusFractal chain", async function() {
    const firmcore = new FirmCore();

    const efChain = await firmcore.createEFChain({
      confirmers: [
        {
          id: 0,
          address: '0x8ba1f109551bd432803012645ac136ddd64dba72',
          extAccounts: {},
        }
      ],
      name: 'SomeFractal',
      symbol: 'sf',
      timestamp: new Date(),
      threshold: 1
    });

    expect(efChain.address).to.not.equal(ZeroAddr);
  });

});