import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AddressStr, ConfirmerValue, BlockIdStr, OptExtendedBlock, OptExtendedBlockValue, OptExtendedBlockValueN } from "firmcontracts/interface/types";
import { FirmChainConstrArgs, initFirmChain } from "../../contracts/contracts";
import { AppThunk, RootState } from "../store";
import { Chain, FullConfirmer } from "../types";
import { WritableDraft } from 'immer/dist/types/types-external';
import { getConfirmers } from 'firmcontracts/interface/firmchain';
import { getBlockId } from "firmcontracts/interface/abi";
import assert from '../../helpers/assert';
import ethers, { BytesLike } from "ethers";

export interface Chains {
  byAddress: Record<AddressStr, Chain>;
  defaultChain?: AddressStr;
  status: 'idle' | 'loading' | 'success' | 'failed';
  error?: string;
}

const initialState: Chains = {
  byAddress: {},
  status: 'idle',
}

export const initChain = createAsyncThunk(
  'chains/initChain',
  async (args: FirmChainConstrArgs): Promise<Chain> => {
    const { contract: chain, genesisBl } = await initFirmChain(args);
    const confirmers = await getConfirmers(chain);
    const threshold = await chain.getThreshold();
    const fullConfirmers: (ConfirmerValue | FullConfirmer)[] =
      confirmers.map((conf) =>
        args.confirmers.find(c => c.addr === conf.addr) ?? conf);
    const genesisBlockId = getBlockId(genesisBl.header);
    return {
      address: chain.address,
      confirmers: fullConfirmers,
      threshold,
      name: args.name?.length ? args.name : undefined,
      genesisBlockId,
      headBlockId: genesisBlockId,
      blocks: {
        [genesisBlockId]: { ...genesisBl, num: 1 }
      },
    };
  }
);

function _addChain(state: WritableDraft<Chains>, chain: Chain) {
  // TODO: Proper validation of address
  if (chain.address.length && !state.byAddress[chain.address]) {
    state.byAddress[chain.address] = chain;
    if (!state.defaultChain) {
      state.defaultChain = chain.address;
    }
  }
}

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addChain: (state, action: PayloadAction<Chain>) => {
      _addChain(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initChain.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initChain.fulfilled, (state, action) => {
        state.status = 'success';
        _addChain(state, action.payload);
      })
      .addCase(initChain.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { addChain } = chainsSlice.actions;

export const selectDefaultChain = (state: RootState) => state.chains.defaultChain;
export const selectChainsByAddress = (state: RootState) => state.chains.byAddress;
// Use like this: const chain = useAppSelector(state => selectChain(state, "aaa"))
export const selectChain = (state: RootState, address: AddressStr): Chain | undefined =>
  state.chains.byAddress[address];

export function getLatestBlocks(chain: Chain, num: number) {
  let nextId: BytesLike | undefined = chain.headBlockId;
  const blocks: OptExtendedBlockValueN[] = []
  let count = 0;
  while (nextId && count < num) {
    const idStr = ethers.utils.hexlify(nextId);
    const bl: OptExtendedBlockValueN | undefined = chain.blocks[idStr];
    if (bl) {
      blocks.push(bl);
      nextId = bl.header.prevBlockId;
    }
    count++;
  }
  return blocks;
}


export default chainsSlice.reducer;