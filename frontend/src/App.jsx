import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Violations from "./pages/Violations"

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/violations" element={<Violations />} />
    </Routes>
    </>
  )
}

export default App