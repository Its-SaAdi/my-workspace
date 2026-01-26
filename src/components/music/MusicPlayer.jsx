import { useState, useRef, useEffect } from "react"
import { songs } from "../../conf/songsConf"
import { saveTrack, getStoredTracks, deleteStoredTrack } from "../../conf/storageService"

const MusicPlayer = () => {
    const [tracks, setTracks] = useState(songs);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [lastVolume, setLastVolume] = useState(0.7);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(null);
    const fileInputRef = useRef(null);

    const currentTrack = tracks[currentIndex];

    // Load persisted tracks
    useEffect(() => {
        const loadTracks = async () => {
            try {
                const stored = await getStoredTracks();
                if (stored.length) {
                    setTracks([...songs, ...stored]);
                }
            } catch (err) {
                console.error('Failed to load saved tracks', err);
            }
        };
        loadTracks();
    }, []);

    // Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Play / Pause Song
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(() => setIsPlaying(false));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentIndex]);

    const togglePlay = () => setIsPlaying(prev => !prev);

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setProgress(
            (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0
        );
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        if (!audioRef.current) return;
        audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
        setProgress(newProgress);
    };

    const toggleMute = () => {
        if (volume > 0) {
            setLastVolume(volume);
            setVolume(0);
        } else {
            setVolume(lastVolume || 0.7);
        }
    };

    const nextTrack = () => {
        if (isShuffle) {
            let next;
            do {
                next = Math.floor(Math.random() * tracks.length);
            } while (next === currentIndex && tracks.length > 1);
            setCurrentIndex(next);
        } else {
            setCurrentIndex((prev) => (prev + 1) % tracks.length);
        }
    };

    const prevTrack = () => {
        setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    };

    // Upload songs + random covers
    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files?.length === 0) return;

        const newTracks = [];

        for (const file of Array.from(files)) {
            const id = Date.now().toString() + Math.random().toString(36).slice(2);
            const track = {
                id,
                title: file.name.replace(/\.[^/.]+$/, ''),
                artist: 'Personal Collection',
                url: URL.createObjectURL(file),
                cover: `https://picsum.photos/seed/${id}/300/300`,
                isUserAdded: true
            };

            try {
                await saveTrack(track, file);
                newTracks.push(track);
            } catch (err) {
                console.error('Failed to save track', file.name, err);
            }
        }

        if (newTracks.length) {
            setTracks(prev => [...prev, ...newTracks]);
            setCurrentIndex(tracks.length);
            setIsPlaying(true);
        }
    };

    const removeTrack = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteStoredTrack(id);
            setTracks(prev => {
                const filteredTracks = prev.filter(track => track.id !== id)
                // Adjust current index if we deleted the current or a previous track
                const trackIdx = prev.findIndex(track => track.id === id);
                if (trackIdx === currentIndex) {
                    setIsPlaying(false);
                    setCurrentIndex(0);
                } else if (trackIdx < currentIndex) {
                    setCurrentIndex(prev => prev - 1);
                }
                return filteredTracks;
            });
        } catch (err) {
            console.error("Failed to delete track", err);
        }
    };

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-6">
            <style>
                {`@keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                    .animate-spin-slow {
                        animation: spin-slow 12s linear infinite;
                    }
                    .animate-spin-paused {
                        animation-play-state: paused;
                  }`}
            </style>

            <audio
                ref={audioRef}
                src={currentTrack.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={nextTrack}
            />

            {/* Album Art */}
            <div className="relative group flex flex-col items-center text-center gap-2">
                <div className="relative w-48 h-48 flex items-center justify-center">

                    {/* Vinyl Background Shadow */}
                    <div className={`absolute inset-6 bg-black/40 rounded-full blur-xl transition-opacity duration-1000 ${isPlaying ? 'opacity-60' : 'opacity-20'}`} />

                    {/* Rotating Disk */}
                    <div className={`relative w-44 h-44 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 transition-transform duration-700 ${isPlaying ? 'scale-105 animate-spin-slow' : 'scale-100 animate-spin-slow animate-spin-paused'}`}>
                        <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1 w-full mt-2">
                    <h3 className="text-xl font-semibold tracking-tight truncate px-4">{currentTrack.title}</h3>
                    <p className=" text-white/70 tracking-wide truncate handwritten text-lg">{currentTrack.artist}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 px-2">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress || 0}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-pink-200 transition-all"
                />
                <div className="flex justify-between text-[11px] text-white/50 font-mono tracking-tighter uppercase">
                    <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>  

            {/* Controls */}
            <div className="flex items-center justify-between px-4">
                <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`transition-all hover:scale-110 cursor-pointer ${isShuffle ? 'text-pink-400' : 'text-white/50 hover:text-white'}`}
                    title="Shuffle"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3h5v5m-5 13h5v-5M4 20L21 3m-6 13l6 6M4 4l5 5" />
                    </svg>
                </button>

                <div className="flex items-center gap-6">
                    <button onClick={prevTrack} className="hover:scale-110 transition-transform text-white/60 hover:text-white cursor-pointer">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 18V6z" /></svg>
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        {isPlaying ? (
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>
                    <button onClick={nextTrack} className="hover:scale-110 transition-transform text-white/60 hover:text-white cursor-pointer">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                    </button>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white/50 hover:text-white transition-all hover:scale-110 cursor-pointer "
                    title="Add Tracks"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="audio/*"
                    multiple
                    onChange={handleFileUpload}
                />
            </div>

            {/* Volume Slider with Functional Icon */}
            <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full mx-4">
                <button onClick={toggleMute} className="text-white/50 hover:text-white transition-all hover:scale-110 cursor-pointer ">
                    {volume === 0 ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                    ) : volume < 0.5 ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                    )}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-0.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white/50 hover:accent-white/70"
                />
            </div>

            {/* Mini Track List */}
            <div className="mt-2 space-y-1 h-28 overflow-y-auto px-2 custom-scrollbar">
                {tracks.map((track, idx) => (
                    <div
                        key={track.id}
                        onClick={() => { setCurrentIndex(idx); setIsPlaying(true); }}
                        className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${idx === currentIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <img src={track.cover} className="w-full h-full rounded-lg object-cover" />
                            {idx === currentIndex && isPlaying && <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full pulse-glow shadow-[0_0_8px_white]" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${idx === currentIndex ? 'text-white font-bold' : 'text-white/60'}`}>{track.title}</p>
                            <p className="text-[10px] text-white/40 truncate">{track.artist}</p>
                        </div>
                        {track.isUserAdded && (
                            <button
                                onClick={(e) => removeTrack(e, track.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                        {idx === currentIndex && <span className="text-[8px] text-white/60 font-mono font-bold">ACTIVE</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MusicPlayer