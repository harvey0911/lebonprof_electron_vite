import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosapi from "../api";
import Professor from '../Professor/Professor';
import Student from '../Student/Student';
import SideBar from '../SideBar/SideBar';
import './CourseInformation.css';
function CourseInformation() {
    const [courseTitle, setCourseTitle] = useState('');
    const [professor, setProfessor] = useState<Professor>();
    const [students, setStudents] = useState<Student[]>([]);
    const { courseId } = useParams();

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
                }
            } catch (error) {
                console.error('Error fetching course information', error);
            }
        };
        fetchData();
    }, [courseId]); // Dependency array ensures the effect runs only when courseId changes

    

    return (
        <>
            <SideBar />
            <div className="course-information">
                <h1 className="course-title">{courseTitle}</h1>
                <h2 className="professor-name">{professor?.UserName}</h2>

                <div className="students-section">
                    <h3 className="students-heading">Enrolled Students</h3>
                    <ul className="students-list">
                        {students.map(student => (
                            <li key={student.UserID} className="student-item">
                                {student.UserName}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default CourseInformation;
