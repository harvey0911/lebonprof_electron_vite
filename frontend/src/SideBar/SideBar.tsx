
import { useNavigate } from 'react-router-dom';
import './SideBar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faListCheck } from '@fortawesome/free-solid-svg-icons/faListCheck';
import { faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

function SideBar() {
  const navigate = useNavigate();

  const navigateToDashboard = () => navigate('/Dashboard');
  const navigateToStudents = () => navigate('/Students');
  const navigateToProfessors = () => navigate('/Professors');
  const navigateToTasks = () => navigate('/Tasks');

  return (
    <div className="sidebar-container">
      <button onClick={navigateToDashboard} className="sidebar-button" > <FontAwesomeIcon icon={faBook}/> Dashboard </button>            
      <button onClick={navigateToStudents} className="sidebar-button"> <FontAwesomeIcon icon={faUser}/> Students</button>
      <button onClick={navigateToProfessors} className="sidebar-button"> <FontAwesomeIcon icon={faGraduationCap}/> Professors</button>
      <button onClick={navigateToTasks} className="sidebar-button"> <FontAwesomeIcon icon={faListCheck}/> Tasks</button>
    </div>
  );
}

export default SideBar;
