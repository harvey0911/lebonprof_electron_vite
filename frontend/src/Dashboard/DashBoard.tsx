import React, { useState, useEffect } from 'react';
import Professor from '../Professor/Professor';
import Student from '../Student/Student';
import SideBar from '../SideBar/SideBar';
import axiosapi from "../api";
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Plus, Search, MoreVertical, X, User, GraduationCap } from 'lucide-react';

interface Course {
    CourseName: string;
    ProfessorID: number;
    CourseID: number;
}

function DashBoard() {
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [courseToUpdate, setCourseToUpdate] = useState<Course | null>(null);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [newCourse, setNewCourse] = useState<Course>({ CourseName: '', ProfessorID: 0, CourseID: 0 });
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profs, studs, crs] = await Promise.all([
                    axiosapi.get('/fetchprofessors'),
                    axiosapi.get('/fetchstudents'),
                    axiosapi.get('/fetchCourses')
                ]);
                setProfessors(profs.data);
                setStudents(studs.data);
                setCourses(crs.data);
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };
        fetchData();
    }, []);

    const toggleFormDisplay = () => setShowForm(!showForm);

    const handleStudentCheckbox = (studentId: number) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosapi.post('/addcourse', newCourse);
            const courseId = response.data.CourseID;
            await axiosapi.post('/enrollstudent', { courseId, selectedStudents });
            setNewCourse({ CourseName: '', ProfessorID: 0, CourseID: 0 });
            setSelectedStudents([]);
            setShowForm(false);
            const coursesResponse = await axiosapi.get('/fetchCourses');
            setCourses(coursesResponse.data);
        } catch (error) {
            console.error('Error creating course', error);
        }
    };

    const handleConfirmDelete = async () => {
        if (courseToDelete) {
            try {
                await axiosapi.delete(`/deletecourse/${courseToDelete.CourseID}`);
                setCourses(courses.filter(c => c.CourseID !== courseToDelete.CourseID));
                setShowDeleteModal(false);
                setCourseToDelete(null);
            } catch (error) {
                console.error('Error deleting course', error);
            }
        }
    };

    const handleSaveUpdate = async () => {
        if (courseToUpdate) {
            try {
                await axiosapi.put(`/updatecourse/${courseToUpdate.CourseID}`, courseToUpdate);
                setCourses(courses.map(c => c.CourseID === courseToUpdate.CourseID ? courseToUpdate : c));
                setShowUpdateModal(false);
                setCourseToUpdate(null);
            } catch (error) {
                console.error('Error updating course', error);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            <SideBar />
            
            <main className="flex-1 ml-64 p-10 min-w-0">
                <div className="flex flex-wrap justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Courses</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your active classes</p>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Search courses..."
                                className="pl-11 pr-4 py-3 w-48 md:w-72 border-none bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={toggleFormDisplay}
                            className="bg-blue-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" /> Add Class
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {courses.filter(c => c.CourseName.toLowerCase().includes(searchQuery.toLowerCase())).map((course) => (
                        <div key={course.CourseID} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative">
                            <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 p-6 flex justify-end items-start relative overflow-hidden">
                                <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                
                                <div className="relative">
                                    <button 
                                        onClick={() => setActiveDropdown(activeDropdown === course.CourseID ? null : course.CourseID)}
                                        className="p-2 hover:bg-white/20 rounded-full text-white transition-colors z-20 relative"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>

                                    {activeDropdown === course.CourseID && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 z-30 py-2 animate-in fade-in zoom-in duration-150">
                                                <button 
                                                    onClick={() => { setCourseToUpdate(course); setShowUpdateModal(true); setActiveDropdown(null); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-500" /> Rename
                                                </button>
                                                <button 
                                                    onClick={() => { setCourseToDelete(course); setShowDeleteModal(true); setActiveDropdown(null); }}
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
                                <h3 
                                    onClick={() => navigate(`/course/${course.CourseID}`)}
                                    className="text-xl font-black text-slate-900 hover:text-blue-600 cursor-pointer truncate transition-colors leading-tight"
                                >
                                    {course.CourseName}
                                </h3>
                                <div className="flex items-center gap-2 mt-3 text-slate-400">
                                    <GraduationCap className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Academic Year 2026</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Create New Course</h3>
                            <button onClick={toggleFormDisplay} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Course Title</label>
                                <input 
                                    required type="text" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                    placeholder="e.g. Advanced Mathematics"
                                    value={newCourse.CourseName}
                                    onChange={(e) => setNewCourse({ ...newCourse, CourseName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Professor</label>
                                <select 
                                    required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 appearance-none"
                                    value={newCourse.ProfessorID}
                                    onChange={(e) => setNewCourse({ ...newCourse, ProfessorID: Number(e.target.value) })}
                                >
                                    <option value="">Choose a Professor</option>
                                    {professors.map(p => <option key={p.UserID} value={p.UserID}>{p.UserName}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all active:scale-95">
                                Add to Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showUpdateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-slate-900 mb-8">Rename Course</h3>
                        <div className="space-y-6">
                            <input 
                                required type="text" className="w-full p-4 bg-slate-50 border-2 border-blue-500 rounded-2xl outline-none font-bold text-slate-800"
                                value={courseToUpdate?.CourseName || ''}
                                onChange={(e) => setCourseToUpdate(courseToUpdate ? { ...courseToUpdate, CourseName: e.target.value } : null)}
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setShowUpdateModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
                                <button onClick={handleSaveUpdate} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Course?</h3>
                        <p className="text-slate-500 font-medium mb-10">This will permanently remove <span className="text-slate-900 font-bold">"{courseToDelete?.CourseName}"</span>.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200 active:scale-95">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashBoard;