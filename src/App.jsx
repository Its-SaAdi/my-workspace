import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getWallpaperById } from "./conf/wallpaperConf";
import Clock from "./components/clock/Clock"
import Taskbar from "./components/taskbar/Taskbar"
import Window from "./components/window/Window"

function App() {
  // const [windowState, setWindowState] = useState([]);
  // let nextWindowId = 1;

  const dispatch = useDispatch();
  const windowState = useSelector((state) => state.win);
  const wallpaperId = useSelector((state) => state.wall.wallpaperId);
  let bgImg = "";

  useEffect(() => {
    const savedId = localStorage.getItem("CURRENT_WALLPAPER_ID");
    
    const wallpaper = getWallpaperById(savedId || wallpaperId);
    console.log(wallpaper);
    
    document.getElementById("screen-bg").style.backgroundImage = `url(${wallpaper.full})`
    
  }, [wallpaperId]);

  return (
    <div id='screen-bg' className='relative h-screen w-full overflow-hidden bg-cover bg-center bg-zinc-600 transition'>
      <Clock />

      {/* App will be here */}
      {windowState.windows.map((window) => (
        <Window windowData={window} key={window.id} />
        // <Window toolName={window.toolName} toolWidget={window.element} key={window.id} />
      ))}

      {/* <Window children={<h1>Hellow World</h1>} title="Design" onClose={closeWindow} /> */}

      <Taskbar />
    </div>
  )
}

export default App