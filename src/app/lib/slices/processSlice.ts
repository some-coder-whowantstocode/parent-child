import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

export interface processState{

}

const initialState :processState = {

}

const processSlice = createSlice({
    name:"process",
    initialState,
    reducers:{

    }
})

export const {} = processSlice.actions;
export const usePopup = (state:RootState) =>state.proess as processState
export default processSlice.reducer;