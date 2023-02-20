// TODO: Rename this file
import { join } from 'path'
import { readFileSync } from 'fs'
import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi'
import { Address } from '@ethereumjs/util'
import { Chain, Common, Hardfork } from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'
import { VM } from '@ethereumjs/vm';
import { buildTransaction, encodeDeployment, encodeFunction } from './txBuilder'
import { getAccountNonce, insertAccount } from './accountUtils'
import { Block } from '@ethereumjs/block'
const solc = require('solc')

const INITIAL_GREETING = 'Hello, World!'
const SECOND_GREETING = 'Hola, Mundo!'

const common = new Common({ chain: Chain.Goerli, hardfork: Hardfork.Merge })
const block = Block.fromBlockData({ header: { extraData: Buffer.alloc(97) } }, { common })
let vm: VM
let accountAddr: Address;
let accountPk: Buffer;


export async function init() {
  accountPk = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex'
  );

  vm = await VM.create({ common })
  accountAddr = Address.fromPrivateKey(accountPk)

  console.log('Account: ', accountAddr.toString())
  await insertAccount(vm, accountAddr)
}

/**
 * This function creates the input for the Solidity compiler.
 *
 * For more info about it, go to https://solidity.readthedocs.io/en/v0.5.10/using-the-compiler.html#compiler-input-and-output-json-description
 *
 * Note: this example additionally needs the Solidity compiler `solc` package (out of EthereumJS
 * scope) being installed. You can do this (in this case it might make sense to install globally)
 * with `npm i -g solc`.
 */
async function getSolcInput(file: string) {
  const path = `contracts/${file}`;
  return fetch(path)
    .then(response => response.text())
    .then((solContent: string) => {
      return {
        language: 'Solidity',
        sources: {
          [path]: {
            content: solContent
          },
          // If more contracts were to be compiled, they should have their own entries here
        },
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: 'petersburg',
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode'],
            },
          },
        },
      };
    });
}

/**
 * This function compiles all the contracts in `contracts/` and returns the Solidity Standard JSON
 * output. If the compilation fails, it returns `undefined`.
 *
 * To learn about the output format, go to https://solidity.readthedocs.io/en/v0.5.10/using-the-compiler.html#compiler-input-and-output-json-description
 */
function compileContract(file: string) {
  const input = getSolcInput(file)
  const output = JSON.parse(solc.compile(JSON.stringify(input)))

  if (output.errors) {
    for (const error of output.errors) {
      if (error.severity === 'error') {
        throw Error(`Compilation of ${file} failed: ${error.formattedMessage}`);
      } else {
        console.warn(error.formattedMessage)
      }
    }
  }

  return output
}

function getDeploymentBytecode(solcOutput: any, contractName: string): any {
  return solcOutput.contracts[`contracts/${contractName}.sol`][contractName].evm.bytecode.object;
}

// TODO: Make generic... Or use generated types
async function deployContract(
  vm: VM,
  senderPrivateKey: Buffer,
  deploymentBytecode: Buffer,
  greeting: string
): Promise<Address> {
  // Contracts are deployed by sending their deployment bytecode to the address 0
  // The contract params should be abi-encoded and appended to the deployment bytecode.
  const data = encodeDeployment(deploymentBytecode.toString('hex'), {
    types: ['string'],
    values: [greeting],
  })
  const txData = {
    data,
    nonce: await getAccountNonce(vm, senderPrivateKey),
  }

  const tx = Transaction.fromTxData(buildTransaction(txData), { common }).sign(senderPrivateKey)

  const deploymentResult = await vm.runTx({ tx, block })

  if (deploymentResult.execResult.exceptionError) {
    throw deploymentResult.execResult.exceptionError
  }

  return deploymentResult.createdAddress!
}

export async function addContract(contractName: string) {
  const solcOutput = compileContract(`${contractName}.sol`);

  const bytecode = getDeploymentBytecode(solcOutput, contractName);

  console.log('Deploying the contract...')

  const contractAddress = await deployContract(vm, accountPk, bytecode, INITIAL_GREETING)

  console.log('Contract address:', contractAddress.toString())

  return contractAddress;
}

async function setGreeting(
  vm: VM,
  senderPrivateKey: Buffer,
  contractAddress: Address,
  greeting: string
) {
  const data = encodeFunction('setGreeting', {
    types: ['string'],
    values: [greeting],
  })

  const txData = {
    to: contractAddress,
    data,
    nonce: await getAccountNonce(vm, senderPrivateKey),
  }

  const tx = Transaction.fromTxData(buildTransaction(txData), { common }).sign(senderPrivateKey)

  const setGreetingResult = await vm.runTx({ tx, block })

  if (setGreetingResult.execResult.exceptionError) {
    throw setGreetingResult.execResult.exceptionError
  }
}

async function getGreeting(vm: VM, contractAddress: Address, caller: Address) {
  const sigHash = new Interface(['function greet()']).getSighash('greet')

  const greetResult = await vm.evm.runCall({
    to: contractAddress,
    caller: caller,
    origin: caller, // The tx.origin is also the caller here
    data: Buffer.from(sigHash.slice(2), 'hex'),
    block,
  })

  if (greetResult.execResult.exceptionError) {
    throw greetResult.execResult.exceptionError
  }

  const results = AbiCoder.decode(['string'], greetResult.execResult.returnValue)

  return results[0]
}

export async function main(contractName: string) {
  const contractAddress = await addContract(contractName);

  console.log('Contract address:', contractAddress.toString())

  const greeting = await getGreeting(vm, contractAddress, accountAddr)

  console.log('Greeting:', greeting)

  if (greeting !== INITIAL_GREETING)
    throw new Error(
      `initial greeting not equal, received ${greeting}, expected ${INITIAL_GREETING}`
    )

  console.log('Changing greeting...')

  await setGreeting(vm, accountPk, contractAddress, SECOND_GREETING)

  const greeting2 = await getGreeting(vm, contractAddress, accountAddr)

  console.log('Greeting:', greeting2)

  if (greeting2 !== SECOND_GREETING)
    throw new Error(`second greeting not equal, received ${greeting2}, expected ${SECOND_GREETING}`)

  // Now let's look at what we created. The transaction
  // should have created a new account for the contract
  // in the state. Let's test to see if it did.

  const createdAccount = await vm.stateManager.getAccount(contractAddress)

  console.log('-------results-------')
  console.log('nonce: ' + createdAccount.nonce.toString())
  console.log('balance in wei: ', createdAccount.balance.toString())
  console.log('storageRoot: 0x' + createdAccount.storageRoot.toString('hex'))
  console.log('codeHash: 0x' + createdAccount.codeHash.toString('hex'))
  console.log('---------------------')

  console.log('Everything ran correctly!')
}
