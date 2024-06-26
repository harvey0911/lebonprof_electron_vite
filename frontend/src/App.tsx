
import './App.css'
import './SideBar/SideBar'
import './Dashboard/DashBoard'
import { HashRouter, Routes, Route } from "react-router-dom"

import Dashboard from "./Dashboard/DashBoard"
import Student from "./Student/Student"
import Professor from "./Professor/Professor"
import TaskComponent from "./Task/TaskComponent"
import CourseInformation from "./Dashboard/CourseInformation"
import Attendance from "./Dashboard/Attendance"
import Payment from "./Dashboard/Payment"


function App() {
  return <>
    <HashRouter>
      <Routes>

        <Route path='/' element={<Dashboard />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/Students' element={<Student />} />
        <Route path='/Professors' element={<Professor />} />
        <Route path='/Tasks' element={<TaskComponent />} />
        
        

        <Route path='/course/:courseId' element={<CourseInformation />} />

{/*         
        <Route path='/attendance/:id' element={<Attendance />} />
        <Route path='/payment/:id' element={<Payment />} /> */}




      </Routes>
    </HashRouter>
  </>
}

export default App
