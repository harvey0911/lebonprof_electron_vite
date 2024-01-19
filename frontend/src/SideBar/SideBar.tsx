
import { useNavigate } from 'react-router-dom';
import './SideBar.css'; 

function SideBar() {
  const navigate = useNavigate();

  const navigateToDashboard = () => navigate('/Dashboard');
  const navigateToStudents = () => navigate('/Students');
  const navigateToProfessors = () => navigate('/Professors');
  const navigateToTasks = () => navigate('/Tasks');

  return (
    <div className="sidebar-container">
      <button onClick={navigateToDashboard} className="sidebar-button">Dashboard</button>
      <button onClick={navigateToStudents} className="sidebar-button">Students</button>
      <button onClick={navigateToProfessors} className="sidebar-button">Professors</button>
      <button onClick={navigateToTasks} className="sidebar-button">Tasks</button>
    </div>
  );
}

export default SideBar;
