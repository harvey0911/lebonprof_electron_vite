import { useState, useEffect } from "react";
import SideBar from "../SideBar/SideBar";
import './TaskStyles.css';
import axiosapi from "../api";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';

interface Task {
    TaskID: number;
    TaskName: string;
    Description: string;
    TaskDate: string;
    Completed: boolean;
}

function TaskComponent() {
    const [showForm, setShowForm] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState<Task>({ TaskID: 0, TaskName: '', Description: '', TaskDate: '', Completed: false });
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const toggleFormDisplay = () => {
        setShowForm(!showForm);
    };

    const fetchTasks = async () => {
        try {
            const { data } = await axiosapi.get('/fetchtask');
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axiosapi.post('/addtask', newTask);
            fetchTasks();
            setShowForm(false);
            setNewTask({ TaskID: 0, TaskName: '', Description: '', TaskDate: '', Completed: false });
        } catch (error) {
            console.error('Error adding task', error);
        }
    };

    const removeTask = async (taskID: number) => {
        try {
            await axiosapi.delete(`/deletetask/${taskID}`);
            setTasks(tasks.filter(task => task.TaskID !== taskID));
            setShowModal(false);  // Close the modal after deleting the task
        } catch (error) {
            console.error('Error deleting task', error);
        }
    };

    const toggleTaskCompletion = async (task: Task) => {
        try {
            const updatedTask = { ...task, Completed: !task.Completed };
            //await axiosapi.put(`/updatetask/${task.TaskID}`, updatedTask);
            setTasks(tasks.map(t => (t.TaskID === task.TaskID ? updatedTask : t)));
        } catch (error) {
            console.error('Error updating task', error);
        }
    };

    const handleCardClick = (task: Task) => {
        setSelectedTask(task);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTask(null);
    };

    return (
        <div className="parent-container">
            <SideBar />
            <Container>
                <Button onClick={toggleFormDisplay} className="my-3" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    + Add Task
                </Button>
                <Modal show={showForm} onHide={toggleFormDisplay}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="task-name">
                                <Form.Label>Task Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter task name"
                                    value={newTask.TaskName}
                                    onChange={(e) => setNewTask({ ...newTask, TaskName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Task description"
                                    value={newTask.Description}
                                    onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="task-date">
                                <Form.Label>Task Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={newTask.TaskDate}
                                    onChange={(e) => setNewTask({ ...newTask, TaskDate: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Button type="submit" variant="primary">Add Task</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                
                

                <div className=" row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                    {tasks.map((task) => (
                        <div key={task.TaskID} className="col">
                        <Card key={task.TaskID} className="task-card mb-3">
                            <Card.Body>
                                <Card.Title onClick={() => handleCardClick(task)}>{task.TaskName}</Card.Title>
                                <Card.Text onClick={() => handleCardClick(task)}>
                                    {task.Description.length > 100 ? `${task.Description.substring(0, 100)}...` : task.Description}
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <Badge bg={task.Completed ? "success" : "danger"} className="mt-2" style={{position: "absolute", bottom: "10px", left: "10px"}}>
                                        {task.Completed ? "Completed" : "Incomplete"}
                                    </Badge>
                                    <Button 
                                        variant={task.Completed ? "success" : "outline-success"} 
                                        className="rounded-circle"
                                        onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(task); }} 
                                        style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                                    >
                                        ✓
                                    </Button>
                                </div>
                               
                            </Card.Body>
                        </Card>
                        </div>
                    ))}
                </div>
            </Container>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Task Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTask && (
                        <>
                            <h5>{selectedTask.TaskName}</h5>
                            <p>{selectedTask.Description}</p> 
                            <p><strong>Date:</strong> {selectedTask.TaskDate}</p>
                            <p>
                                <strong>Status:</strong> 
                                <Badge bg={selectedTask.Completed ? "success" : "danger"}>
                                    {selectedTask.Completed ? "Completed" : "Incomplete"}
                                </Badge>
                            </p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => removeTask(selectedTask!.TaskID)}>Delete</Button>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TaskComponent;
