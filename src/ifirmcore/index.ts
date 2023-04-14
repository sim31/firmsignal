import { Required } from 'utility-types';
import { IWallet } from '../iwallet';

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

export interface ConfirmationStatus {
  currentWeight: number,
  potentialWeight: number,
  threshold: number,
  final: boolean;
}

export interface ChainState {
  confirmerSet: ConfirmerSet;
  confirmations: () => Promise<Address[]>;
  confirmationStatus: () => Promise<ConfirmationStatus>;
}

export interface RespectChain extends Chain {
  name: string;
  symbol: string;
}

export interface DirectoryState extends ChainState {
  directoryId(): Promise<IPFSLink | undefined>;
  // TODO: Function to get the actual directory
}

export type ExtAccountMap = Record<PlatformId, PlatformAccountId>; 

export interface Account {
  id: AccountId;
  address?: Address;
  name?: string;
  extAccounts: ExtAccountMap;
}

export interface FirmAccountSystemState extends ChainState {
  accountById(id: AccountId): Promise<Account | undefined>;  
  accountByAddress(address: Address): Promise<Account | undefined>;
}

export interface RespectState extends FirmAccountSystemState {
  balance(id: AccountId): Promise<TokenBalance>;
  balanceByAddr(address: Address): Promise<TokenBalance>;
  totalSupply(): Promise<TokenBalance>;
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
  delegate(weekIndex: number, roomNumber: number): Promise<AccountId | undefined>;
  delegates(weekIndex: number): Promise<AccountId[] | undefined>;
}

export interface Msg {
  readonly name: string;
}

export interface EFSubmitResultsMsg extends Msg {
  readonly name: 'efSubmitResults';
  results: EFBreakoutResults[];
}

export interface SetDirMsg extends Msg {
  readonly name: 'setDir';
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

export interface UpdateConfirmersMsg extends Msg {
  readonly name: 'updateConfirmers';
  ops: ConfirmerOp[];
  threshold: number;
}

export interface CreateAccountMsg extends Msg {
  readonly name: 'createAccount';
  account: Account;
}

export interface RemoveAccountMsg extends Msg {
  readonly name: 'removeAccount';
  accountId: AccountId;
}

export interface UpdateAccountMsg extends Msg {
  readonly name: 'updateAccount';
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
  createBlock(prevBlockId: BlockId, msgs: EFMsg[]): Promise<EFBlock>;
}

export interface BlockConfirmer {
  confirm(blockId: BlockId): Promise<void>;
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

  blockById(id: BlockId): Promise<EFBlock | undefined>;
  // TODO:
  // blockByNum(num: number): Promise<EFBlock>;
  // TODO: slices
}

export interface IFirmCore<SigType> {
  createEFChain(args: EFConstructorArgs): Promise<EFChain>;
  getChain(address: Address): Promise<EFChain | undefined>;
  createWalletConfirmer(wallet: IWallet<SigType>): Promise<BlockConfirmer>;
}