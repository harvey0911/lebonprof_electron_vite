// import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import axiosapi from "../api";
import SideBar from '../SideBar/SideBar';
// import Student from '../Student/Student';
// import DatePicker from "react-datepicker";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Table from 'react-bootstrap/Table';
import { useState, useEffect } from 'react';
import axiosapi from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import Student from '../Student/Student';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
function Attendance() {



    const [students, setStudents] = useState<Student[]>([]);
    const { courseId } = useParams();
    const [status,setStatus] = useState('...');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();



    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             if (courseId) {
    //                 // Format the selected date as YYYY-MM-DD
    //                 const formattedDate = selectedDate.toISOString().split('T')[0];
        
    //                 // Fetch students' status for the selected date
    //                 const studentsResponse = await axiosapi.get(`/fetchStudentsByCourse/${courseId}`);
    //                 console.log('Students response:', studentsResponse); // Log the response
    //                 setStudents(studentsResponse.data);

                   
    //             }
    //         } catch (error) {
    //             console.error('Error fetching enrolled students', error);
    //         }
    //     };
        

    //     fetchData();
    // }, [courseId, selectedDate]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                if (courseId) {
                    // Format the selected date as YYYY-MM-DD
                    const formattedDate = selectedDate.toISOString().split('T')[0];
            
                    // Fetch students' status for the selected date
                    const studentsResponse = await axiosapi.get(`/fetchStudentsStatus/${courseId}?date=${formattedDate}`);
                    console.log('Students response:', studentsResponse.data); // Log the response
                    setStudents(studentsResponse.data);
                }
            } catch (error) {
                console.error('Error fetching enrolled students', error);
            }
        };
            
        fetchData();
    }, [courseId, selectedDate]);
    

    
    function navigateToCourseInformation() {
        navigate(`/course/${courseId}`);
    }

    function navigateToAttendance() {
        navigate(`/attendance/${courseId}`);
    }

    function navigateToPayment() {
        navigate(`/payment/${courseId}`);
    }

    function navigateToFiles() {
        navigate(`/files/${courseId}`);
    }


    function TurnLate(studentId: number) {
        updateStatus(studentId, 'Late');
    }

    function TurnAbsent(studentId: number) {
        updateStatus(studentId, 'Absent');
    }

    function TurnPresent(studentId: number) {
        updateStatus(studentId, 'Present');
        
    }

    function updateStatus(studentId: number, newStatus: string) {
        // Update the status for the specific student
        const updatedStudents = students.map((student) => {
            if (student.UserID === studentId) {
                return { ...student, Status: newStatus };
            }
            return student;
        });

        setStudents(updatedStudents);
    }




    const SaveAttendance = async () => {
        try {
            // Prepare the attendance data to be saved
            const attendanceData = students.map(student => ({
                studentId: student.UserID,
                courseId: courseId,
                date: selectedDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                status: student.Status
            }));
    
            // Send the attendance data to the backend to be saved
            const response = await axiosapi.post('/saveAttendance', attendanceData);
    
            // Handle the response (optional)
            console.log('Attendance saved successfully:', response);
    
            // Optionally, you can show a success message to the user
            alert('Attendance saved successfully!');
        } catch (error) {
            // Handle errors
            console.error('Error saving attendance:', error);
    
            // Optionally, you can show an error message to the user
            alert('Error saving attendance. Please try again later.');
        }
    };
    

    return (
        <>

            <Navbar expand="lg" className="bg-dark fixed-top">
                <Container fluid>
                    <Navbar.Brand href="#" className="text-light">Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >


                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToCourseInformation();
                                }
                            }} className="text-light">Course information</Nav.Link>

                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToAttendance();
                                }
                            }} className="text-light">Attendance</Nav.Link>

                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToFiles();
                                }
                            }} className="text-light">Files</Nav.Link>


                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToPayment();
                                }
                            }} className="text-light">Payment</Nav.Link>




                        </Nav>
                        <Form className="d-flex">
                            <Form.Control
                                type="search"
                                placeholder="Search"
                                className="me-2"
                                aria-label="Search"
                            />
                            <Button variant="outline-success" className="text-light">Search</Button>
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            

            <div style={{ position: 'absolute', top: 65, right: 40 }}>
                <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} />
                <Button className="bg-dark" onClick={SaveAttendance}> Save </Button>
            </div>

            <Table striped bordered hover variant="light" size="lg" style={{ position: 'absolute', left: 0, top: 150, width: 500 }}>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student name</th>
                        <th colSpan={2}>status</th>
                    </tr>
                </thead>
                <tbody>
    {students.map((student) => (
        <tr key={student.UserID}>
            <td>{student.UserID}</td>
            <td colSpan={2}>{student.UserName}</td>
            <td>
                <Dropdown as={NavItem}>
                    <Dropdown.Toggle as={NavLink}>{student.Status}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => TurnPresent(student.UserID)}>Present</Dropdown.Item>
                        <Dropdown.Item onClick={() => TurnAbsent(student.UserID)}>Absent</Dropdown.Item>
                        <Dropdown.Item onClick={() => TurnLate(student.UserID)}>Late</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </td>
        </tr>
    ))}
</tbody>


            </Table>

        </>

    );
}

export default Attendance;


