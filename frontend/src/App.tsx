import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Faq from "./pages/Faq"
import About from "./pages/About"
import "./App.css"

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/about" element={<About />} />
    </Routes>
    </>
  );
}

export default App;
