import { useEffect, useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import axiosapi from "../api";
import Professor from '../Professor/Professor';
import Student from '../Student/Student';

import './CourseInformation.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Table from 'react-bootstrap/Table';
import Navbarcomponent from './Navbarcomponent';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
// import { faPenAlt } from '@fortawesome/free-solid-svg-icons';

function CourseInformation() {


    const [courseTitle, setCourseTitle] = useState('');
    const [professor, setProfessor] = useState<Professor>();
    const [students, setStudents] = useState<Student[]>([]);
    const [students_not_enrolled, setStudents_not_enrolled] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const { courseId } = useParams();
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (courseId) {
                    // Fetch course title
                    const courseResponse = await axiosapi.get(`/fetchCourse/${courseId}`);
                    setCourseTitle(courseResponse.data.CourseName);

                    // Fetch professor information
                    // Assuming there's an endpoint to fetch professor by courseId
                    const professorResponse = await axiosapi.get(`/fetchProfessorByCourse/${courseId}`);
                    setProfessor(professorResponse.data);

                    // Fetch enrolled students
                    // Assuming there's an endpoint to fetch students by courseId
                    const studentsResponse = await axiosapi.get(`/fetchStudentsByCourse/${courseId}`);
                    setStudents(studentsResponse.data);


                    // fetching students who are not enrolled in that course in order to load them in the form 
                    const students_not_enrolled_Response = await axiosapi.get(`/fetch_Students_not_enrolled/${courseId}`);
                    setStudents_not_enrolled(students_not_enrolled_Response.data);

                }
            } catch (error) {
                console.error('Error fetching course information', error);
            }
        };
        fetchData();
    }, [courseId, students]); // Dependency array ensures the effect runs only when courseId changes



    function navigateToCourseInformation(courseId: number) {
        navigate(`/course/${courseId}`);
    }

    function navigateToAttendance(courseId: number) {
        navigate(`/attendance/${courseId}`);
    }

    function navigateToPayment(courseId: number) {
        navigate(`/payment/${courseId}`);
    }

    function navigateToFiles(courseId: Number) {
        navigate(`/files/${courseId}`);
    }




    const toggleFormDisplay = () => {
        setShowForm(!showForm);
    };



    const handleStudentCheckbox = (studentId: number) => {
        setSelectedStudents(currentSelectedStudents => {


            if (currentSelectedStudents.includes(studentId)) {
                // Remove the student ID from the array
                return currentSelectedStudents.filter(id => id !== studentId);
            } else {
                // Add the student ID to the array
                return [...currentSelectedStudents, studentId];
            }
        });
    };

    // const enrollStudents = async () => {
    //     try {
    //         await axiosapi.post('/enrollstudent', { courseId, selectedStudents })

    //         console.log('Students successfully enrolled');
    //     } catch (error) {
    //         console.error('Error enrolling students', error);
    //     }
    // };






    const enrollStudents = async () => {
        try {
            await axiosapi.post('/enrollstudent', { courseId, selectedStudents });

            // Fetch updated list of enrolled students after enrollment
            const updatedStudentsResponse = await axiosapi.get(`/fetchStudentsByCourse/${courseId}`);
            setStudents(updatedStudentsResponse.data);

            console.log('Students successfully enrolled');
        } catch (error) {
            console.error('Error enrolling students', error);
        }
    };



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await enrollStudents();
            setSelectedStudents([]);
            setShowForm(false);
        } catch (error) {
            console.error('Error creating course', error);
        }
    };




    // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     try {

    //         await enrollStudents();
    //         setSelectedStudents([]);
    //         setShowForm(false);



    //     } catch (error) {
    //         console.error('Error creating course', error);
    //     }
    // };



    // const removeStudent = async (UserID: number) => {
    //     try {

    //         await axiosapi.put(`/remove_from_course`, { UserID, CourseID: courseId });
    //         setStudents(students.filter(user => user.UserID !== UserID));


    //         console.log(`Student with UserID ${UserID} removed from the course with CourseID ${courseId}`);
    //     } catch (error) {
    //         console.error('Error deleting user', error);
    //     }
    // };


    const removeStudent = async (UserID: number) => {
        try {
            await axiosapi.put(`/remove_from_course`, { UserID, CourseID: courseId });
            setStudents(students.filter(user => user.UserID !== UserID));
            console.log(`Student with UserID ${UserID} removed from the course with CourseID ${courseId}`);
        } catch (error) {
            console.error('Error deleting user', error);
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
                                    navigateToCourseInformation(parsedCourseId);
                                }
                            }} className="text-light">Course information</Nav.Link>

                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToAttendance(parsedCourseId);
                                }
                            }} className="text-light">Attendance</Nav.Link>

                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToFiles(parsedCourseId);
                                }
                            }} className="text-light">Files</Nav.Link>


                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToPayment(parsedCourseId);
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


            <button className='add_student_button' onClick={toggleFormDisplay}>   add students </button>
            {showForm && (
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="course-form">


                        <div className="form-group">
                            <label>Select Students</label>
                            <div className="student-list">
                                {students_not_enrolled.map((student) => (
                                    <div key={student.UserID} className="student-checkbox">
                                        <label htmlFor={`student-${student.UserID}`}>{student.UserName}</label>
                                        <input
                                            type="checkbox"
                                            id={`student-${student.UserID}`}

                                            onChange={() => handleStudentCheckbox(student.UserID)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="submit-button" type="submit">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            )}








            <h1 style={{ position: 'fixed', left: 0, top: '100px' }}>{courseTitle} </h1>

            <h2 style={{ position: 'fixed', left: 0, top: '180px' }}>{professor?.UserName}</h2>

            {/* <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div> */}

            



            <Table striped bordered hover variant="light" size="lg" style={{ position: 'absolute', left: 0, top: 250, width: 500 }}>
                <thead>
                    <tr>
                
                        <th colSpan={2}>Student name</th>
                        <th>status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.UserID}>
                            <td colSpan={2}>{student.UserName}</td>
                            <td><FontAwesomeIcon icon={faTrash} onClick={() => removeStudent(student.UserID)}/></td>
                        </tr>
                    ))}
                </tbody>
            </Table>









        </>














    );
}

export default CourseInformation;

















