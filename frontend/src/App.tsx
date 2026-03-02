
import './App.css'
import './SideBar/SideBar'
import './Dashboard/DashBoard'
import { HashRouter, Routes, Route, Outlet } from "react-router-dom"

import Dashboard from "./Dashboard/DashBoard"
import Student from "./Student/Student"
import Professor from "./Professor/Professor"
import TaskComponent from "./Task/TaskComponent"

import CourseInformation from './Dashboard/CourseInformation'
import Attendance from "./Dashboard/Attendance"
import Payment from "./Dashboard/Payment"
import Files from './Dashboard/Files'
import LandingPage from './SideBar/LandingPage'
import StudentInfo from './Student/StudentInfo'
import Settings from './Dashboard/Settings'
import ManagementLayout from './ManagementLayout'


function App() {
  return <>
    <HashRouter>

      <Routes>

        <Route path='/' element={<LandingPage />} />


        <Route element={<ManagementLayout><Outlet /></ManagementLayout>}>
          <Route path='/Dashboard' element={<Dashboard />} />
          <Route path='/Students' element={<Student />} />
          <Route path='/Professors' element={<Professor />} />
          <Route path='/Tasks' element={<TaskComponent />} />
          <Route path='/Settings' element={<Settings />} />
        </Route>


        <Route path='/course/:courseId' element={<CourseInformation />} />
        <Route path='/attendance/:courseId' element={<Attendance />} />
        <Route path='/payment/:courseId' element={<Payment />} />
        <Route path='/student/:studentId' element={<StudentInfo />} />
        <Route path='/files/:courseId' element={<Files />} />

      </Routes>





    </HashRouter>
  </>
}

export default App
