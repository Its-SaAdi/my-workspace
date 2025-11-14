import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { closeWindow, focusWindow, minimizeWindow, updateWindow } from "../../features/windows/windowSlice"

const Window = ({ windowData }) => {
  const windowRef = useRef(null);
  const dispatch = useDispatch();

  // const windowState = useSelector(state => state.windows);
  // Get current data from redux about this window as we using the id
  // const windowData = useSelector(state => state.win.windows[id]);
  // const { id, toolName, element, isMinimized, position, zIndex } = windowData;
  const isWindowActive = useSelector(state => state.win.activeWindowId === windowData.id);

  const [position, setPosition] = useState(windowData?.position || { xOffset: 20, yOffset: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ xOffset: 0, yOffset: 0 });

  const frameRef = useRef(null);
  const lastPosition = useRef(position);


  // --- Handle drag start ---
  const handleMouseDown = (e) => {
    if (e.target.closest(".window-controls")) return;

    setIsDragging(true);
    setOffset({
      xOffset: e.clientX - position.xOffset,
      yOffset: e.clientY - position.yOffset
    });
    dispatch(focusWindow(windowData.id)); // bring to front when clicked
  };

  // --- Handle dragging movement ---
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - offset.xOffset;
    const newY = e.clientY - offset.yOffset;
    lastPosition.current = { xOffset: newX, yOffset: newY };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (windowRef.current) {
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }
    });
  };

  // --- Stop dragging ---
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    cancelAnimationFrame(frameRef.current);
    setPosition(lastPosition.current);
    dispatch(updateWindow({ id: windowData.id, data: lastPosition.current }));
  };

  // Add global mouse event listeners for drag
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.style.left = `${position.xOffset}px`;
      windowRef.current.style.top = `${position.yOffset}px`;
    }
  }, [position]);

  // --- Window controls ---
  const handleClose = () => dispatch(closeWindow(windowData.id));
  const handleMinimize = () => dispatch(minimizeWindow(windowData.id));

  // If minimized, don't render the window at all
  if (windowData?.minimized) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={() => dispatch(focusWindow(windowData.id))}
      style={{
        top: `${position.yOffset}px`,
        left: `${position.xOffset}px`,
        zIndex: isWindowActive ? 50 : 10,
        display: windowData?.isMinimized ? "none" : "block",
        userSelect: "none",
        willChange: "transform",
      }}
      className={`w-[450px] absolute backdrop-blur-lg bg-white/10 rounded-xl shadow-lg border border-white/10 text-zinc-50 transition-none`}
    >
      <div className='flex justify-between items-center px-5 py-1 border-b border-b-zinc-200 cursor-grab active:cursor-grabbing select-none' onMouseDown={handleMouseDown}>
        <h3 className='font-semibold'>{windowData.toolName}</h3>

        <div className="window-controls flex justify-between items-center gap-2">
          <button className=' hover:text-blue-400 cursor-pointer' onClick={handleMinimize}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus"><path d="M5 12h14" /></svg>
          </button>
          <button className=' hover:text-red-400 cursor-pointer' onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      </div>

      <div className='p-4'>
        {windowData.element}
      </div>
    </div>
  )
}

// export { openWindow };
export default Window

// import { useRef, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { updateWindow, focusWindow } from "../../features/window-ui/windowSlice";

// const Window = ({ windowData }) => {
//   const dispatch = useDispatch();
//   const windowRef = useRef(null);
//   const pos = useRef({
//     x: windowData.position?.xOffset || 100,
//     y: windowData.position?.yOffset || 100,
//   });
//   const offset = useRef({ x: 0, y: 0 });
//   const isDragging = useRef(false);

//   const handleMouseDown = (e) => {
//     if (e.button !== 0) return;
//     isDragging.current = true;

//     const rect = windowRef.current.getBoundingClientRect();
//     offset.current = {
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top,
//     };

//     dispatch(focusWindow(windowData.id));
//     document.body.style.userSelect = "none";
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;

//     const newX = e.clientX - offset.current.x;
//     const newY = e.clientY - offset.current.y;

//     pos.current = { x: newX, y: newY };

//     // Instant visual update (no React state)
//     windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
//   };

//   const handleMouseUp = () => {
//     if (!isDragging.current) return;
//     isDragging.current = false;
//     document.body.style.userSelect = "auto";

//     // Commit final position to Redux
//     dispatch(
//       updateWindow({
//         id: windowData.id,
//         data: {
//           xOffset: pos.current.x,
//           yOffset: pos.current.y,
//         },
//       })
//     );
//   };

//   // Attach global listeners
//   useEffect(() => {
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);
//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, []);

//   // Apply initial transform from stored position
//   useEffect(() => {
//     windowRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
//   }, [windowData.position]);

//   return (
//     <div
//       ref={windowRef}
//       style={{
//         position: "absolute",
//         zIndex: windowData.zIndex,
//         willChange: "transform", // Hint GPU to optimize
//       }}
//       className="select-none bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg text-white w-[400px] h-[300px]"
//     >
//       <div
//         onMouseDown={handleMouseDown}
//         className="cursor-grab active:cursor-grabbing px-4 py-2 bg-white/20 rounded-t-2xl font-medium"
//       >
//         {windowData.toolName}
//       </div>
//       <div className="p-4 text-sm overflow-auto">{windowData.element}</div>
//     </div>
//   );
// };

// export default Window;