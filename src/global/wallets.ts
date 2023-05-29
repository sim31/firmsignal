import firmcore, { IWallet, BlockConfirmer } from 'firmcore/index.js';
import { Wallet } from 'firmcore/src/wallet';
import { Wallet as EthWallet } from 'firmcore/node_modules/ethers';

let _wallet: Promise<IWallet>;
let _confirmer: Promise<BlockConfirmer>
let _confirmerVal: BlockConfirmer | undefined;
let _walletVal: IWallet | undefined;

export async function _createWallet() {
  const ethWallet = EthWallet.createRandom();
  localStorage.setItem('key', ethWallet.privateKey);
  _wallet = new Promise(resolve => {
    resolve(new Wallet(ethWallet));
  })
}

export async function init() {
  const key = localStorage.getItem('key');
  if (key === null) {
    await _createWallet();
  } else {
    _wallet = new Promise<IWallet>((resolve) => {
      resolve(new Wallet(new EthWallet(key)));
    });
  }

  _confirmer = firmcore.createWalletConfirmer(await _wallet);

  _walletVal = await _wallet;
  _confirmerVal = await _confirmer;
}

export async function waitForInit() {
  return {
    wallet: await _wallet,
    confirmer: await _confirmer
  };
}

export async function loadWallet() {
  return (await waitForInit()).wallet;
}

export async function loadConfirmer() {
  return (await waitForInit()).confirmer;
}

export function getConfirmer() {
  return _confirmerVal;
}

export function getWallet() {
  return _walletVal;
}
