import { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import './ProfessorStyles.css'; // assuming you have similar styling for Professor
import axiosapi from "../api"; // Ensure you have the axios instance configured for your API

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
        let isMounted = true;

        fetchProfessors();

        return () => {
            isMounted = false;
        };
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

    return (
        <div className="parent-container">
            <SideBar />
            <div className="professor-cards-container">
                {professors.map((professor, index) => (
                    <div key={index} className="professor-card">
                        <div className="professor-info">
                            <h3>{professor.UserName}</h3>
                            <p>{professor.PhoneNumber}</p>
                        </div>
                        <div>
                            <button className="remove-professor-button" onClick={() => removeProfessor(professor.UserID)}>Delete</button>
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
        </div>
    );
}

export default Professor;
