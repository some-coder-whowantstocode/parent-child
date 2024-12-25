import { configureStore } from '@reduxjs/toolkit'
import popupReducer from './lib/slices/popupSlice'
import {enableMapSet} from 'immer';
import authReducer from './lib/slices/authSlice';

enableMapSet()

export const makeStore = () => {
  return configureStore({
    reducer: {
        popup:popupReducer,
        auth:authReducer
    }
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']