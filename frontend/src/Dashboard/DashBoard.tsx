import { useState, useEffect } from 'react';
import Professor from '../Professor/Professor';
import Student from '../Student/Student';
import SideBar from '../SideBar/SideBar';
import './DashBoardStyles.css';
import axiosapi from "../api";
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import image from './pic.jpg';
import { CardText, NavDropdown } from 'react-bootstrap';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultpic from './defaultpic.png'; 

interface Course {
    CourseName: string;
    ProfessorID: number;
    CourseID: number;
}

function DashBoard() {
    const [showForm, setShowForm] = useState(false);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [newCourse, setNewCourse] = useState<Course>({ CourseName: '', ProfessorID: 0, CourseID: 0 });
    const [courses, setCourses] = useState<Course[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const [hoveredCards, setHoveredCards] = useState<boolean[]>([]); // State to track hover for each card


    // Function to handle mouse enter and leave for each card
    const handleCardHover = (index: number, isHovered: boolean) => {
        setHoveredCards(prevState => {
            const newState = [...prevState];
            newState[index] = isHovered;
            return newState;
        });
    };

    function navigateToCourseInformation(courseId: number) {
        navigate(`/course/${courseId}`);
    }

    function navigateToAttendance(courseId: number) {
        navigate(`/attendance/${courseId}`);
    }

    function navigateToPayment(courseId: number) {
        navigate(`/payment/${courseId}`);
    }



    useEffect(() => {
        const fetchData = async () => {
            try {
                const profsResponse = await axiosapi.get('/fetchprofessors');
                const studentsResponse = await axiosapi.get('/fetchstudents');
                const coursesResponse = await axiosapi.get('/fetchCourses');

                setProfessors(profsResponse.data);
                setStudents(studentsResponse.data);
                setCourses(coursesResponse.data);
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };

        fetchData();
    }, []);

    const toggleFormDisplay = () => {
        setShowForm(!showForm);
    };

    // const handleStudentCheckbox = (studentId: number) => {


    //     if (selectedStudents.includes(studentId)) {

    //         //console.log(`student with id : ${studentId} is removed from the array`);

    //        // setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    //         //delete selectedStudents[selectedStudents.indexOf(studentId)]

    //         setSelectedStudents(selectedStudents.filter(id => id !== studentId));

    //         console.log(`here is the content of the array ${selectedStudents}`);

    //     } else {

    //         //console.log(`student with id : ${studentId} is added to the array`);

    //          setSelectedStudents([...selectedStudents, studentId]);
    //        // selectedStudents.push(studentId);
    //         console.log(`here is the content of the array ${selectedStudents}`);

    //         //selectedStudents.push(studentId)

    //     }
    // };


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


    const enrollStudents = async (courseId: number) => {
        try {
            await axiosapi.post('/enrollstudent', { courseId, selectedStudents })

            console.log('Students successfully enrolled');
        } catch (error) {
            console.error('Error enrolling students', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axiosapi.post('/addcourse', newCourse);
            const createdCourseId = response.data.CourseID;
            console.log(`New course created with CourseID: ${createdCourseId}`);
            await enrollStudents(createdCourseId);
            setNewCourse({ CourseName: '', ProfessorID: 0, CourseID: 0 });
            setSelectedStudents([]);
            setShowForm(false);

            const coursesResponse = await axiosapi.get('/fetchCourses');
            setCourses(coursesResponse.data);

        } catch (error) {
            console.error('Error creating course', error);
        }
    };



    return (
        <>
            <SideBar />
            <div className="dashboard-container">

                <Container style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '7px' }}>

                    {courses.map((course, index) => (

                        
                        <Card
                        key={course.CourseID} // Ensure each card has a unique key
                        style={{ width: '15rem', height: '18rem', display: 'flex', flexDirection: 'column', gap: '5px', transition: 'transform 0.2s', transform: hoveredCards[index] ? 'scale(1.05)' : 'scale(1)', position: 'relative' }}
                        onMouseEnter={() => handleCardHover(index, true)} // Pass index to identify the card
                        onMouseLeave={() => handleCardHover(index, false)} // Pass index to identify the card
                    >
                        
                       
          
                    
                        <Card.Body style={{ gap: '5px' }}>
                            <Card.Title style={{ alignSelf: "flex-start" }}>{course.CourseName} </Card.Title>
                        </Card.Body>
                    
                        <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
                            <Button variant="primary" style={{ padding: '10px 10px', fontSize: '12px' }} onClick={() => navigateToCourseInformation(course.CourseID)}>Course Information</Button>
                        </div>
                    
                        <div style={{ paddingLeft: '5vw' }}>
                            <Dropdown style={{ alignSelf: 'flex-end', marginLeft: '5vw' }}>
                                <Dropdown.Toggle variant="Secondary" id="dropdown-basic">
                                    ...
                                </Dropdown.Toggle>
                    
                                <Dropdown.Menu>
                                    <NavDropdown.Item >
                                        Delete <FontAwesomeIcon icon={faTrash} />
                                    </NavDropdown.Item>
                                    <NavDropdown.Item >
                                        Rename <FontAwesomeIcon icon={faPen} />
                                    </NavDropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Card>
                    








                    ))}






                </Container>

            </div>


            <button onClick={toggleFormDisplay} className="add-button">
                {showForm ? 'Hide Form' : '+ Add Course'}
            </button>

            {showForm && (
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="course-form">
                        <div className="form-group">
                            <label htmlFor="course-title">Course Title</label>
                            <input
                                className="form-input"
                                id="course-title"
                                type="text"
                                placeholder="Enter Course Title"
                                value={newCourse.CourseName}
                                onChange={(e) => setNewCourse({ ...newCourse, CourseName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="professor-select">Select Professor</label>
                            <select
                                className="form-select"
                                id="professor-select"
                                value={newCourse.ProfessorID}
                                onChange={(e) => setNewCourse({ ...newCourse, ProfessorID: Number(e.target.value) })}
                                required
                            >
                                <option value="">Select a Professor</option>
                                {professors.map((prof) => (
                                    <option key={prof.UserID} value={prof.UserID}>{prof.UserName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Select Students</label>
                            <div className="student-list">
                                {students.map((student) => (
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
        </>
    );
}

export default DashBoard;
