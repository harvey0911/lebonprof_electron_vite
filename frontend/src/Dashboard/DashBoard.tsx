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
    const navigate = useNavigate();



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
                const studsResponse = await axiosapi.get('/fetchstudents');
                const coursesResponse = await axiosapi.get('/fetchCourses');

                setProfessors(profsResponse.data);
                setStudents(studsResponse.data);
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
                    {courses.map((course) => (
                        <Card style={{ width: '18rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <Card.Img variant="top" src='{image}' />
                            <Card.Body style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <Card.Title>{course.CourseName}</Card.Title>
                                <Button variant="primary" style={{ width: '200px', marginBottom: '8px' }} onClick={() => navigateToCourseInformation(course.CourseID)}>Go Course Information</Button>
                                <Button variant="primary" style={{ width: '200px', marginBottom: '8px' }} onClick={() => navigateToAttendance(course.CourseID)}>Attendance</Button>
                                <Button variant="primary" style={{ width: '200px', marginBottom: '8px' }} onClick={() => navigateToPayment(course.CourseID)}>Payment</Button>
                            </Card.Body>
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
