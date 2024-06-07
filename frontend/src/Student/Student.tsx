import { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import './StudentStyles.css';
import axiosapi from "../api"; // Ensure you have the axios instance configured for your API
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Student {
    UserID: number;
    UserName: string;
    UserType: string; // Since UserType is either 'Student' or 'Professor'
    PhoneNumber: string;
    Status: string;
}

function Student() {
    const [showForm, setShowForm] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState<Student>({ UserID: 0, UserName: '', UserType: 'Student', PhoneNumber: '', Status: '' });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<number | null>(null); // State to hold the ID of the student to be deleted

    // Fetch students from the server
    const fetchStudents = async () => {
        try {
            const { data } = await axiosapi.get('/fetchstudents');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students', error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const toggleFormDisplay = () => {
        setShowForm(!showForm);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axiosapi.post('/adduser', { ...newStudent, UserType: 'Student' });
            fetchStudents();
            setShowForm(false);
            setNewStudent({ UserID: 0, UserName: '', UserType: 'Student', PhoneNumber: '', Status: '' });
        } catch (error) {
            console.error('Error adding student', error);
        }
    };

    const removeStudent = async (UserID: number) => {
        try {
            await axiosapi.delete(`/deleteuser/${UserID}`);
            setStudents(students.filter(user => user.UserID !== UserID));
        } catch (error) {
            console.error('Error deleting user', error);
        }
    };

    const handleDelete = (UserID: number) => {
        setStudentToDelete(UserID); // Set the student ID to be deleted
        setShowDeleteConfirmation(true);
    };

    const confirmDelete = () => {
        if (studentToDelete !== null) {
            removeStudent(studentToDelete);
            setStudentToDelete(null); // Reset the state
        }
        setShowDeleteConfirmation(false);
    };

    // Filter students based on search query
    const filteredStudents = students.filter(student =>
        student.UserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.PhoneNumber.includes(searchQuery)
    );  

    return (
        <div className="parent-container">
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

            <div className="student-cards-container">
                {filteredStudents.map((student, index) => (
                    <div key={index} className="student-card">
                        <div className="student-info">
                            <h3>{student.UserName}</h3>
                            <p>{student.PhoneNumber}</p>
                        </div>
                        <div>
                            <button className="remove-student-button" onClick={() => handleDelete(student.UserID)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="main-content">
                <button onClick={toggleFormDisplay} className="add-button">
                    {showForm ? 'Close Form' : '+ Add Student'}
                </button>

                {showForm && (
                    <div className="form-container">
                        <form onSubmit={handleSubmit} className="student-form">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    className="form-input"
                                    id="name"
                                    type="text"
                                    placeholder="Student Name"
                                    value={newStudent.UserName}
                                    onChange={(e) => setNewStudent({ ...newStudent, UserName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone-number" className="form-label">Phone Number</label>
                                <input
                                    className="form-input"
                                    id="phone-number"
                                    type="tel"
                                    placeholder="+212 6"
                                    value={newStudent.PhoneNumber}
                                    onChange={(e) => setNewStudent({ ...newStudent, PhoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-button">Submit</button>
                        </form>
                    </div>
                )}
            </div>

            <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this student?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Student;
