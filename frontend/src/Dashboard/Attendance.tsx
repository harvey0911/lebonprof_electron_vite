import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosapi from "../api";
import SideBar from '../SideBar/SideBar';
import Student from '../Student/Student';
import DatePicker from "react-datepicker";


function Attendance() {
    

    const [startDate, setStartDate] = useState(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const { courseId } = useParams();

    useEffect(() => {
        // Define an async function to fetch attendance data
        const fetchAttendanceData = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await axiosapi.get(`/api/attendance/${courseId}`);
  

                setStudents(response.data)
                
            } catch (err) {
                console.error('Error fetching attendance data:', err);
                setError(err);
                
            
            }
        };

        // Call the function
        fetchAttendanceData();

    }, [id]); // Re-fetch when the ID changes

    // Render loading state, error, or attendance data
    return (
        <>
            
        <SideBar />
            
            <div>

                




            </div>
        </>

    );
}

export default Attendance;
