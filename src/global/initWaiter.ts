import fcManager, { BlockConfirmer, IFirmCore, IWallet } from 'firmcore'
import { loadConfirmer, loadWallet } from './wallets.js';

// Actual initialization is triggered in store.ts

export async function getFirmcore(): Promise<IFirmCore> {
  const fc = await fcManager.get();
  return fc;
}

interface Initialized {
  wallet: IWallet
  fc: IFirmCore
  confirmer: BlockConfirmer
}

export async function waitForInit(): Promise<Initialized> {
  return {
    wallet: await loadWallet(),
    fc: await getFirmcore(),
    confirmer: await loadConfirmer()
  }
}
