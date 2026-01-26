import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // 9lrRgk9X9S8
    videoId: null,
    currentPlayTime: 0,
    isPlaying: false,
};

const youtubeSlice = createSlice({
    name: "youtube",
    initialState,
    reducers: {
        // sets the given video id to state
        setVideo(state, action) {
            state.videoId = action.payload;
            state.currentPlayTime = 0;
            state.isPlaying = true;
        },

        // set the new video playtime to state
        updateTime(state, action) {
            state.currentPlayTime = action.payload;
        },

        // set the video playback status to state
        setPlaying(state, action) {
            state.isPlaying = action.payload;
        },

        // 
        restorePlayback(state, action) {
            return { ...state, ...action.payload };
        },
    },
});

export const { setVideo, updateTime, setPlaying, restorePlayback } = youtubeSlice.actions;
export default youtubeSlice.reducer;