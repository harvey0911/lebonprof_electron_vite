import { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import './ProfessorStyles.css'; // assuming you have similar styling for Professor
import axiosapi from "../api"; // Ensure you have the axios instance configured for your API
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Professor {
    UserID: number;
    UserName: string;
    UserType: string; // UserType will be 'Professor'
    PhoneNumber: string;
}

function Professor() {
    const [showForm, setShowForm] = useState(false);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [newProfessor, setNewProfessor] = useState<Professor>({ UserID: 0, UserName: '', UserType: 'Professor', PhoneNumber: '' });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [professorToDelete, setProfessorToDelete] = useState<number | null>(null);

    // Fetch professors from the server
    const fetchProfessors = async () => {
        try {
            const { data } = await axiosapi.get('/fetchprofessors'); // Make sure to implement this endpoint
            setProfessors(data);
        } catch (error) {
            console.error('Error fetching professors', error);
        }
    };

    useEffect(() => {
        fetchProfessors();
    }, []);

    const toggleFormDisplay = () => {
        setShowForm(!showForm);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axiosapi.post('/adduser', { ...newProfessor, UserType: 'Professor' }); // Ensure UserType is 'Professor'
            fetchProfessors();
            setShowForm(false);
            setNewProfessor({ UserID: 0, UserName: '', UserType: 'Professor', PhoneNumber: '' }); // Reset the form
        } catch (error) {
            console.error('Error adding professor', error);
        }
    };

    const removeProfessor = async (UserID: number) => {
        try {
            await axiosapi.delete(`/deleteuser/${UserID}`);
            setProfessors(professors.filter(professor => professor.UserID !== UserID));
        } catch (error) {
            console.error('Error deleting user', error);
        }
    };

    const handleDelete = (UserID: number) => {
        setProfessorToDelete(UserID);
        setShowDeleteConfirmation(true);
    };

    const confirmDelete = () => {
        if (professorToDelete !== null) {
            removeProfessor(professorToDelete);
            setProfessorToDelete(null); // Reset the state
        }
        setShowDeleteConfirmation(false);
    };

    const filteredProfessors = professors.filter(professor =>
        professor.UserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        professor.PhoneNumber.includes(searchQuery)
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

            <div className="professor-cards-container">
                {filteredProfessors.map((professor, index) => (
                    <div key={index} className="professor-card">
                        <div className="professor-info">
                            <h3>{professor.UserName}</h3>
                            <p>{professor.PhoneNumber}</p>
                        </div>
                        <div>
                            <button className="remove-professor-button" onClick={() => handleDelete(professor.UserID)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="main-content">
                <button onClick={toggleFormDisplay} className="add-button">
                    {showForm ? 'Close Form' : '+ Add Professor'}
                </button>

                {showForm && (
                    <div className="form-container">
                        <form onSubmit={handleSubmit} className="professor-form">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    className="form-input"
                                    id="name"
                                    type="text"
                                    placeholder="Professor Name"
                                    value={newProfessor.UserName}
                                    onChange={(e) => setNewProfessor({ ...newProfessor, UserName: e.target.value })}
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
                                    value={newProfessor.PhoneNumber}
                                    onChange={(e) => setNewProfessor({ ...newProfessor, PhoneNumber: e.target.value })}
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
                <Modal.Body>Are you sure you want to delete this professor?</Modal.Body>
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

export default Professor;
