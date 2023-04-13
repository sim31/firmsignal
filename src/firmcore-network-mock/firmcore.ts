import { Required } from 'utility-types';
import { AccountSystemImpl, AccountSystemImpl__factory, AccountValue, BlockIdStr, ConfirmerOpValue, EdenPlusFractal, EdenPlusFractal__factory, FirmChain, FirmChainAbi, FirmChainAbi__factory, FirmChainImpl, FirmChainImpl__factory, GenesisBlock, IPFSLink, OptExtendedBlock, OptExtendedBlockValue, ZeroId } from "firmcontracts/interface/types";
import { IFirmCore, EFChain, EFConstructorArgs, Address, Account, BlockId, EFBlock, EFMsg } from "../ifirmcore/ifirmcore";
import ganache from "ganache";
import { ethers } from "ethers";
import { createAddConfirmerOp, createGenesisBlockVal } from "firmcontracts/interface/firmchain";
import { getBlockId, randomBytes32, randomBytes32Hex } from "firmcontracts/interface/abi";
import { timestampToDate } from '../helpers/date';


let abiLib: Promise<FirmChainAbi>;
let implLib: Promise<FirmChainImpl>;
let accSystemLib: Promise<AccountSystemImpl>;

interface Chain {
  contract: EdenPlusFractal;
  constructorArgs: EFConstructorArgs;
  genesisBlId: BlockIdStr;
  headBlockId: BlockIdStr;
}
const chains: Record<Address, Chain> = {};
const blocks: Record<BlockId, OptExtendedBlockValue> = {}
const blockNums: Record<BlockId, number> = {}
const msgs: Record<BlockId, EFMsg[]> = {};
const fullAccounts: Record<IPFSLink, Account> = {};

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

async function deployAccountSystemImpl() {
  const factory = new AccountSystemImpl__factory(signer);
  return (await (await factory.deploy({ gasLimit: 9552000 })).deployed());
}

async function deployEFChain(
  fchainImpl: FirmChainImpl,
  accSystemImpl: AccountSystemImpl,
  args: Required<EFConstructorArgs, 'threshold'>,
) {
  const factory = new EdenPlusFractal__factory({
    ["contracts/FirmChainImpl.sol:FirmChainImpl"]: fchainImpl.address,
    ["contracts/AccountSystemImpl.sol:AccountSystemImpl"]: accSystemImpl.address,
  }, signer);

  const confs: AccountValue[] = args.confirmers.map((conf) => {
    const metadataId = randomBytes32Hex();
    fullAccounts[metadataId] = conf;
    return {
      addr: conf.address,
      metadataId,
    }
  });
  const confOps = confs.map(conf => {
    return createAddConfirmerOp(conf.addr, 1);
  });

  const genesisBl = await createGenesisBlockVal([], ZeroId, confOps, args.threshold);

  const contract = await factory.deploy(
    genesisBl,
    confs,
    args.threshold,
    args.name, args.symbol,
    { gasLimit: 9552000 }
  );

  genesisBl.contract = contract.address;

  return { contract: await contract.deployed(), genesisBl };

}

async function init() {
  abiLib = deployAbi();
  const abiC = await abiLib;
  console.log("Abi deployed: ", abiC.address);
  implLib = deployFirmChainImpl(abiC);
  const implLibC = await implLib;
  console.log("ImplLib deployed", implLibC.address);
  accSystemLib = deployAccountSystemImpl();
  console.log("Account system deployed: ", (await accSystemLib).address);
}

async function waitForInit() {
  return {
    abiLib: await abiLib,
    implLib: await implLib,
    accSystemLib: await accSystemLib,
  };
}

async function getDelegate(
  chain: Chain,
  weekIndex: number, roomNumber: number
) {
  return await chain.contract.getDelegate(weekIndex, roomNumber);
} 

async function getDelegates(
  chain: Chain, weekIndex: number
) {
  return await chain.contract.getDelegates(weekIndex);
}

// TODO:
// * Take name of a contract function
function getStateAccessFunc<F>(f: F, chain: Chain, blockId: BlockId) {
  const rf: F = 
  const headId = await chain.contract.getHead();
  if (headId === blockId) {
        
  }
}

export class FirmCore implements IFirmCore {
  async createEFChain(args: EFConstructorArgs): Promise<EFChain> {
    // TODO: Construct EFConstructorArgsFull from args
    let nargs: Required<EFConstructorArgs, 'threshold'>;
    if (args.threshold) {
      if (Number.isNaN(args.threshold) || args.threshold <= 0) {
        throw new Error('Threshold has to be number > 0');
      }
      nargs = { ...args, threshold: args.threshold };
    } else {
      const sumWeight = args.confirmers.length;
      const threshold = Math.ceil((sumWeight * 2) / 3) + 1;
      nargs = { ...args, threshold };
    }

    const cs = await waitForInit();

    const { contract, genesisBl } = await deployEFChain(cs.implLib, cs.accSystemLib, nargs);

    const bId = getBlockId(genesisBl.header);
    blocks[bId] = genesisBl;
    blockNums[bId] = 0;
    msgs[bId] = [];
    chains[contract.address] = {
      contract,
      constructorArgs: args,
      headBlockId: bId,
      genesisBlId: bId,
    };
  }

  async getChain(address: Address): Promise<EFChain | undefined> {
    const chain = chains[address];
    if (!chain) {
      return undefined;
    }
    const blockById: (id: BlockId) => Promise<EFBlock | undefined> = (id: BlockId) => {
      const block = blocks[id];
      const height = blockNums[id];
      const messages = msgs[id];
      if (!block || !height || !messages) {
        return undefined;
      }

      const r: EFBlock = {
        id,
        prevBlockId: ethers.utils.hexlify(block.header.prevBlockId),
        height,
        timestamp: timestampToDate(block.header.timestamp),
        msgs: messages, 
        state: {
          getDelegate: (weekIndex: number, roomNumber: number) {


          }
        }


      }


            
    }
  }
}