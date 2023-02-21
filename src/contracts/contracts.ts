// TODO: Rename this file
import ganache from 'ganache';
import { ethers, utils, }  from 'ethers';
import { Block, BlockHeader, Call, Confirmer, ConfirmerOp, ZeroId } from 'firmcontracts/interface-helpers/types'
import { getBlockBodyId, getConfirmerSetId } from 'firmcontracts/interface-helpers/abi';
import { createAddConfirmerOps } from 'firmcontracts/interface-helpers/firmchain';

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
