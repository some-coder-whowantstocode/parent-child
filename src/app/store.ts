// store.js or store.ts
import { configureStore } from '@reduxjs/toolkit';
import popupReducer from './lib/slices/popupSlice';
import authReducer from './lib/slices/authSlice';
import { enableMapSet } from 'immer';

enableMapSet();

const store = configureStore({
  reducer: {
    popup: popupReducer,
    auth: authReducer,
  },
});

export default store; // Export the store instance

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
