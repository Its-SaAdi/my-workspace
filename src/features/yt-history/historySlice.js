import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    videos: []
}

const historySlice = createSlice({
    name: "yt-history",
    initialState,
    reducers: {
        addToHistory: (state, action) => {
            const existing = state.videos.find(video => video.id === action.payload.id);

            if (existing) {
                existing.lastTime = action.payload.lastTime;
                existing.savedAt = action.payload.savedAt;
            } else {
                state.videos.unshift(action.payload);
            }
        },
        // addToHistory: (state, action) => {
        //     const video = action.payload

        //     state.videos = state.videos.filter(vid => vid.id !== video.id);

        //     state.videos.unshift(video)

        //     if (state.videos.length > 10) {
        //         state.videos.pop()
        //     }
        // },
    }
})

export const { addToHistory } = historySlice.actions
export default historySlice.reducer