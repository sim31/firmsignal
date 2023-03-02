// TODO: Rename this file
import ganache from 'ganache';
import { BytesLike, ethers, utils, }  from 'ethers';
import {
  Block, BlockHeader, Message, Confirmer, ConfirmerOp, ZeroId, AddressStr,
  FirmChain, FirmChainAbi, FirmChainImpl, IFirmChain, IssuedNTT, Directory,
  FirmChain__factory, FirmChainAbi__factory, FirmChainImpl__factory,
  Directory__factory, IssuedNTT__factory, ZeroAddr, BlockValue, GenesisBlockValue,
} from 'firmcontracts/interface/types'
import { getBlockBodyId, getConfirmerSetId } from 'firmcontracts/interface/abi';
import { createAddConfirmerOp, createAddConfirmerOps, createGenesisBlock, createGenesisBlockVal } from 'firmcontracts/interface/firmchain';
import { FullConfirmer } from '../global/types';
import { createAdd, isCallChain } from 'typescript';
import { callbackify } from 'util';

let abiLib: Promise<FirmChainAbi>;
let implLib: Promise<FirmChainImpl>;
let directory: Promise<Directory>
const firmChains: Record<AddressStr, FirmChain> = {};

const ganacheProv = ganache.provider({
  fork: {
    network: 'goerli'
  },
});

const provider = new ethers.providers.Web3Provider(ganacheProv as any);
const signer = provider.getSigner(0);

init();

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

  let genesisBl = args.genesisBl;
  if (!genesisBl) {
    genesisBl = await createGenesisBlockVal([], confOps, args.threshold);
  }

  const contract = await factory.deploy(genesisBl, confOps, args.threshold, { gasLimit: 9552000 });

  genesisBl.contract = contract.address;

  return { contract: await contract.deployed(), genesisBl };
}

// TODO: specify type as well
export type FirmChainConstrArgs = {
  confirmers: FullConfirmer[],
  threshold: number,
  name?: string,
  genesisBl?: GenesisBlockValue,
};

async function init() {
  abiLib = deployAbi();
  const abiC = await abiLib;
  console.log("Abi deployed: ", abiC.address);
  implLib = deployFirmChainImpl(abiC);
  const implLibC = await abiLib;
  console.log("ImplLib deployed", implLibC.address);
  directory = deployDirectory();
  const directoryC = await directory;
  console.log("Directory deployed", directoryC.address);
}

async function waitForInit() {
  return {
    abiLib: await abiLib,
    implLib: await implLib,
    directory: await directory,
  };
}

export async function initFirmChain(args: FirmChainConstrArgs) {
  const cs = await waitForInit();
  
  const depl = await deployFirmChain(
    cs.implLib,
    args
  );

  console.log("Firmchain deployed: ", depl.contract);

  firmChains[depl.contract.address] = depl.contract;

  return depl;
}

export function getFirmChain(address: AddressStr) {
  return firmChains[address];
}
