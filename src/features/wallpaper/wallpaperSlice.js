import { createSlice } from "@reduxjs/toolkit"

const initialValue = {
    wallpaperId: "lofi-bg"
}

const wallpaperSlice = createSlice({
    name: "wallpaper",
    initialState: initialValue,
    reducers: {
        // Sets the given wallpaper id to the state
        setWallpaperId: (state, action) => {
            state.wallpaperId = action.payload;
        }
    
    }
});

export const { setWallpaperId } = wallpaperSlice.actions;
export default wallpaperSlice.reducer;