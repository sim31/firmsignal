import firmcore from 'firmcore'
import { init as walletsInit } from './wallets.js';

let _firmcorePromise: Promise<void>;

async function initFirmcore () {
  _firmcorePromise = firmcore.init()
  await _firmcorePromise;
}

async function initWallets() {
  await walletsInit();
}

async function init() {
  await initFirmcore();
  await initWallets();
}

const _initialized = init();

export async function waitForInit() {
  await _initialized;
}
