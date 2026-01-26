import { useEffect, useRef, useState } from 'react'
import { songs } from '../../conf/songsConf';

const Music = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false)

  const audioRef = useRef(null);
  const progressBarRef = useRef(null)

  const getCurrentIndex = () => {
    if (!currentSong) return -1;
    return songs.findIndex(song => song.id === currentSong.id);
  };

  const playSong = (song) => {
    setCurrentSong(song)
    setProgress(0)
    setIsPlaying(true)
  }

  // const getNextSongIndex = () => {
  //   const index = getCurrentIndex();
  //   if (index === -1) return 0; // no song selected → first song
  //   return (index + 1) % songs.length;
  // };

  // const getPreviousSongIndex = () => {
  //   const index = getCurrentIndex();
  //   if (index === -1) return songs.length - 1; // no song → last song
  //   return (index - 1 + songs.length) % songs.length;
  // };

  const setPreviousSong = () => {
    const index = getCurrentIndex()
    const prevIndex = (index - 1 + songs.length) % songs.length
    playSong(songs[prevIndex])
  }

  const setNextSong = () => {
    const index = getCurrentIndex()
    const nextIndex = (index + 1) % songs.length
    playSong(songs[nextIndex])
  }

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
    } else {
      setIsPlaying(true);
      audioRef.current.play();
    }
  }

  const seekToPercentage = (clientX) => {
    if (!audioRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    let percent = ((clientX - rect.left) / rect.width) * 100;

    // clamp between 0–100
    percent = Math.max(0, Math.min(100, percent));

    const duration = audioRef.current.duration || 0;
    audioRef.current.currentTime = (percent / 100) * duration;

    setProgress(percent);
  };

  const handleBarClick = (e) => {
    seekToPercentage(e.clientX);
  };

  const handlePointerDown = (e) => {
    setIsSeeking(true);
    seekToPercentage(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isSeeking) return;
    seekToPercentage(e.clientX);
  };

  const handlePointerUp = () => {
    setIsSeeking(false);
  };


  // when song changes → load audio & play
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    audioRef.current.src = currentSong.url;
    audioRef.current.play();
    // setIsPlaying(true);
  }, [currentSong]);

  // sync progress bar with real audio time
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      if (isSeeking) return;

      const { currentTime, duration } = audioRef.current;
      if (!duration) return;

      setProgress((currentTime / duration) * 100);
    };

    const handleEnded = () => {
      setNextSong();
    };

    const audio = audioRef.current;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  });


  return (
    <div className='flex flex-col gap-8'>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-inner">
        <h3 className='text-sm font-semibold'>Now Playing</h3>

        {!currentSong && (
          <p className="text-sm text-white/50 italic">
            No song selected
          </p>
        )}

        {currentSong && (
          <>
            <div className="flex gap-4 items-center my-2 ">
              <div className="flex items-center gap-3">

                <div className="flex items-end gap-[3px]">
                  <span className="w-[4px] h-3 bg-green-400 animate-pulse rounded-sm"></span>
                  <span className="w-[4px] h-4 bg-green-400 animate-[pulse_0.6s_ease-in-out_infinite] rounded-sm"></span>
                  <span className="w-[4px] h-3 bg-green-400 animate-pulse rounded-sm"></span>
                </div>

              </div>

              <div className=''>
                <p className="text-base font-semibold">{currentSong.title}</p>
                <p className="text-xs text-white/60">{currentSong.artist} • {currentSong.duration}</p>
              </div>
            </div>

            <div className="flex gap-2 my-3">
              {/* Prev Btn */}
              <button
                className='rounded-lg p-2 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10'
                onClick={() => setPreviousSong()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-back-icon lucide-skip-back"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" /><path d="M3 20V4" /></svg>
              </button>

              {/* Play btn */}
              <button
                className='rounded-lg p-2 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10'
                onClick={() => togglePlay()}
              >
                {isPlaying === true ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>
                )}
              </button>

              {/* Pause btn */}
              {/* <button
                className='rounded-lg p-2 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10'
                onClick={() => setIsPlaying(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg>
              </button> */}

              {/* Next Btn */}
              <button
                className='rounded-lg p-2 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10'
                onClick={() => setNextSong()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16" /><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" /></svg>
              </button>
            </div>

            {/* <div className="w-full h-2 bg-white/10 rounded">
              <div className="h-2 bg-indigo-400 rounded" style={{ width: `${progress}%` }} />
            </div> */}

            <div
              ref={progressBarRef}
              className="w-full h-2 bg-white/10 rounded cursor-pointer relative"
              onClick={handleBarClick}
              onPointerDown={handlePointerDown}
            >
              <div
                className="h-2 bg-indigo-400 rounded"
                style={{ width: `${progress}%` }}
              />

              {/* draggable thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${progress}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-white shadow" />
              </div>
            </div>


            <audio ref={audioRef} />
          </>
        )}
      </div>

      <div className="">
        <h3 className='text-sm font-semibold mb-2'>Playlist</h3>

        <ul>
          {songs.map((song) => {
            const isActive = currentSong?.id === song.id;

            return (
              <li
                key={song.id}
                onClick={() => playSong(song)}
                className={`flex items-center justify-between text-sm font-semibold py-1 px-3 hover:bg-white/10 hover:cursor-pointer transition-all duration-200 rounded-lg mb-2  ${isActive ? "bg-white/20 border-white/40 shadow-lg scale-[1.01]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <span>
                  <span className="font-semibold">{song.title}</span>
                  <span className="text-white/90"> — {song.artist}</span>
                </span>

                <span className="text-white/90">{song.duration}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default Music