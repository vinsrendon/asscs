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
import TeacherLayout from './pages/teacher/TeacherLayout'
import AdminLayout from './pages/admin/AdminLayout'
import TeacherScan from './pages/teacher/TeacherScan'
import TeacherAnswerKeys from './pages/teacher/TeacherAnswerKeys'
import TeacherStudents from './pages/teacher/TeacherStudents'
import TeacherResult from './pages/teacher/TeacherResult'

function App() {
  return (
    <>
      <Routes>
          <Route path="/" element={<Home/>} viewTransition/>
          <Route path="/register" element={<Register/>} />          
          <Route path="/studdentregistration" element={<StudentRegistration/>} />          
          <Route path="/teacherregistration" element={<TeacherRegisration/>} />   

          <Route path="/admin" element={<RouteGuard allowedRoles={["ADMIN"]} ><AdminLayout /></RouteGuard>}>            
              <Route index element={<AdminDashboard />} />
              <Route path="accounts" element={<AdminAccounts />} />        
          </Route>

          <Route path="/student" element={<RouteGuard allowedRoles={["STUDENT"]} ><StudentLayout /></RouteGuard>}>            
              <Route index element={<StudentDashboard />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="assistant" element={<StudentChat />} />         
          </Route>

          <Route path="/teacher" element={<RouteGuard allowedRoles={["TEACHER"]} ><TeacherLayout /></RouteGuard>}>            
              <Route index element={<TeacherDashboard />} />   
              <Route path="scan" element={<TeacherScan />} />     
              <Route path="keys" element={<TeacherAnswerKeys />} />     
              <Route path="students" element={<TeacherStudents />} />     
              <Route path="results" element={<TeacherResult />} />     
          </Route>
      </Routes>
    </>    
  )
}

export default App
