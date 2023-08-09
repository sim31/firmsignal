import fc, { BlockConfirmer, IFirmCore, IWallet } from 'firmcore'
import { loadConfirmer, loadWallet } from './wallets.js';

// Actual initialization is triggered in store.ts

interface Initialized {
  wallet: IWallet
  fc: IFirmCore
  confirmer: BlockConfirmer
}

export async function waitForInit(): Promise<Initialized> {
  return {
    wallet: await loadWallet(),
    fc,
    confirmer: await loadConfirmer()
  }
}
