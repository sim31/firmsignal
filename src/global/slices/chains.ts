import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { WritableDraft } from 'immer/dist/types/types-external';
import assert from '../../helpers/assert';
import { BytesLike, utils } from "ethers";
import firmcore from "../firmcore-injection";
import { BlockId, EFBlock, EFChain, EFConstructorArgs } from "../../ifirmcore";
import { Address } from "../../iwallet";
import ProgrammingError from "../../exceptions/ProgrammingError";

interface FullChain extends EFChain {
  blocks: {
    byId: Record<BlockId, EFBlock>;
    byBlockNum: EFBlock[];
  }
}

export interface Chains {
  byAddress: Record<Address, FullChain>;
  defaultChain?: Address;
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

export const createChain = createAsyncThunk(
  'chains/createChain',
  async (args: EFConstructorArgs): Promise<FullChain> => {
    const efChain = await firmcore.createEFChain(args);
    const genesisBlockId = efChain.genesisBlockId;
    const genesisBl = await efChain.blockById(genesisBlockId);
    if (!genesisBl) {
      throw new ProgrammingError("Chain created, but not genesis block");
    }

    return {
      ...efChain,
      blocks: {
        byId: {
          [genesisBlockId]: genesisBl,
        },
        byBlockNum: [genesisBl],
      }
    };
  }
);


export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // addChain: (state, action: PayloadAction<Chain>) => {
    //   _addChain(state, {
    //     ...action.payload,
    //     blocks: {
    //       byId: {},
    //       byBlockNum: [],
    //     },
    //   });
    // },
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

export const selectDefaultChainAddr = (state: RootState) => state.chains.defaultChain;
export const selectChainsByAddress = (state: RootState) => state.chains.byAddress;
// Use like this: const chain = useAppSelector(state => selectChain(state, "aaa"))
export const selectChain = (state: RootState, address: Address): FullChain | undefined =>
  state.chains.byAddress[address];

export const selectHead = (state: RootState, chainAddr: Address) => {
  const chain = state.chains.byAddress[chainAddr];
  return chain && chain.blocks.byId[chain.headBlockId];
}

export const selectChainName = (state: RootState, address: Address): string | undefined =>
  (selectChain(state, address))?.name;


export const selectChainState = (state: RootState, chainAddr: Address) => {
  return (selectHead(state, chainAddr))?.state;
}

export const selectSlice = (
  state: RootState,
  chainAddr: Address,
  start?: number,
  end?: number,
) => {
  const chain = state.chains.byAddress[chainAddr];
  return chain && chain.blocks.byBlockNum.slice(start, end);
}

export default chainsSlice.reducer;
