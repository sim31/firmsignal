import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { 
  AddressStr, ConfirmerValue, BlockIdStr, OptExtendedBlock, OptExtendedBlockValue, Account,
} from "firmcontracts/interface/types";
import { FirmChainConstrArgs, initFirmChain } from "../../contracts/contracts";
import { AppThunk, RootState } from "../store";
import { Chain,} from "../types";
import { WritableDraft } from 'immer/dist/types/types-external';
import { getConfirmers } from 'firmcontracts/interface/firmchain';
import { getBlockId } from "firmcontracts/interface/abi";
import assert from '../../helpers/assert';
import { BytesLike, utils } from "ethers";

interface FullChain extends Chain {
  blocks: {
    byId: Record<BlockIdStr, OptExtendedBlockValue>;
    byBlockNum: OptExtendedBlockValue[];
  }
}

export interface Chains {
  byAddress: Record<AddressStr, FullChain>;
  defaultChain?: AddressStr;
  status: 'idle' | 'loading' | 'success' | 'failed';
  error?: string;
}

const initialState: Chains = {
  byAddress: {},
  status: 'idle',
}

function _addChain(state: WritableDraft<Chains>, chain: FullChain) {
  // TODO: Proper validation of address
  if (chain.address.length && !state.byAddress[chain.address]) {
    state.byAddress[chain.address] = chain;
    if (!state.defaultChain) {
      state.defaultChain = chain.address;
    }
  }
}

export const initChain = createAsyncThunk(
  'chains/initChain',
  async (args: FirmChainConstrArgs): Promise<FullChain> => {
    const { contract: chain, genesisBl } = await initFirmChain(args);
    const genesisBlockId = getBlockId(genesisBl.header);
    const genesisBlFull = {
      ...genesisBl,
      state: {
        ...genesisBl.state,
        name: args.name?.length ? args.name : undefined,
        accounts: args.accounts,
      }
    };
    return {
      address: chain.address,
      genesisBlockId,
      headBlockId: genesisBlockId,
      blocks: {
        byId: {
          [genesisBlockId]: genesisBlFull,
        },
        byBlockNum: [genesisBlFull],
      },
    };
  }
);


export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addChain: (state, action: PayloadAction<Chain>) => {
      _addChain(state, {
        ...action.payload,
        blocks: {
          byId: {},
          byBlockNum: [],
        },
      });
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


export const selectHead = (state: RootState, chainAddr: AddressStr) => {
  const chain = state.chains.byAddress[chainAddr];
  return chain && chain.blocks.byId[chain.headBlockId];
}

export const selectChainState = (state: RootState, chainAddr: AddressStr) => {
  return (selectHead(state, chainAddr))?.state;
}

export const selectSlice = (
  state: RootState,
  chainAddr: AddressStr,
  start?: number,
  end?: number,
) => {
  const chain = state.chains.byAddress[chainAddr];
  return chain && chain.blocks.byBlockNum.slice(start, end);
}

export default chainsSlice.reducer;