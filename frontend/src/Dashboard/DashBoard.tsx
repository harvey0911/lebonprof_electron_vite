import React, { useState, useEffect } from 'react';
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
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavDropdown } from 'react-bootstrap';

interface Course {
    CourseName: string;
    ProfessorID: number;
    CourseID: number;
}

function DashBoard() {
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [courseToUpdate, setCourseToUpdate] = useState<Course | null>(null);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [newCourse, setNewCourse] = useState<Course>({ CourseName: '', ProfessorID: 0, CourseID: 0 });
    const [courses, setCourses] = useState<Course[]>([]);
    const [hoveredCards, setHoveredCards] = useState<boolean[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
    const navigate = useNavigate();

    const handleCardHover = (index: number, isHovered: boolean) => {
        setHoveredCards(prevState => {
            const newState = [...prevState];
            newState[index] = isHovered;
            return newState;
        });
    };

    const navigateToCourseInformation = (courseId: number) => {
        navigate(`/course/${courseId}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profsResponse = await axiosapi.get('/fetchprofessors');
                const studentsResponse = await axiosapi.get('/fetchstudents');
                const coursesResponse = await axiosapi.get('/fetchCourses');

                setProfessors(profsResponse.data);
                setStudents(studentsResponse.data);
                setCourses(coursesResponse.data);
                setHoveredCards(new Array(coursesResponse.data.length).fill(false));
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };

        fetchData();
    }, []);

    const toggleFormDisplay = () => {
        setShowForm(!showForm);
    };

    const handleStudentCheckbox = (studentId: number) => {
        setSelectedStudents(currentSelectedStudents => {
            if (currentSelectedStudents.includes(studentId)) {
                return currentSelectedStudents.filter(id => id !== studentId);
            } else {
                return [...currentSelectedStudents, studentId];
            }
        });
    };

    const enrollStudents = async (courseId: number) => {
        try {
            await axiosapi.post('/enrollstudent', { courseId, selectedStudents });
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

    const handleDeleteCourse = (course: Course) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (courseToDelete) {
            try {
                await axiosapi.delete(`/deletecourse/${courseToDelete.CourseID}`);
                setCourses(courses.filter(c => c.CourseID !== courseToDelete.CourseID));
                setShowDeleteModal(false);
                setCourseToDelete(null);
            } catch (error) {
                console.error('Error deleting course', error);
            }
        }
    };

    const handleUpdateCourse = (course: Course) => {
        setCourseToUpdate(course);
        setShowUpdateModal(true);
    };

    const handleSaveUpdate = async () => {
        if (courseToUpdate) {
            try {
                await axiosapi.put(`/updatecourse/${courseToUpdate.CourseID}`, courseToUpdate);
                const updatedCourses = courses.map(c => c.CourseID === courseToUpdate.CourseID ? courseToUpdate : c);
                setCourses(updatedCourses);
                setShowUpdateModal(false);
                setCourseToUpdate(null);
            } catch (error) {
                console.error('Error updating course', error);
            }
        }
    };

    const filteredCourses = courses.filter(course =>
        course.CourseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <SideBar />
            <Form className="d-flex search-form fixed-top p-2 mx-auto rounded-pill" style={{ width: 'fit-content' }}>
                <Form.Control
                    type="search"
                    placeholder="Search"
                    className="me-2 border-dark"
                    aria-label="Search"
                    style={{ width: '200px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline-success" className="text-dark">Search</Button>
            </Form>
            <div className="dashboard-container">
                <Container style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '7px' }}>
                    {filteredCourses.map((course, index) => (
                        <Card
                            key={course.CourseID}
                            style={{ width: '15rem', height: '18rem', display: 'flex', flexDirection: 'column', gap: '5px', transition: 'transform 0.2s', transform: hoveredCards[index] ? 'scale(1.05)' : 'scale(1)', position: 'relative' }}
                            onMouseEnter={() => handleCardHover(index, true)}
                            onMouseLeave={() => handleCardHover(index, false)}
                        >
                            <Card.Body style={{ gap: '5px' }}>
                                <Card.Title style={{ alignSelf: "flex-start" }}>{course.CourseName}</Card.Title>
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
                                        <NavDropdown.Item onClick={() => handleDeleteCourse(course)}>
                                            Delete <FontAwesomeIcon icon={faTrash} />
                                        </NavDropdown.Item>
                                        <NavDropdown.Item onClick={() => handleUpdateCourse(course)}>
                                            Rename <FontAwesomeIcon icon={faPen} />
                                        </NavDropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Card>
                    ))}
                </Container>
            </div>

            <Button onClick={toggleFormDisplay} className="add-button">
                {showForm ? 'Hide Form' : '+ Add Course'}
            </Button>

            <Modal show={showForm} onHide={toggleFormDisplay}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Course</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="course-title">
                            <Form.Label>Course Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Course Title"
                                value={newCourse.CourseName}
                                onChange={(e) => setNewCourse({ ...newCourse, CourseName: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="professor-select">
                            <Form.Label>Select Professor</Form.Label>
                            <Form.Control
                                as="select"
                                value={newCourse.ProfessorID}
                                onChange={(e) => setNewCourse({ ...newCourse, ProfessorID: Number(e.target.value) })}
                                required
                            >
                                <option value="">Select a Professor</option>
                                {professors.map((prof) => (
                                    <option key={prof.UserID} value={prof.UserID}>{prof.UserName}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Search Students</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search Students"
                                value={studentSearchQuery}
                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Students</Form.Label>
                            <div className="student-list" style={{ maxHeight: '150px', overflowY: 'scroll' }}>
                                {students.filter(student =>
                                    student.UserName.toLowerCase().includes(studentSearchQuery.toLowerCase())
                                ).map((student) => (
                                    <Form.Check
                                        key={student.UserID}
                                        type="checkbox"
                                        id={`student-${student.UserID}`}
                                        label={student.UserName}
                                        onChange={() => handleStudentCheckbox(student.UserID)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the course "{courseToDelete?.CourseName}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Course</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="update-course-title">
                        <Form.Label>Course Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Course Title"
                            value={courseToUpdate?.CourseName || ''}
                            onChange={(e) => setCourseToUpdate(courseToUpdate ? { ...courseToUpdate, CourseName: e.target.value } : null)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="update-professor-select">
                        <Form.Label>Select Professor</Form.Label>
                        <Form.Control
                            as="select"
                            value={courseToUpdate?.ProfessorID || 0}
                            onChange={(e) => setCourseToUpdate(courseToUpdate ? { ...courseToUpdate, ProfessorID: Number(e.target.value) } : null)}
                            required
                        >
                            <option value="">Select a Professor</option>
                            {professors.map((prof) => (
                                <option key={prof.UserID} value={prof.UserID}>{prof.UserName}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DashBoard;
