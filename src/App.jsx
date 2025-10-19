// import './App.css'

import Clock from "./components/clock/Clock"
import Taskbar from "./components/taskbar/Taskbar"
import Window from "./components/window/Window"

function App() {

  return (
    <div id='screen-bg' className='relative h-screen w-full overflow-hidden bg-cover bg-center bg-zinc-600' style={{backgroundImage: "url('../bg-images/lofi-bg.jpg')"}}>
      <Clock />

      {/* App will be here */}
      <Window children={<h1>Hellow World</h1>} title="Design" />

      <Taskbar />
    </div>
  )
}

export default App