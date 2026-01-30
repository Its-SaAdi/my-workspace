import { useRef } from 'react'
import { useDispatch } from "react-redux";
import { closeWindow, minimizeWindow } from "../../features/windows/windowSlice"
import { tools } from "../../conf/toolsConf"
import { useWindowBounds } from '../../hooks/useWindowBounds'
import { useWindowDrag } from '../../hooks/useWindowDrag'
import { useWindowResize } from '../../hooks/useWindowResize'

const Window = ({ windowData }) => {
  const dispatch = useDispatch();

  const windowRef = useRef(null);

  const getBoundedPosition = useWindowBounds()

  const { position, onPointerDown } = useWindowDrag({
    windowRef,
    windowId: windowData.id,
    initialPosition: windowData.position || { xOffset: 20, yOffset: 20 },
    getBoundedPosition,
  });

  useWindowResize(windowRef, position)

  // --- Window controls ---
  const handleClose = () => dispatch(closeWindow(windowData.id));
  const handleMinimize = () => dispatch(minimizeWindow(windowData.id));

  // If minimized, don't render the window at all
  if (windowData?.minimized) return null;

  return (
    <div
      ref={windowRef}
      style={{
        top: `${position.yOffset}px`,
        left: `${position.xOffset}px`,
        zIndex: windowData.zIndex,
        display: windowData?.isMinimized ? "none" : "block",
        userSelect: "none",
        willChange: "transform",
      }}
      className={`w-[450px] min-w-[450px] absolute backdrop-blur-lg bg-white/10 rounded-xl shadow-lg border border-white/10 text-zinc-50 transition-none overflow-hidden`}
    >
      <div className='flex justify-between items-center px-5 py-1 border-b border-b-zinc-200 cursor-grab active:cursor-grabbing touch-none select-none' onPointerDown={onPointerDown}>
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

      <div className='p-4 max-h-[calc(100vh-60px)] overflow-y-auto'>
        {tools.find(tool => windowData?.toolName === tool?.title)?.component || windowData.element}
      </div>

      <div className="absolute top-0 right-0 bg-transparent w-2 h-full cursor-ew-resize hover:bg-[#ffffff03] resize-right"></div>
      <div className="absolute bottom-0 left-0 bg-transparent w-full h-2 cursor-ns-resize hover:bg-[#ffffff03] resize-bottom"></div>
      <div className="absolute bottom-0 right-0 bg-transparent w-3.5 h-3.5 cursor-nwse-resize hover:bg-[#ffffff03] resize-corner"></div>
    </div>
  )
}

export default Window