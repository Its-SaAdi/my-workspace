import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVideo, updateTime, setPlaying } from '../../features/youtube/youtubeSlice'
import { addToHistory } from '../../features/yt-history/historySlice'

const YouTube = () => {
    const dispatch = useDispatch()
    const { videoId, currentPlayTime, isPlaying } = useSelector(state => state.yt)
    const history = useSelector(state => state.history.videos)

    const [query, setQuery] = useState("")
    const [showHistory, setShowHistory] = useState(false);

    const playerRef = useRef(null)
    const containerRef = useRef(null)
    // const timeIntervalRef = useRef(null)

    const extractVideoId = (inputURL) => {
        try {
            if (inputURL.includes("youtu")) {
                const url = new URL(inputURL);
                return url.searchParams.get("v") || url.pathname.split("/").pop();
            }
            return inputURL;
        } catch {
            return inputURL;
        }
    };

    const saveToHistory = useCallback((player) => {
        if (!videoId || !player) return

        dispatch(addToHistory({
            id: videoId,
            title: player.getVideoData()?.title || "Untitled",
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            lastTime: player.getCurrentTime(),
            savedAt: Date.now()
        }))
    }, [videoId, dispatch])

    const handleSearch = () => {
        const extractedId = extractVideoId(query)
        if (extractedId) dispatch(setVideo(extractedId))
        setQuery("")
    }

    const handleReady = useCallback((event) => {
        const player = event.target

        // event.target.playVideo(); // optional to play as video loads
        if (currentPlayTime > 0) {
            player.seekTo(currentPlayTime, true)
        }

        isPlaying ? player.playVideo() : player.pauseVideo()
        saveToHistory(player)   // saves video to history when its loaded
        // if (isPlaying) {
        //     player.playVideo();
        // } else {
        //     player.pauseVideo()
        // }
    }, [currentPlayTime, isPlaying, saveToHistory])

    const handleStateChange = useCallback((event) => {
        const player = event.target

        if (event.data === window.YT.PlayerState.PLAYING) {
            dispatch(setPlaying(true));

            // if (!timeIntervalRef.current) {
            //     timeIntervalRef.current = setInterval(() => {
            //         const time = player.getCurrentTime()
            //         dispatch(updateTime(time))
            //     }, 1000);
            // }
        }

        if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
            dispatch(setPlaying(false));
            dispatch(updateTime(player.getCurrentTime()));
            saveToHistory(player)   // saves video to history when video is paused or ended

            // if (timeIntervalRef.current) {
            //     clearInterval(timeIntervalRef.current)
            //     timeIntervalRef.current = null
            // }
        }
    }, [dispatch, saveToHistory])

    // const destroyPlayer = () => {
    //     // if (timeIntervalRef.current) {
    //     //     clearInterval(timeIntervalRef.current);
    //     //     timeIntervalRef.current = null;
    //     // }

    //     if (playerRef.current) {
    //         saveToHistory(playerRef.current)   // saves video to history when tool window is closed (unmounted)
    //         const time = playerRef.current.getCurrentTime();
    //         dispatch(updateTime(time));
    //         playerRef.current.destroy()
    //         playerRef.current = null
    //     }
    // }

    useEffect(() => {
        if (!videoId || !window.YT?.Player || !containerRef.current) return

        if (playerRef.current) return;

        playerRef.current = new window.YT.Player(containerRef.current, {
            videoId,
            playerVars: {
                autoplay: 0,
                // autoplay: isPlaying ? 1 : 0,
                controls: 1,
                playsinline: 1,
                start: Math.floor(currentPlayTime),
                modestbranding: 1,
                rel: 0,
            },
            events: {
                onReady: handleReady,
                onStateChange: handleStateChange,
            }
        })

        return () => {
            if (playerRef.current) {
                saveToHistory(playerRef.current)   // saves video to history when tool window is closed (unmounted)
                dispatch(updateTime(playerRef.current.getCurrentTime()));
                playerRef.current.destroy()
                playerRef.current = null
            }
        }
    }, [videoId])

    useEffect(() => {
        const handleUnload = () => {
            if (playerRef.current) {
                dispatch(updateTime(playerRef.current.getCurrentTime()));
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [dispatch]);


    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if (playerRef.current?.getCurrentTime) {
    //             const time = playerRef.current.getCurrentTime()
    //             dispatch(updateTime(time))
    //         }
    //     }, 1000);

    //     return () => clearInterval(interval)
    // }, [])

    // useEffect(() => {
    //     return () => {
    //         if (playerRef.current) {
    //             playerRef.current.destroy()
    //             playerRef.current = null
    //         }
    //     }
    // }, [])

    // const loadVideo = () => {
    //     dispatch(setVideo("9lrRgk9X9S8"))
    // }

    return (
        <>
            {/* Search bar will place here */}
            <div className="flex gap-2 mb-3 relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Paste YouTube URL or ID"
                    className="flex-1 w-full p-2 bg-white/5 border border-white/10 rounded-lg outline-none resize-none focus:bg-white/10"
                />

                <button
                    onClick={handleSearch}
                    className="rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer bg-white/20 hover:bg-white/10"
                >
                    Load
                </button>

                <button
                    onClick={() => setShowHistory(prev => !prev)}
                    className="p-2 hover:cursor-pointer rounded-lg text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history-icon lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                </button>

                {showHistory && history.length > 0 && (
                    <div className=" absolute left-0 right-0 top-full mt-1 bg-black/60 backdrop-blur rounded-md shadow-lg max-h-[180px] overflow-y-auto z-50 p-2 space-y-2">
                        {history.map(video => (
                            <div
                                key={video.id}
                                onClick={() => {
                                    dispatch(setVideo(video.id));
                                    setShowHistory(false);
                                }}
                                className="flex gap-2 items-center cursor-pointer hover:bg-white/10 p-1 rounded"
                            >
                                <img
                                    src={video.thumbnail}
                                    alt=""
                                    className="w-14 rounded"
                                />
                                <div className="text-sm truncate">
                                    {video.title}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* YT player will place here */}
            <div className="w-full aspect-video rounded-md overflow-hidden bg-black">
                <div ref={containerRef} className="w-full h-full" ></div>
            </div>

            {/* Controls will place here */}


        </>
    )
}

export default YouTube