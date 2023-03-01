import { unstable_getNormalizedScrollLeft } from "@mui/utils";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { StatusAlert } from "../types";

export interface Status {
  alert: StatusAlert;
  alertNum: number;
}

const initialState: Status = {
  alert: {
    msg: '',
    status: 'none'
  },
  alertNum: 0,
};

export const statusSlice = createSlice({
  name: 'status',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setStatusAlert(state, action: PayloadAction<StatusAlert>) {
      state.alertNum++;
      state.alert = action.payload;
    },
    unsetAlert(state) {
      state.alert.status = 'none';
    }
  },
});

export const { setStatusAlert, unsetAlert } = statusSlice.actions;

export const selectStatusAlert = (state: RootState) => state.status.alert;
const selectAlertNum = (state: RootState) => state.status.alertNum;

export const setTimedAlert =
  (alert: StatusAlert, ms: number): AppThunk =>
  async (dispatch, getState) => {
    const num = selectAlertNum(getState());
    dispatch(setStatusAlert(alert));
    setTimeout(() => {
      const currentNum = selectAlertNum(getState());
      if (currentNum === num + 1) {
        dispatch(unsetAlert());
      }
    }, ms);
  };


export default statusSlice.reducer;