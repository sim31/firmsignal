import { Required } from 'utility-types';

export type Address = string;
export type BlockId = string;
export type IPFSLink = string;
export type AccountId = number;
export type IPNSAddress = string;
export type TelegramUsername = string;
export type PlatformId = string;
export type PlatformAccountId = string;
export type TokenBalance = number;
export type OptAccountId = AccountId | undefined;
export type Timestamp = Date;
export type TimestampPOD = number;

export interface Confirmer {
  address: Address;
  weight: number;
}

export type ConfirmerMap = Record<Address, Confirmer>;

export interface ConfirmerSet {
  confirmers: ConfirmerMap;
  threshold: number;
}

export interface Chain {
  address: Address;
  name?: string;
  symbol?: string;
  genesisBlockId: BlockId;
  headBlockId: BlockId;

  //getBlock(id: BlockId): Promise<Blo
}

export interface ChainState {
  confirmerSet: ConfirmerSet;
  confirmations: Address[];
}

export interface RespectChain extends Chain {
  name: string;
  symbol: string;
}

export interface DirectoryState extends ChainState {
  getDirectoryId(): Promise<IPFSLink>;
  // TODO: Function to get the actual directory
}

export type ExtAccountMap = Record<PlatformId, PlatformAccountId>; 

export interface Account {
  id: AccountId;
  address?: Address;
  metadataId?: IPFSLink;
  name?: string;
  ipnsAddress?: IPNSAddress;
  extAccounts: ExtAccountMap;
}

export interface FirmAccountSystemState extends ChainState {
  accountById(id: AccountId): Promise<Account | undefined>;  
  accountByAddress(address: Address): Promise<Address | undefined>;
}

export interface RespectState extends FirmAccountSystemState {
  getBalance(id: AccountId): Promise<TokenBalance>;
  getBalanceByAddr(address: Address): Promise<TokenBalance>;
  getTotalSupply(): Promise<TokenBalance>;
}

// TODO: types for making actions on a chain

export interface FractalBreakoutResult {
  ranks: [OptAccountId, OptAccountId, OptAccountId, OptAccountId, OptAccountId, OptAccountId];
}

export interface EFBreakoutResults extends FractalBreakoutResult {
  delegate: AccountId;
}

export interface EFChainState extends RespectState, DirectoryState {
  // Active delegates
  // Week index 0-3, with 0 being the newest
  getDelegate(weekIndex: number, roomNumber: number): Promise<AccountId>;
  getDelegates(weekIndex: number): Promise<AccountId[]>;
}

export interface EFSubmitResultsMsg {
  results: EFBreakoutResults[];
}

export interface SetDirMsg {
  dir: IPFSLink;
}

export type ConfirmerOpId = 'add' | 'remove';

export interface ConfirmerOp {
  opId: ConfirmerOpId;
  confirmer: Confirmer;
}

export interface AddConfirmerOp extends ConfirmerOp {
  opId: 'add';
}

export interface RemoveConfirmerOp {
  opId: 'remove';
}

export interface UpdateConfirmersMsg {
  ops: ConfirmerOp[];
  threshold: number;
}

export interface CreateAccountMsg {
  account: Account;
}

export interface RemoveAccountMsg {
  accountId: AccountId;
}

export interface UpdateAccountMsg {
  accountId: AccountId;
  newAccount: Account;
}

export type EFMsg =
  CreateAccountMsg | RemoveAccountMsg | UpdateAccountMsg | 
  UpdateConfirmersMsg | SetDirMsg | EFSubmitResultsMsg;

// TODO: Allow accessing raw version of a chain as well

export interface EFBlock {
  id: BlockId;
  prevBlockId: BlockId;
  height: number;
  timestamp: Date;
  msgs: EFMsg[];
  state: EFChainState;
}

export interface EFBlockBuilder {
  // Creates an publishes the block
  createBlock(prevBlock: EFBlock, msgs: EFMsg[]): EFBlock;
  // TODO: Version of create block when only prevBlockId is provided
}

export type AccountWithAddress = Required<Account, 'address'>;

export interface EFConstructorArgs {
  confirmers: AccountWithAddress[];
  name: string;
  symbol: string;
  timestamp: Date;
  threshold?: number;
}

export interface EFChain extends RespectChain {
  constructorArgs: EFConstructorArgs;
  builder: EFBlockBuilder;

  blockById(id: BlockId | undefined): Promise<EFBlock>;
  // TODO:
  // blockByNum(num: number): Promise<EFBlock>;
  // TODO: slices
}

export interface IFirmCore {
  createEFChain(args: EFConstructorArgs): Promise<EFChain>;
  getChain(address: Address): Promise<EFChain | undefined>;
}