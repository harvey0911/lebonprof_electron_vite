import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import axiosapi from "../api";
import { 
    Trash2, Edit, Plus, Search, MoreVertical, X, 
    CheckCircle2, Circle, ListChecks, Calendar 
} from 'lucide-react';

interface Task {
    TaskID: number;
    TaskName: string;
    Description: string;
    TaskDate: string;
    Completed: boolean;
}

function TaskComponent() {
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [taskToUpdate, setTaskToUpdate] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState<Task>({ 
        TaskID: 0, TaskName: '', Description: '', TaskDate: '', Completed: false 
    });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    const toggleFormDisplay = () => setShowForm(!showForm);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosapi.post('/addtask', newTask);
            setNewTask({ TaskID: 0, TaskName: '', Description: '', TaskDate: '', Completed: false });
            setShowForm(false);
            fetchTasks();
        } catch (error) {
            console.error('Error creating task', error);
        }
    };

    const toggleCompletion = async (task: Task) => {
        try {
            // Logic for toggling completion (API call or local state)
            const updatedTask = { ...task, Completed: !task.Completed };
            setTasks(tasks.map(t => t.TaskID === task.TaskID ? updatedTask : t));
            // await axiosapi.put(`/updatetask/${task.TaskID}`, updatedTask);
        } catch (error) {
            console.error('Error toggling task', error);
        }
    };

    const handleConfirmDelete = async () => {
        if (taskToDelete) {
            try {
                await axiosapi.delete(`/deletetask/${taskToDelete.TaskID}`);
                setTasks(tasks.filter(t => t.TaskID !== taskToDelete.TaskID));
                setShowDeleteModal(false);
                setTaskToDelete(null);
            } catch (error) {
                console.error('Error deleting task', error);
            }
        }
    };

    const handleSaveUpdate = async () => {
        if (taskToUpdate) {
            try {
                await axiosapi.put(`/updatetask/${taskToUpdate.TaskID}`, taskToUpdate);
                setTasks(tasks.map(t => t.TaskID === taskToUpdate.TaskID ? taskToUpdate : t));
                setShowUpdateModal(false);
                setTaskToUpdate(null);
            } catch (error) {
                console.error('Error updating task', error);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            <SideBar />
            
            <main className="flex-1 ml-64 p-10 min-w-0">
                {/* Header Section: Replicated from Dashboard */}
                <div className="flex flex-wrap justify-between items-center mb-12 gap-6 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Checklist</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your daily priorities</p>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Search tasks..."
                                className="pl-11 pr-4 py-3 w-48 md:w-72 border-none bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={toggleFormDisplay}
                            className="bg-blue-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" /> Add Task
                        </button>
                    </div>
                </div>

                {/* Task Cards Grid: Replicated Dashboard Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {tasks.filter(t => t.TaskName.toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
                        <div key={task.TaskID} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative">
                            {/* Gradient Banner */}
                            <div className={`h-24 p-6 flex justify-between items-start relative overflow-hidden transition-colors ${task.Completed ? 'bg-slate-400' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}>
                                <button 
                                    onClick={() => toggleCompletion(task)}
                                    className="text-white hover:scale-110 transition-transform"
                                >
                                    {task.Completed ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8 opacity-60" />}
                                </button>
                                
                                <div className="relative">
                                    <button 
                                        onClick={() => setActiveDropdown(activeDropdown === task.TaskID ? null : task.TaskID)}
                                        className="p-2 hover:bg-white/20 rounded-full text-white transition-colors z-20 relative"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>

                                    {activeDropdown === task.TaskID && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 z-30 py-2 animate-in fade-in zoom-in duration-150">
                                                <button 
                                                    onClick={() => { setTaskToUpdate(task); setShowUpdateModal(true); setActiveDropdown(null); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-500" /> Edit Task
                                                </button>
                                                <button 
                                                    onClick={() => { setTaskToDelete(task); setShowDeleteModal(true); setActiveDropdown(null); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-8">
                                <h3 className={`text-xl font-black truncate transition-all ${task.Completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                    {task.TaskName}
                                </h3>
                                <p className="text-slate-400 text-sm mt-2 line-clamp-2 h-10 font-medium">
                                    {task.Description || "No description provided."}
                                </p>
                                <div className="flex items-center gap-2 mt-4 text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">{task.TaskDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Modals - All replicated and adjusted for Task fields */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">New Task</h3>
                            <button onClick={toggleFormDisplay} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                                <input 
                                    required type="text" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                    value={newTask.TaskName}
                                    onChange={(e) => setNewTask({ ...newTask, TaskName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Due Date</label>
                                <input 
                                    required type="date" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                    value={newTask.TaskDate}
                                    onChange={(e) => setNewTask({ ...newTask, TaskDate: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all">
                                Add Task
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal Replicated */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Task?</h3>
                        <p className="text-slate-500 font-medium mb-10">Remove <span className="text-slate-900 font-bold">"{taskToDelete?.TaskName}"</span> from your list?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskComponent;