import { Routes, Route} from 'react-router'
// import { Routes, Route, Link, Outlet, NavLink } from 'react-router'
import Home from './pages/Home'
import Register from './pages/Register'
import StudentRegistration from './pages/StudentRegistration'
import TeacherRegisration from './pages/TeacherRegisration'
import AdminDashboard from './pages/admin/AdminDashboard'
import RouteGuard from './pages/RouteGuard'
 
// function Navigation(){
//   return(
//     <div>
//         <nav className="navbar text-4xl">
//            <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600" : ""} end>Home</NavLink>|
//            <NavLink to="/register" className={({ isActive }) => isActive ? "text-blue-600" : ""}>Register</NavLink>|
//         </nav>
//         <hr />
//         <Outlet/>
//     </div>
//   )
// }

function App() {
  return (
    <>
      <Routes>
          <Route path="/" element={<Home/>} viewTransition/>
          <Route path="/register" element={<Register/>} />          
          <Route path="/studdentregistration" element={<StudentRegistration/>} />          
          <Route path="/teacherregistration" element={<TeacherRegisration/>} />          
          <Route path="/admindash" element={<RouteGuard allowedRoles={["ADMIN"]}><AdminDashboard/></RouteGuard>} />          
      </Routes>
    </>    
  )
}

export default App
