import { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import './StudentStyles.css';
import axiosapi from "../api"; // Ensure you have the axios instance configured for your API

interface Student {
    UserID: number;
    UserName: string;
    UserType: string; // Since UserType is either 'Student' or 'Professor'
    PhoneNumber: string;
}


function Student() {
    const [showForm, setShowForm] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState<Student>({ UserID: 0, UserName: '', UserType: 'Student', PhoneNumber: '' });

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
        let isMounted = true;


        fetchStudents();

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
            await axiosapi.post('/adduser', { ...newStudent, UserType: 'Student' }); // Ensure UserType is 'Student'
            fetchStudents(); // You may need to modify this to fetch only users where UserType is 'Student'
            setShowForm(false);
            setNewStudent({ UserID: 0, UserName: '', UserType: 'Student', PhoneNumber: '' }); // Reset the form
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


    return (
        <div className="parent-container">
            <SideBar />

            <div className="student-cards-container">
                {students.map((student, index) => (
                    <div key={index} className="student-card">
                        <div className="student-info">
                            <h3>{student.UserName}</h3>
                            <p>{student.PhoneNumber}</p>
                        </div>
                        <div>
                            <button className="remove-student-button" onClick={() => removeStudent(student.UserID)}>Delete</button>
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
        </div>
    );
}

export default Student;
