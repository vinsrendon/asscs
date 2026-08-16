import { Routes, Route} from 'react-router'
import Home from './pages/Home'
import Register from './pages/Register'
import StudentRegistration from './pages/StudentRegistration'
import TeacherRegisration from './pages/TeacherRegisration'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAccounts from './pages/admin/AdminAccounts'
import RouteGuard from './pages/RouteGuard'
import StudentDashboard from './pages/student/StudentDashboard'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import StudentResults from './pages/student/StudentResults'
import StudentPerformance from './pages/student/StudentPerformance'
import StudentChat from './pages/student/StudentChat'
import StudentLayout from './pages/student/StudentLayout'

function App() {
  return (
    <>
      <Routes>
          <Route path="/" element={<Home/>} viewTransition/>
          <Route path="/register" element={<Register/>} />          
          <Route path="/studdentregistration" element={<StudentRegistration/>} />          
          <Route path="/teacherregistration" element={<TeacherRegisration/>} />   

          <Route path="/admindash" element={
            <RouteGuard allowedRoles={["ADMIN"]}>
              <AdminDashboard/>       
            </RouteGuard>} />          
          <Route path="/adminaccounts" element={
            <RouteGuard allowedRoles={["ADMIN"]}>
              <AdminAccounts/>              
            </RouteGuard>} />    
            
          <Route path="/student" element={<RouteGuard allowedRoles={["STUDENT"]} ><StudentLayout /></RouteGuard>}>            
              <Route index element={<StudentDashboard />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="assistant" element={<StudentChat />} />         
          </Route>
      </Routes>
    </>    
  )
}

export default App
