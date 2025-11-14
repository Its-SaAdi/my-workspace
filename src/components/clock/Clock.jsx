import React, { useState, useEffect } from "react";

const WorkspaceClock = () => {
    const [time, setTime] = useState(new Date());

    // const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedDate = time.toLocaleDateString(undefined, dateOptions); // "Saturday, November 1"
    const formattedTime = time.toLocaleTimeString(undefined, timeOptions); // "12:18 AM"

    // const hours = time.getHours();
    // const minutes = time.getMinutes();
    // const ampm = hours >= 12 ? "PM" : "AM";
    // const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    // const paddedHours = formattedHours.toString().padStart(2, "0");
    // const formattedMinutes = minutes.toString().padStart(2, "0");

    // const day = days[time.getDay()];
    // const month = months[time.getMonth()];
    // const date = time.getDate();

    // let greeting = "Hello";
    // if (hours >= 5 && hours < 12) greeting = "Good Morning ☀️";
    // else if (hours >= 12 && hours < 17) greeting = "Good Afternoon ☕";
    // else if (hours >= 17 && hours < 21) greeting = "Good Evening 🌙";
    // else greeting = "Good Night 🌌";

    return (
        <div className="flex flex-col items-start justify-center gap-1 text-zinc-50 w-fit ml-auto mr-4 select-none transition-all duration-500 backdrop-blur-lg bg-white/10 px-5 py-4 rounded-b-2xl shadow-lg border border-white/10">
            <div className="">
                {/* <h2 className="text-xl font-semibold">{greeting}, Saad</h2> */}
                <p className=" lg:text-md md:text-sm">
                    {formattedDate}
                </p>
            </div>

            <div className="flex items-center justify-center space-x-2">
                <span className="lg:text-2xl md:text-xl sm:text-lg text-lg font-semibold tracking-wide">
                    {formattedTime}
                </span>

                {/* AM / PM Indicator */}
                {/* <div className="flex text-sm font-semibold ml-2 leading-tight bg-zinc-950/40 rounded-lg overflow-hidden">
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
                </div> */}
            </div>
        </div>
    );
};

export default WorkspaceClock;