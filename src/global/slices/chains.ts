import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AppThunk, type RootState } from '../store.js'
import { type WritableDraft } from 'immer/dist/types/types-external.js'
import { ProgrammingError } from 'firmcore/src/exceptions/ProgrammingError.js'
import type { Address, EFConstructorArgs, NormEFChainPOD, EFMsg, EFBlockPOD, BlockId, EFChainState, IFirmCore, CIDStr, Tag } from 'firmcore'
import fcManager from 'firmcore';
import { InvalidArgument } from 'firmcore/src/exceptions/InvalidArgument.js'
import { NotFound } from 'firmcore/src/exceptions/NotFound.js'
import { waitForInit } from '../initWaiter.js'
import { setStatusAlert } from './status.js'
import anyToStr from 'firmcore/src/helpers/anyToStr.js'
import { setLocation } from './appLocation.js'

export interface ChainPoint {
  cidStr: CIDStr
  name?: string /** name of a chain point */
  data?: NormEFChainPOD
}

export type InitStatus = 'initializing' | 'ready';

export interface Chains {
  byCID: Record<CIDStr, ChainPoint>
  byName: Record<string, CIDStr>
  focus: CIDStr | undefined

  initStatus: InitStatus
  error?: string
}

const initialState: Chains = {
  byCID: {},
  byName: {},
  focus: undefined,

  initStatus: 'initializing',
}

// function _addChain (state: WritableDraft<Chains>, chain: Chain): void {
//   // TODO: Proper validation of address
//   if (chain.address.length !== 0 && (state.byAddress[chain.address] == null)) {
//     state.byAddress[chain.address] = chain
//     if (state.defaultChain === undefined) {
//       state.defaultChain = chain.address
//     }
//   }
// }

export const tagFirmcore = createAsyncThunk(
  'chain/tagFirmcore',
  async (tag: string, { dispatch }): Promise<void> => {
    await fcManager.tag(tag);
  }
)

export const createChain = createAsyncThunk(
  'chains/createChain',
  async (args: EFConstructorArgs, { dispatch }): Promise<ChainPoint> => {
    // TODO: timeout?
    const { fc } = await waitForInit();
    const efChain = await fc.createEFChain(args)
    await dispatch(tagFirmcore(efChain.name)).unwrap();
    const data = await efChain.getNormPODChain()
    const currentTag = fcManager.getCurrentTag();
    if (currentTag === undefined) {
      throw new Error('Expected a current tag to be set');
    }
    return {
      name: efChain.name,
      cidStr: currentTag.cidStr,
      data
    }
  }
)

export interface EFCreateBlockArgs {
  chainCIDStr: CIDStr
  msgs: EFMsg[]
};

export const createBlock = createAsyncThunk(
  'chains/createBlock',
  async (args: EFCreateBlockArgs, { getState, dispatch }): Promise<{ block: EFBlockPOD, newTag: Tag }> => {
    const { fc } = await waitForInit();

    const state = getState() as RootState
    const chain = selectChain(state, args.chainCIDStr)
    const headBl = selectHead(state, args.chainCIDStr)
    if ((chain == null) || (headBl == null)) {
      throw new InvalidArgument('Cannot create a block for unknown chain')
    }

    const efChain = await fc.getChain(chain.address);
    if (efChain == null) {
      throw new NotFound('Firmcore cannot find chain')
    }

    const bl = await efChain.builder.createBlock(headBl.id, args.msgs)

    const pod = await efChain.blockPODById(bl.id)
    if (pod == null) {
      throw new NotFound("Couldn't find block just created")
    }

    await dispatch(tagFirmcore(efChain.name)).unwrap();

    const newTag = fcManager.getCurrentTag();
    if (newTag === undefined) {
      throw new Error('Tag expected');
    }

    return { block: pod, newTag }
  }
)

export interface RefreshChainArgs {
  chainAddress: Address
}

export const updateChain = createAsyncThunk(
  'chains/updateChain',
  async (args: RefreshChainArgs, { dispatch }) => {
    const { fc } = await waitForInit();

    const efChain = await fc.getChain(args.chainAddress)
    if (efChain == null) {
      throw new NotFound('Chain not found')
    }
    const podChain = await efChain.getNormPODChain()

    const newTag = fcManager.getCurrentTag();
    if (newTag === undefined) {
      throw new Error('Tag expected to exist in updateChain');
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    dispatch(setLocation(`/chains/${newTag.cidStr}`));

    return { chainData: podChain, newTag };
  }
)

export interface ConfirmBlockArgs {
  confirmerAddr: Address
  blockId: BlockId
  chainAddress: Address
}

export const confirmBlock = createAsyncThunk(
  'chains/confirmBlock',
  async (args: ConfirmBlockArgs, { dispatch }): Promise<void> => {
    const { fc, confirmer } = await waitForInit();

    if (confirmer.address !== args.confirmerAddr) {
      throw new ProgrammingError('Different confirmer loaded than requrested');
    }

    await confirmer.confirm(args.blockId)

    const chainAddress = args.chainAddress

    const efChain = await fc.getChain(chainAddress);
    if (efChain === undefined) {
      throw new NotFound('chain not found');
    }
    await dispatch(tagFirmcore(efChain.name)).unwrap();

    await dispatch(updateChain({ chainAddress }))
  }
)

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addChainPoint(state, action: PayloadAction<ChainPoint>) {
      const point = action.payload;
      if (Object.hasOwn(state.byCID, point.cidStr)) {
        state.error = 'Chain point with this CID already exists';
        return;
      }
      if (point.name !== undefined && Object.hasOwn(state.byName, point.name)) {
        state.error = 'Chain point with this name already exists';
        return;
      }
      state.byCID[point.cidStr] = point;
      if (point.name !== undefined) {
        state.byName[point.name] = point.cidStr;
      }
      state.error = undefined;
    },

    setFocus(state, action: PayloadAction<CIDStr>) {
      const focus = action.payload;
      if (state.byCID[focus] === undefined) {
        state.error = 'Cannot focus on non-existent chain point';
      } else {
        state.focus = focus;
        state.initStatus = 'ready';
        state.error = undefined;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChain.pending, (state) => {
      })
      .addCase(createChain.fulfilled, (state, action) => {
        const point = action.payload;
        state.byCID[point.cidStr] = point;
        if (point.name !== undefined) {
          state.byName[point.name] = point.cidStr;
        }
        state.focus = point.cidStr;
      })
      .addCase(createChain.rejected, (state) => {
      })

      .addCase(createBlock.fulfilled, (state, action) => {
        const { block, newTag } = action.payload
        const oldCID = state.byName[newTag.name];
        if (oldCID !== undefined) {
          const oldData = state.byCID[oldCID]?.data;

          delete state.byCID[oldCID];
          delete state.byName[newTag.name];

          if (oldData !== undefined) {
            oldData.slots.proposed.push(block);
          }
          state.byCID[newTag.cidStr] = {
            ...newTag,
            data: oldData
          }
          state.byName[newTag.name] = newTag.cidStr;
          state.focus = newTag.cidStr;
        }
      })
      .addCase(updateChain.fulfilled, (state, action) => {
        const { chainData, newTag } = action.payload
        const oldCID = state.byName[newTag.name];
        if (oldCID !== undefined) {
          delete state.byCID[oldCID];
          delete state.byName[newTag.name];

          state.byCID[newTag.cidStr] = {
            ...newTag,
            data: chainData
          }
          state.byName[newTag.name] = newTag.cidStr;
          state.focus = newTag.cidStr;
        }
      })
  }
})

// export const selectDefaultChainAddr = (state: RootState): Address | undefined => state.chains.defaultChain
export const selectChainsPointsByCID = (state: RootState): Record<CIDStr, ChainPoint> => state.chains.byCID;
// Use like this: const chain = useAppSelector(state => selectChain(state, "aaa"))
export const selectChainPoint =
  (state: RootState, cid: CIDStr): ChainPoint | undefined =>
    state.chains.byCID[cid];

export const selectChain =
  (state: RootState, cid: CIDStr): NormEFChainPOD | undefined => {
    const point = selectChainPoint(state, cid);
    return point?.data;
  }

export const selectFocusChainPoint =
  (state: RootState): ChainPoint | undefined => {
    if (state.chains.focus !== undefined) {
      return state.chains.byCID[state.chains.focus];
    } else {
      return undefined;
    }
  }

export const selectFocusChain =
  (state: RootState): NormEFChainPOD | undefined =>
    selectFocusChainPoint(state)?.data;

// export const selectDefaultChain = (state: RootState): Chain | undefined => {
//   const defAddress = selectDefaultChainAddr(state)
//   if (defAddress !== undefined) {
//     return selectChain(state, defAddress)
//   } else {
//     return undefined
//   }
// }

export const selectHead = (state: RootState, cid: CIDStr): EFBlockPOD | undefined => {
  const point = state.chains.byCID[cid];
  if (point !== undefined) {
    return point.data?.slots.finalizedBlocks[point.data?.slots.finalizedBlocks.length - 1];
  } else {
    return undefined;
  }
}

export const selectChainName = (state: RootState, cidStr: CIDStr): string | undefined =>
  (selectChain(state, cidStr))?.name

export const selectChainState = (state: RootState, chainAddr: Address): EFChainState | undefined => {
  return (selectHead(state, chainAddr))?.state
}

export const selectInitStatus = (state: RootState): InitStatus =>
  state.chains.initStatus;

// export const { setStatusAlert, unsetAlert } = statusSlice.actions
export const { addChainPoint, setFocus } = chainsSlice.actions;

export const init =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const { fc } = await waitForInit();
      const tags = await fcManager.getTagsByName(true);
      const pointsByCID: Record<CIDStr, ChainPoint> = {}
      for (const tag of Object.values(tags)) {
        pointsByCID[tag.cidStr] = {
          name: tag.name,
          cidStr: tag.cidStr
        }
      }

      const chainAddr = (await fc.lsChains())[0];
      let focus: CIDStr | undefined;
      if (chainAddr !== undefined) {
        const efChain = await fc.getChain(chainAddr);
        if (efChain === undefined) {
          throw new ProgrammingError('Expected to find chain');
        }
        const chainData = await efChain.getNormPODChain();
        const currentTag = fcManager.getCurrentTag();
        if (currentTag === undefined) {
          throw new ProgrammingError('Expected to find tag');
        }
        focus = currentTag.cidStr;
        const currentPoint = pointsByCID[focus];
        if (currentPoint === undefined) {
          throw new ProgrammingError('Expected to find chain point');
        }
        currentPoint.data = chainData;
      }

      for (const point of Object.values(pointsByCID)) {
        dispatch(addChainPoint(point));
      }
      if (focus !== undefined) {
        dispatch(setFocus(focus));
      }
    } catch (err: any) {
      const errStr = anyToStr(err);
      // TODO: why does it complain
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const str = `Failed initializing chains: ${errStr}`;
      console.error(str);
      dispatch(setStatusAlert({
        status: 'error',
        msg: str
      }));
    }
  }

export default chainsSlice.reducer
