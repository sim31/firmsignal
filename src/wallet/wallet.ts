import { Wallet } from 'ethers';
import { AddressStr } from 'firmcontracts/interface/types';

const wallets: Wallet[] = [
  Wallet.fromMnemonic(
    "citizen buffalo derive float trim rib vote typical forget fun wire mixture"
  ),
  Wallet.fromMnemonic(
    "bless brown oyster gorilla rely very blind collect elite nurse plate require"
  ),
  Wallet.fromMnemonic(
    "whip feel inch cement sunset regular happy educate casino trip interest energy"
  ),
  Wallet.fromMnemonic(
    "comic skin fall industry execute weird taste half spawn moral demand keen"
  ),
  Wallet.fromMnemonic(
    "save squeeze verb lazy holiday nose way old odor crunch yard toe"
  ),
  Wallet.fromMnemonic(
    "situate decorate insect benefit trip torch sure bracket spray live way fish"
  ),
];
const byAddress: Record<AddressStr, Wallet> = wallets.reduce((prevValue, wallet) => {
  return {
    ...prevValue,
    [wallet.address]: wallet
  };
}, {});


export function getWallets(): Wallet[] {
  return wallets;
}

export function getWallet(addr: AddressStr) {
  return byAddress[addr];
}