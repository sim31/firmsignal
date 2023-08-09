import { IWallet, BlockConfirmer } from 'firmcore/index.js';
import { Wallet } from 'firmcore/src/wallet';
import { Wallet as EthWallet } from 'ethers';
import fc from 'firmcore';

let _wallet: Promise<IWallet>;
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

  _walletVal = await _wallet;
}

export async function waitForInit() {
  return {
    wallet: await _wallet,
  };
}

export async function loadWallet() {
  return (await waitForInit()).wallet;
}

export async function loadConfirmer() {
  const wallet = await loadWallet();
  const conf = await fc.createWalletConfirmer(wallet);
  return conf;
}

export function getWallet() {
  return _walletVal;
}
