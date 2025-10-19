import React, { useState, useEffect } from "react";

const WorkspaceClock = () => {
    const [time, setTime] = useState(new Date());

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const paddedHours = formattedHours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    const day = days[time.getDay()];
    const month = months[time.getMonth()];
    const date = time.getDate();

    let greeting = "Hello";
    if (hours >= 5 && hours < 12) greeting = "Good Morning ☀️";
    else if (hours >= 12 && hours < 17) greeting = "Good Afternoon ☕";
    else if (hours >= 17 && hours < 21) greeting = "Good Evening 🌙";
    else greeting = "Good Night 🌌";

    return (
        <div className="flex flex-col items-center justify-center text-center py-4 mx-auto w-[340px] mt-20  text-zinc-50 select-none transition-all duration-500 backdrop-blur-xl bg-white/15 p-6 rounded-2xl shadow-lg border border-white/10">
            <div className="mb-2">
                <h2 className="text-xl font-semibold">{greeting}, Saad</h2>
                <p className=" mt-4 lg:text-2xl md:text-xl font-medium">
                    {day}, {month} {date}
                </p>
            </div>

            <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="text-6xl md:text-5xl lg:text-7xl font-semibold tracking-wide">
                    {paddedHours}:{formattedMinutes}
                </span>

                {/* AM / PM Indicator */}
                <div className="flex flex-col text-sm font-semibold ml-2 leading-tight bg-zinc-950/40 rounded-md overflow-hidden">
                    <span
                        className={`${ampm === "AM" ? "text-zinc-950 bg-zinc-50" : "text-zinc-50"
                            } tracking-widest inline-block p-2`}
                    >
                        AM
                    </span>
                    <span
                        className={`${ampm === "PM" ? "text-zinc-950 bg-zinc-50" : "text-zinc-50"
                            } tracking-widest inline-block p-2`}
                    >
                        PM
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceClock;