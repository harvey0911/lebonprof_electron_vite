import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import axiosapi from "../api";
import { Search, Plus, Trash2, X, Phone, User, AlertCircle, Hash } from 'lucide-react';

interface Student {
    UserID: number;
    UserName: string;
    UserType: string;
    PhoneNumber: string;
    Status: string;
}

function Student() {
    const [showForm, setShowForm] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState<Student>({ UserID: 0, UserName: '', UserType: 'Student', PhoneNumber: '', Status: '' });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

    const fetchStudents = async () => {
        try {
            const { data } = await axiosapi.get('/fetchstudents');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students', error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const toggleFormDisplay = () => setShowForm(!showForm);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axiosapi.post('/adduser', { ...newStudent, UserType: 'Student' });
            fetchStudents();
            setShowForm(false);
            setNewStudent({ UserID: 0, UserName: '', UserType: 'Student', PhoneNumber: '', Status: '' });
        } catch (error) {
            console.error('Error adding student', error);
        }
    };

    const confirmDelete = async () => {
        if (studentToDelete !== null) {
            try {
                await axiosapi.delete(`/deleteuser/${studentToDelete}`);
                setStudents(students.filter(user => user.UserID !== studentToDelete));
                setStudentToDelete(null);
                setShowDeleteModal(false);
            } catch (error) {
                console.error('Error deleting user', error);
            }
        }
    };

    const filteredStudents = students.filter(student =>
        student.UserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.PhoneNumber.includes(searchQuery)
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            <SideBar />

            <main className="flex-1 ml-64 p-10 min-w-0">
                <div className="flex flex-wrap justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Students</h1>
                        <p className="text-slate-500 font-medium mt-1">Directory of all enrolled students</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="pl-11 pr-4 py-3 w-48 md:w-72 border-none bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={toggleFormDisplay}
                            className="bg-blue-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" /> Add Student
                        </button>
                    </div>
                </div>

                {/* List View Container */}
                <div className="space-y-4 max-w-5xl">
                    {filteredStudents.map((student) => (
                        <div key={student.UserID} className="bg-white p-4 px-8 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-slate-50 group-hover:bg-blue-50 rounded-2xl text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{student.UserName}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                            <Phone className="w-3.5 h-3.5" />
                                            {student.PhoneNumber}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                            <Hash className="w-3.5 h-3.5" />
                                            ID: {student.UserID}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setStudentToDelete(student.UserID); setShowDeleteModal(true); }}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                title="Delete Student"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <p className="text-slate-400 font-medium">No students found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">New Student</h3>
                            <button onClick={toggleFormDisplay} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                    placeholder="student name"
                                    value={newStudent.UserName}
                                    onChange={(e) => setNewStudent({ ...newStudent, UserName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                    placeholder="e.g., +1234567890"
                                    value={newStudent.PhoneNumber}
                                    onChange={(e) => setNewStudent({ ...newStudent, PhoneNumber: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all active:scale-95">
                                Save Student
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
                        <p className="text-slate-500 font-medium mb-10">This record will be permanently deleted.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200 active:scale-95 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Student;