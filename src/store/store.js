import { configureStore } from "@reduxjs/toolkit";
import windowReducers from '../features/windows/windowSlice';
import wallpaperReducers from '../features/wallpaper/wallpaperSlice'
import youtubeReducers from '../features/youtube/youtubeSlice'
import historyReducers from '../features/yt-history/historySlice'

const loadYoutubeState = () => {
    try {
        const saved = localStorage.getItem("youtube");
        return saved ? JSON.parse(saved) : undefined;
    } catch {
        return undefined;
    }
};

export const store = configureStore({
    reducer: {
        win: windowReducers,
        wall: wallpaperReducers,
        yt: youtubeReducers,
        history: historyReducers
    },

    preloadedState: {
        yt: loadYoutubeState()
    }
});

store.subscribe(() => {
    const ytState = store.getState().yt
    localStorage.setItem("youtube", JSON.stringify(ytState))
})