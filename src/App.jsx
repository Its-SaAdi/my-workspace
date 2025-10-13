// import './App.css'

import Clock from "./components/clock/Clock"
import Taskbar from "./components/taskbar/Taskbar"

function App() {

  return (
    <div id='screen-bg' className='relative h-screen w-full overflow-hidden bg-cover bg-center bg-zinc-600' style={{backgroundImage: "url('../bg-images/lofi-bg.jpg')"}}>
      {/* <h1 className='text-3xl font-bold underline text-white text-center'>Vite + React</h1> */}
      {/* Clock and day info will be here */}
      <Clock />

      {/* App will be here */}

      <Taskbar />
    </div>
  )
}

export default App