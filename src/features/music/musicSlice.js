import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentTrackId: null,   // string id of the playing track
    currentIndex: null,     // index in the tracks array
    isPlaying: false,
    currentTime: 0,         // in seconds — used to seek back on remount
    progress: 0,            // 0–100 float — used to restore progress bar instantly
    isShuffle: false,
    volume: 0.7,
    screen: 'library',      // 'library' | 'player'
};

const musicSlice = createSlice({
    name: "music",
    initialState,
    reducers: {
        setCurrentTrack: (state, action) => {
            // payload: { id, index }
            state.currentTrackId = action.payload.id;
            state.currentIndex = action.payload.index;
            state.currentTime = 0;
            state.progress = 0;
        },

        setIsPlaying: (state, action) => {
            state.isPlaying = action.payload;
        },

        setCurrentTime: (state, action) => {
            // payload: { currentTime, progress }
            state.currentTime = action.payload.currentTime;
            state.progress = action.payload.progress;
        },

        setIsShuffle: (state, action) => {
            state.isShuffle = action.payload;
        },

        setVolume: (state, action) => {
            state.volume = action.payload;
        },

        setScreen: (state, action) => {
            state.screen = action.payload;
        },
        
        clearTrack: (state) => {
            state.currentTrackId = null;
            state.currentIndex = null;
            state.isPlaying = false;
            state.currentTime = 0;
            state.progress = 0;
            state.screen = 'library';
        },
    },
});

export const {
    setCurrentTrack,
    setIsPlaying,
    setCurrentTime,
    setIsShuffle,
    setVolume,
    setScreen,
    clearTrack,
} = musicSlice.actions;

export default musicSlice.reducer;