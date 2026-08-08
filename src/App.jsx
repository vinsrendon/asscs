import { Routes, Route, Link, Outlet, NavLink } from 'react-router'
import Home from './pages/Home'
// import Register from './pages/Register'

function Navigation(){
  return(
    <div>
        <nav className="navbar text-4xl">
           <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600" : ""} end>Home</NavLink>|
           <NavLink to="/register" className={({ isActive }) => isActive ? "text-blue-600" : ""}>Register</NavLink>|
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
          <Route path="/" element={<Home/>} />
      </Routes>
    </>    
  )
}

export default App
