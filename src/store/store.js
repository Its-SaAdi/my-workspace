import { configureStore } from "@reduxjs/toolkit";
import windowReducers from '../features/windows/windowSlice';

export const store = configureStore({
    reducer: {
        win: windowReducers,
    },
});