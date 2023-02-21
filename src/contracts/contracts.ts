// TODO: Rename this file
import ganache from 'ganache';
import { ethers, utils, BytesLike, BigNumberish } from 'ethers';
import { BlockHeaderStruct, BlockStruct, CallStruct, ConfirmerStruct, SignatureStruct,  } from 'firmcontracts/typechain-types/FirmChainAbi';
import { ConfirmerOpStruct } from 'firmcontracts/typechain-types/FirmChain';

type ConfirmerOp = ConfirmerOpStruct;

export type Confirmer = ConfirmerStruct;
export type Block = BlockStruct;
export type BlockHeader = BlockHeaderStruct;
export type Call = CallStruct;
export type Signature = SignatureStruct;

const ConfirmerOpId = {
  Add: 0,
  Remove: 1
} as const;

export const ZeroId = ethers.constants.HashZero;
export const ZeroAddr = ethers.constants.AddressZero;

function createAddConfirmerOps(confs: Confirmer[]): ConfirmerOp[] {
  return confs.map(conf => { return {opId:  ConfirmerOpId.Add, conf} });
}

export function encodeBlockBody(calls: readonly Call[]): BytesLike {
  const coder = utils.defaultAbiCoder;
  return coder.encode(["tuple(address addr, bytes cdata)[]"], [calls]);
}

export function getBlockBodyId(calls: Call[]): string;
export function getBlockBodyId(block: Block): string;
export function getBlockBodyId(callsOrBlock: Block | Call[]): string {
  let encBody: BytesLike =  ""; 
  if (Array.isArray(callsOrBlock)) {
    encBody = encodeBlockBody(callsOrBlock);
  } else {
    encBody = encodeBlockBody(callsOrBlock.calls);
  }
  return utils.keccak256(encBody);
}

export async function encodeConfirmer(conf: Confirmer): Promise<BytesLike> {
  const bytes = utils.hexConcat(
    [utils.zeroPad("0x00", 11),
    await Promise.resolve(conf.addr),
    [Number((await Promise.resolve(conf.weight)).toString())]
  ]);
  // expect(bytes.length).to.equal(66);
  return bytes;
}

export async function getConfirmerSetId(confs: Confirmer[], threshold: number): Promise<string> {
  let packedConfs: BytesLike[] = [];
  for (const c of confs) {
    packedConfs.push(await encodeConfirmer(c));
  }
  return utils.solidityKeccak256(["uint8", "bytes32[]"], [threshold, packedConfs]);
}

const ganacheProv = ganache.provider({
  fork: {
    network: 'goerli'
  }
});

const provider = new ethers.providers.Web3Provider(ganacheProv as any);

function linkLibraries(
  {
    bytecode,
    linkReferences,
  }: {
    bytecode: string
    linkReferences: { [fileName: string]: { [contractName: string]: { length: number; start: number }[] } }
  },
  libraries: { [libraryName: string]: string }
): string {
  Object.keys(linkReferences).forEach((fileName) => {
    Object.keys(linkReferences[fileName]).forEach((contractName) => {
      if (!libraries.hasOwnProperty(contractName)) {
        throw new Error(`Missing link library name ${contractName}`)
      }
      const address = utils.getAddress(libraries[contractName]).toLowerCase().slice(2)
      linkReferences[fileName][contractName].forEach(({ start: byteStart, length: byteLength }) => {
        const start = 2 + byteStart * 2
        const length = byteLength * 2
        bytecode = bytecode
          .slice(0, start)
          .concat(address)
          .concat(bytecode.slice(start + length, bytecode.length))
      })
    })
  })
  return bytecode
}

async function deployAbi() {
  const path = 'contract-artifacts/contracts/FirmChainAbi.sol/FirmChainAbi.json';

  const resp = await fetch(path);
  const obj = await resp.json();
  const keys = Object.keys(obj);
  if (!keys.includes('bytecode') || !keys.includes('abi')) {
    throw new Error("Contract json has to include bytecode and abi fields")
  }

  const signer = provider.getSigner(0);
  const factory = new ethers.ContractFactory(obj['abi'], obj['bytecode'], signer);

  const contract = await factory.deploy({ gasLimit: 9552000 });

  console.log("Abi contract: ", contract);

  return contract;
}


async function deployFirmChainImpl(abiContr: ethers.Contract) {
  const path = 'contract-artifacts/contracts/FirmChainImpl.sol/FirmChainImpl.json';

  const resp = await fetch(path);
  const obj = await resp.json();
  const keys = Object.keys(obj);
  if (!keys.includes('bytecode') || !keys.includes('abi')) {
    throw new Error("Contract json has to include bytecode and abi fields")
  }

  const bytecode = linkLibraries(obj, { FirmChainAbi: abiContr.address });

  const factory = new ethers.ContractFactory(obj['abi'], bytecode, provider.getSigner(0));

  const contract = await factory.deploy({ gasLimit: 9552000 });

  console.log("FirmChainImpl contract: ", contract);

  return contract;
}

async function deployFirmChain(impl: ethers.Contract) {
  const path = 'contract-artifacts/contracts/FirmChain.sol/FirmChain.json';

  const resp = await fetch(path);
  const obj = await resp.json();
  const keys = Object.keys(obj);
  if (!keys.includes('bytecode') || !keys.includes('abi')) {
    throw new Error("Contract json has to include bytecode and abi fields")
  }

  const bytecode = linkLibraries(obj, { FirmChainImpl: impl.address });

  const factory = new ethers.ContractFactory(obj['abi'], bytecode, provider.getSigner(0));

  const signers = [
    provider.getSigner(0), provider.getSigner(1), provider.getSigner(2),
    provider.getSigner(3), provider.getSigner(4),
  ];

  const confs: Confirmer[] = [
    {
      addr: signers[0].getAddress(),
      weight: 1
    },
    {
      addr: signers[1].getAddress(),
      weight: 1
    },
    {
      addr: signers[2].getAddress(),
      weight: 1
    },
    {
      addr: signers[3].getAddress(),
      weight: 1
    }
  ];
  const threshold = 3;
  const confSetId = await getConfirmerSetId(confs, threshold);
  const confOps: ConfirmerOp[] = createAddConfirmerOps(confs);

  const calls: Call[] = []
  const bodyId = getBlockBodyId(calls);

  const header: BlockHeader = {
    prevBlockId: ZeroId,
    blockBodyId: bodyId,
    confirmerSetId: confSetId,
    timestamp: 0,
    sigs: []
  };

  const genesisBl: Block = {
    header,
    calls
  };


  const contract = await factory.deploy(genesisBl, confOps, threshold, { gasLimit: 9552000 });

  console.log("FirmChain contract: ", contract);

  return contract;
}

export async function addContract(contractName: string) {
  const abiContr = await deployAbi();
  const firmChainImpl = await deployFirmChainImpl(abiContr);
  const firmChain = await deployFirmChain(firmChainImpl);
}

export async function main() {
  await addContract('test');
}
