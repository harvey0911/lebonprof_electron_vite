import { useState } from "react";
import SideBar from "../SideBar/SideBar";
import './TaskStyles.css';
import axiosapi from "../api";
//import { ToastContainer,toast } from "react-toastify";


interface Task {
    
    TaskID: number;
    TaskName: string;
    Description: string;
    TaskDate: String;
}




function TaskComponent() {
    const [showForm, setShowForm] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState<Task>({ TaskID :0, TaskName: '', Description: '', TaskDate:''});

    const toggleFormDisplay = () => {
        setShowForm(!showForm);
    };


    const fetchtasks =async () => {

        try {
            const {data}=await axiosapi.get('/fetchtask')
            setTasks(data)


        } catch (error) {
            
        }
        
    }

    const handleSubmit  = async (e: React.FormEvent<HTMLFormElement>) => {
        
        e.preventDefault();
        try {

            await axiosapi.post('/addtask',newTask)

            fetchtasks()
            setShowForm(false)
            
        } catch (error) {


            
        }
        
    };

     

    const removeTask = async (taskID: number) => {
        try {
            await axiosapi.delete(`/deletetask/${taskID}`);
            setTasks(tasks.filter(task => task.TaskID !== taskID));
        } catch (error) {
            console.error('Error deleting task', error);
        }
    };
    
    
    return (
        <div className="parent-container">

            <div>
                <SideBar />
            </div>

            <div className="task-cards-container">
                {tasks.map((task, index) => (
                    <div key={index} className="task-card">
                        <h3>{task.TaskName}</h3>
                        <p>{task.Description}</p>
                        <button className="remove-task-button" onClick={() => removeTask(task.TaskID)}>Delete</button>
                    </div>
                ))}
            </div>

            <div className="main-content">
                <button onClick={toggleFormDisplay} className="add-button">
                    {showForm ? 'Close Form' : '+ Add Task'}
                </button>

                {showForm && (
                    <div className="form-container">
                        <form onSubmit={handleSubmit} className="task-form">
                            <div className="form-group">
                                <label htmlFor="task-name" className="form-label">Task Name</label>
                                <input
                                    className="form-input"
                                    id="task-name"
                                    type="text"
                                    placeholder="Enter task name"
                                    value={newTask.TaskName}
                                    onChange={(e) => setNewTask({ ...newTask, TaskName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="Description" className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    id="Description"
                                    placeholder="Task Description"
                                    value={newTask.Description}
                                    onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-task-button">Add Task</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskComponent;
