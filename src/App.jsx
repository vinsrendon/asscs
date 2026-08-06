import { Routes, Route, Link, Outlet, NavLink } from 'react-router'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'

function Navigation(){
  return(
    <div>
        <nav className="navbar">
           <NavLink to="/" className={"text-2xl"} end>Home</NavLink>|{" "}
           <Link to="/register">Register</Link>|{" "}
        </nav>
        <hr />
        <Outlet/>
    </div>
  )
}

function App() {
  return (
    <>
      <Routes>
          <Route path="/" element={<Navigation/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/register" element={<Register/>}/>
          </Route>
      </Routes>
    </>    
  )
}

export default App
