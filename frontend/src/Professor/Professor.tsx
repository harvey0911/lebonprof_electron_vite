import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar/SideBar';
import axiosapi from "../api";
import { Search, Plus, Trash2, X, Phone, UserCheck, AlertCircle, Hash } from 'lucide-react';

interface Professor {
    UserID: number;
    UserName: string;
    UserType: string;
    PhoneNumber: string;
}

function Professor() {
    const [showForm, setShowForm] = useState(false);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [newProfessor, setNewProfessor] = useState<Professor>({ UserID: 0, UserName: '', UserType: 'Professor', PhoneNumber: '' });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [professorToDelete, setProfessorToDelete] = useState<number | null>(null);

    const fetchProfessors = async () => {
        try {
            const { data } = await axiosapi.get('/fetchprofessors');
            setProfessors(data);
        } catch (error) {
            console.error('Error fetching professors', error);
        }
    };

    useEffect(() => {
        fetchProfessors();
    }, []);

    const toggleFormDisplay = () => setShowForm(!showForm);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axiosapi.post('/adduser', { ...newProfessor, UserType: 'Professor' });
            fetchProfessors();
            setShowForm(false);
            setNewProfessor({ UserID: 0, UserName: '', UserType: 'Professor', PhoneNumber: '' });
        } catch (error) {
            console.error('Error adding professor', error);
        }
    };

    const confirmDelete = async () => {
        if (professorToDelete !== null) {
            try {
                await axiosapi.delete(`/deleteuser/${professorToDelete}`);
                setProfessors(professors.filter(p => p.UserID !== professorToDelete));
                setProfessorToDelete(null);
                setShowDeleteModal(false);
            } catch (error) {
                console.error('Error deleting user', error);
            }
        }
    };

    const filteredProfessors = professors.filter(p =>
        p.UserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.PhoneNumber.includes(searchQuery)
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            <SideBar />

            <main className="flex-1 ml-64 p-10 min-w-0">
                {/* Header Section */}
                <div className="flex flex-wrap justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Professors</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage faculty members and instructors</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search faculty..."
                                className="pl-11 pr-4 py-3 w-48 md:w-72 border-none bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={toggleFormDisplay}
                            className="bg-blue-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" /> Add Professor
                        </button>
                    </div>
                </div>

                {/* List View Container */}
                <div className="space-y-4 max-w-5xl">
                    {filteredProfessors.map((prof) => (
                        <div key={prof.UserID} className="bg-white p-4 px-8 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-slate-50 group-hover:bg-blue-50 rounded-2xl text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{prof.UserName}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                            <Phone className="w-3.5 h-3.5" />
                                            {prof.PhoneNumber}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                            <Hash className="w-3.5 h-3.5" />
                                            Staff ID: {prof.UserID}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setProfessorToDelete(prof.UserID); setShowDeleteModal(true); }}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                title="Remove Professor"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    {filteredProfessors.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <p className="text-slate-400 font-medium">No professors found.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Professor Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Add Faculty</h3>
                            <button onClick={toggleFormDisplay} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Professor Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                    placeholder="Professor Name"
                                    value={newProfessor.UserName}
                                    onChange={(e) => setNewProfessor({ ...newProfessor, UserName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                    placeholder="e.g., +1234567890" 
                                    value={newProfessor.PhoneNumber}
                                    onChange={(e) => setNewProfessor({ ...newProfessor, PhoneNumber: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all active:scale-95">
                                Add to Faculty
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Remove Faculty?</h3>
                        <p className="text-slate-500 font-medium mb-10">This will remove the professor from the directory. This action is permanent.</p>
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

export default Professor;