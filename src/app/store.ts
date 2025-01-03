// store.js or store.ts
import { configureStore } from '@reduxjs/toolkit';
import popupReducer from './lib/slices/popupSlice';
import authReducer from './lib/slices/authSlice';
import processReducer from './lib/slices/processSlice';
import { enableMapSet } from 'immer';

enableMapSet();

const store = configureStore({
  reducer: {
    popup: popupReducer,
    auth: authReducer,
    process: processReducer
  },
});

export default store; // Export the store instance

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
