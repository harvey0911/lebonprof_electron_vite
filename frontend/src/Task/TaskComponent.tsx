import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import axiosapi from "../api";
import { 
    Trash2, Plus, Search, X, 
    CheckCircle2, Circle, Calendar, ClipboardList, AlertTriangle, ListFilter
} from 'lucide-react';

interface Task {
    TaskID: number;
    Description: string;
    Status: number; 
    CreatedAt: string;
}

function TaskComponent() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [newDescription, setNewDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest-pending'>('newest');

    const fetchTasks = async () => {
        try {
            const { data } = await axiosapi.get('/fetchtask');
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosapi.post('/addtask', { Description: newDescription });
            setNewDescription('');
            setShowForm(false);
            fetchTasks();
        } catch (error) {
            console.error('Error creating task', error);
        }
    };

    const handleToggleStatus = async (task: Task) => {
        try {
            const newStatus = task.Status === 0 ? 1 : 0;
            await axiosapi.put(`/updatetask/${task.TaskID}`, { 
                Description: task.Description, 
                Status: newStatus 
            });
            fetchTasks();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const handleConfirmDelete = async () => {
        if (taskToDelete) {
            try {
                await axiosapi.delete(`/deletetask/${taskToDelete.TaskID}`);
                setTasks(prev => prev.filter(t => t.TaskID !== taskToDelete.TaskID));
                setShowDeleteModal(false);
                setTaskToDelete(null);
            } catch (error) {
                console.error('Error deleting task', error);
            }
        }
    };

    const filteredTasks = tasks.filter(task => 
        task.Description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
        }
        if (sortBy === 'oldest-pending') {
            if (a.Status !== b.Status) return a.Status - b.Status;
            return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
        }
        return 0;
    });

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            <SideBar />
            
            <main className="flex-1 ml-64 p-10 min-w-0">
                {/* Header Section */}
                <div className="flex flex-wrap justify-between items-center mb-8 gap-6 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checklist</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage administrative task flow</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                            <ListFilter size={16} className="text-slate-400" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-transparent outline-none text-xs font-bold text-slate-600 cursor-pointer"
                            >
                                <option value="newest">Sort: Newest</option>
                                <option value="oldest-pending">Sort: Priority</option>
                            </select>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg w-48 focus:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 text-sm"
                        >
                            <Plus size={18} /> New Task
                        </button>
                    </div>
                </div>

                {/* List View Table */}
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 w-16 text-center">Status</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Task Description</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 w-40">Date Created</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedTasks.length > 0 ? (
                                sortedTasks.map((task) => (
                                    <tr key={task.TaskID} className={`group hover:bg-slate-50/50 transition-colors ${task.Status ? 'bg-slate-50/30' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(task)}
                                                className={`transition-all transform active:scale-90 ${task.Status ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                                            >
                                                {task.Status ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-semibold transition-all ${task.Status ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                    {task.Description}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded-full w-fit ${task.Status ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                                    {task.Status ? 'Completed' : 'Pending'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(task.CreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => { setTaskToDelete(task); setShowDeleteModal(true); }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                                title="Delete Task"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <ClipboardList className="text-slate-200 mb-3" size={48} />
                                            <p className="text-slate-400 font-bold text-sm">No tasks found in the records</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Task Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-slate-900">Add New Entry</h2>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Description</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm transition-all"
                                        placeholder="Enter administrative task details..."
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm">
                                    Create Task
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center border border-slate-200">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 mb-1">Confirm Deletion</h2>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Are you sure you want to remove this record? This cannot be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors text-sm">Cancel</button>
                                <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default TaskComponent;