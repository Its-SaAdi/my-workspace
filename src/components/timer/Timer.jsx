import React, { useEffect, useRef, useState } from 'react'

const timerModes = {
    focus: {
        time: 1500,
        label: "Time to focus! 🍀",
    },
    short: {
        time: 300,
        label: "Take a short break! ☕",
    },
    long: {
        time: 900,
        label: "Relax, long break time! 🌿",
    },
}

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

const Timer = () => {
    const [mode, setMode] = useState("focus");
    const [timeLeft, setTimeLeft] = useState(timerModes[mode].time);
    const [isRunning, setIsRunning] = useState(false);
    const [focusCount, setFocusCount] = useState(1);

    const timerIntervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }

        return () => clearInterval(timerIntervalRef.current);
    }, [isRunning])

    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            clearInterval(timerIntervalRef.current);
            setIsRunning(false);

            handleModeSwitch();
        }
    }, [timeLeft, isRunning])

    useEffect(() => {
        clearInterval(timerIntervalRef.current);
        setIsRunning(false)
        setTimeLeft(timerModes[mode].time);
    }, [mode]);


    const handleReset = () => {
        clearInterval(timerIntervalRef.current);
        setIsRunning(false);
        setTimeLeft(timerModes[mode].time);
    }

    const handleTimer = () => {
        setIsRunning(prev => !prev);
    }

    const handleModeSwitch = () => {
        if (mode === "focus") {
            if (focusCount === 4) {
                setMode("long");
                setFocusCount(1);
            } else {
                setMode("short");
                setFocusCount(prev => prev + 1);
            }
        }

        else if (mode === "short" || mode === "long") {
            setMode("focus");
        }
    }

    const handleSkip = () => {
        clearInterval(timerIntervalRef.current);
        setIsRunning(false);
        handleModeSwitch();
    }

    return (
        <div className='flex flex-col'>
            {/* <button className="self-end rounded-lg p-1 text-white text-xl transition-all duration-200 cursor-pointer scale-105 hover:bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg>
            </button> */}

            <div>
                <div className='flex gap-2 items-center justify-center'>
                    <button
                        className={`rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10 ${mode === "focus" ? "bg-white/20 scale-105 " : "active:scale-95 hover:bg-white/10"} disabled:pointer-events-none  disabled:opacity-30`}
                        onClick={() => setMode("focus")}
                        disabled={isRunning}
                    >
                        Focus
                    </button>
                    <button
                        className={`rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10 ${mode === "short" ? "bg-white/20 scale-105 " : "active:scale-95 hover:bg-white/10"} disabled:pointer-events-none  disabled:opacity-30`}
                        onClick={() => setMode("short")}
                        disabled={isRunning}
                    >
                        Short Break
                    </button>
                    <button
                        className={`rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10 ${mode === "long" ? "bg-white/20 scale-105 " : "active:scale-95 hover:bg-white/10"} disabled:pointer-events-none  disabled:opacity-30`}
                        onClick={() => setMode("long")}
                        disabled={isRunning}
                    >
                        Long Break
                    </button>
                </div>

                <div className='flex flex-col justify-center items-center mt-4'>
                    <p className='text-sm font-semibold italic py-2 border-y-1 border-white/40 mb-4'>
                        {timerModes[mode].label}
                    </p>

                    <p className='text-6xl font-bold tracking-wide'>
                        {formatTime(timeLeft)}
                    </p>

                    <div className='flex gap-3 items-center mt-6 mb-2'>
                        <button className='rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer bg-white/20 hover:bg-white/10' onClick={handleTimer}>
                            {isRunning ? "Pause" : "Start Timer"}
                        </button>

                        {/* Reset btn */}
                        <button className='rounded-lg p-2 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10' onClick={handleReset}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        </button>

                        {/* Skip btn */}
                        <button className='rounded-lg p-2 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10' onClick={handleSkip}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-last-icon lucide-chevron-last"><path d="m7 18 6-6-6-6" /><path d="M17 6v12" /></svg>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Timer