// TODO: Rename this file
import ganache from 'ganache';
import { ethers, utils, }  from 'ethers';
import {
  Block, BlockHeader, Message, Confirmer, ConfirmerOp, ZeroId, AddressStr,
  FirmChain, FirmChainAbi, FirmChainImpl, IFirmChain, IssuedNTT, Directory,
  FirmChain__factory, FirmChainAbi__factory, FirmChainImpl__factory,
  Directory__factory, IssuedNTT__factory, ZeroAddr,
} from 'firmcontracts/interface/types'
import { getBlockBodyId, getConfirmerSetId } from 'firmcontracts/interface/abi';
import { createAddConfirmerOp, createAddConfirmerOps, createGenesisBlock } from 'firmcontracts/interface/firmchain';
import { FullConfirmer } from '../global/types';
import { createAdd } from 'typescript';

let abiLib: FirmChainAbi | undefined = undefined;
let implLib: FirmChainImpl | undefined = undefined;
let directory: Directory | undefined = undefined;
const firmChains: Record<AddressStr, FirmChain> = {};

const ganacheProv = ganache.provider({
  fork: {
    network: 'goerli'
  }
});

const provider = new ethers.providers.Web3Provider(ganacheProv as any);
const signer = provider.getSigner(0);

// libraryName -> library_contract_address
type LibraryLinkRefs = Record<string, string>;

async function deployAbi() {
  const factory = new FirmChainAbi__factory(signer);
  return (await (await factory.deploy({ gasLimit: 9552000 })).deployed());
}

async function deployFirmChainImpl(abiContr: FirmChainAbi) {
  const factory = new FirmChainImpl__factory({
    ["contracts/FirmChainAbi.sol:FirmChainAbi"]: abiContr.address
  }, signer);
  return (await (await factory.deploy({ gasLimit: 9552000 })).deployed());
}

async function deployNTTContract(name: string, symbol: string, issuer: AddressStr) {
  const factory = new IssuedNTT__factory(signer);
  return (await (await factory.deploy(name, symbol, issuer)).deployed());
}

async function deployDirectory() {
  const factory = new Directory__factory(signer);
  return (await (await factory.deploy({ gasLimit: 9552000 })).deployed());
}

async function deployFirmChain(impl: FirmChainImpl, args: FirmChainConstrArgs) {
  const factory = new FirmChain__factory({
    ["contracts/FirmChainImpl.sol:FirmChainImpl"]: impl.address
  }, signer);

  // TODO: current timestamp
  const confOps: ConfirmerOp[] = args.confirmers.map((conf) => {
    return createAddConfirmerOp(conf);
  });

  const genesisBl = await createGenesisBlock([], confOps, args.threshold);

  const contract = await factory.deploy(genesisBl, confOps, args.threshold, { gasLimit: 9552000 });

  return contract.deployed();
}

export type FirmChainConstrArgs = {
  confirmers: FullConfirmer[],
  threshold: number,
};


export async function init() {
  abiLib = await deployAbi();
  console.log("Abi deployed: ", abiLib.address);
  implLib = await deployFirmChainImpl(abiLib);
  console.log("ImplLib deployed", implLib.address);
  directory = await deployDirectory();
  console.log("Directory deployed", directory.address);
}

export async function newFirmChain(args: FirmChainConstrArgs) {
  if (!implLib || !directory || !abiLib) {
    await init();
  }
  const firmChain = await deployFirmChain(
    implLib as FirmChainImpl, // If we are here, init did not throw and had to assign implLib
    args
  );

  console.log("Firmchain deployed: ", firmChain);

  firmChains[firmChain.address] = firmChain;

  const confirmers = await firmChain.getConfirmers();
  console.log("Confirmers: ", confirmers);

  return firmChain.address;
}

