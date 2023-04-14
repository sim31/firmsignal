export type PublicKey = string;
export type Address = string;

export interface IWallet<SigType> {
  getAddress(): Address;
  getPublicKey(): PublicKey;
  sign(digest: string): Promise<SigType>;
}

export interface IWalletCreator<SigType> {
  newWallet(): Promise<IWallet<SigType>>;
}
