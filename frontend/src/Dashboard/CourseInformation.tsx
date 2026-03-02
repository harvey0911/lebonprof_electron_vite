import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosapi from "../api";
import {
    Trash2,
    Edit,
    Plus,
    Search,
    X,
    Save,
    BookOpen,
    ClipboardCheck,
    FileText,
    CreditCard,
    User
} from 'lucide-react';
import Professor from '../Professor/Professor';
import Student from '../Student/Student';
import LeBonProfLogo from '../SideBar/LeBonProf.png';
import { useTranslation } from 'react-i18next';

function CourseInformation() {
    const { t } = useTranslation();
    const [courseTitle, setCourseTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');

    const [professor, setProfessor] = useState<Professor>();
    const [students, setStudents] = useState<Student[]>([]);
    const [students_not_enrolled, setStudents_not_enrolled] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const { courseId } = useParams();
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (courseId) {
                    const [courseRes, profRes, studentsRes, notEnrolledRes] = await Promise.all([
                        axiosapi.get(`/fetchCourse/${courseId}`),
                        axiosapi.get(`/fetchProfessorByCourse/${courseId}`),
                        axiosapi.get(`/fetchStudentsByCourse/${courseId}`),
                        axiosapi.get(`/fetch_Students_not_enrolled/${courseId}`)
                    ]);

                    setCourseTitle(courseRes.data.CourseName);
                    setNewCourseTitle(courseRes.data.CourseName);
                    setProfessor(profRes.data);
                    setStudents(studentsRes.data);
                    setStudents_not_enrolled(notEnrolledRes.data);
                }
            } catch (error) {
                console.error('Error fetching course information', error);
            }
        };
        fetchData();
    }, [courseId]);

    const handleRename = async () => {
        if (!courseId || !newCourseTitle.trim()) return;
        try {
            await axiosapi.put(`/updatecourse/${courseId}`, { CourseName: newCourseTitle });
            setCourseTitle(newCourseTitle);
            setIsEditingTitle(false);
        } catch (error) {
            console.error('Error updating course title', error);
        }
    };

    const handleStudentCheckbox = (studentId: number) => {
        setSelectedStudents(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const enrollStudents = async () => {
        try {
            await axiosapi.post('/enrollstudent', { courseId, selectedStudents });
            const [updatedStudents, updatedNotEnrolled] = await Promise.all([
                axiosapi.get(`/fetchStudentsByCourse/${courseId}`),
                axiosapi.get(`/fetch_Students_not_enrolled/${courseId}`)
            ]);
            setStudents(updatedStudents.data);
            setStudents_not_enrolled(updatedNotEnrolled.data);
            console.log('Students successfully enrolled');
        } catch (error) {
            console.error('Error enrolling students', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await enrollStudents();
            setSelectedStudents([]);
            setShowForm(false);
        } catch (error) {
            console.error('Error in enrollment', error);
        }
    };

    const removeStudent = async (UserID: number) => {
        try {
            await axiosapi.put(`/remove_from_course`, { UserID, CourseID: courseId });
            setStudents(students.filter(user => user.UserID !== UserID));
            const updatedNotEnrolled = await axiosapi.get(`/fetch_Students_not_enrolled/${courseId}`);
            setStudents_not_enrolled(updatedNotEnrolled.data);
        } catch (error) {
            console.error('Error removing student', error);
        }
    };

    const navItems = [
        { label: t('course_info'), icon: BookOpen, path: `/course/${courseId}` },
        { label: t('attendance'), icon: ClipboardCheck, path: `/attendance/${courseId}` },
        { label: t('files'), icon: FileText, path: `/files/${courseId}` },
        { label: t('payment'), icon: CreditCard, path: `/payment/${courseId}` },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-8">
                        <div onClick={() => navigate('/Dashboard')} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform p-1.5">
                                <img src={LeBonProfLogo} alt="LeBonProf Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight">LeBonProf</span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {navItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                        ${isActive(item.path)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="hidden md:block relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none text-sm font-bold text-slate-700 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-6 md:p-10 max-w-7xl">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                {isEditingTitle ? (
                                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border-2 border-blue-100">
                                        <input
                                            type="text"
                                            value={newCourseTitle}
                                            onChange={(e) => setNewCourseTitle(e.target.value)}
                                            className="text-3xl font-black text-slate-900 bg-transparent outline-none min-w-[300px]"
                                            autoFocus
                                        />
                                        <button onClick={handleRename} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                            <Save className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => { setIsEditingTitle(false); setNewCourseTitle(courseTitle); }} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 group">
                                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                            {courseTitle}
                                        </h1>
                                        <button
                                            onClick={() => setIsEditingTitle(true)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 font-medium">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="uppercase tracking-wider text-xs font-bold">{t('professor')}</span>
                                <span className="text-slate-900 font-bold">{professor?.UserName || '...'}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-200 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> {t('add_student')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                {t('enrolled_students')}
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">{students.length}</span>
                            </h3>

                            {students.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">{t('no_enrolled_students')}</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-slate-100">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">{t('student_name')}</th>
                                                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {students.map((student) => (
                                                <tr key={student.UserID} className="hover:bg-slate-50/50 transition duration-150">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                                                                {student.UserName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-slate-700">{student.UserName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => removeStudent(student.UserID)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title={t('remove_from_course')}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900">{t('enroll_students')}</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="text-slate-400 w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[70vh]">
                            <div className="flex-1 overflow-y-auto min-h-0 pr-2 mb-6 custom-scrollbar">
                                {students_not_enrolled.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 font-bold">
                                        {t('all_students_enrolled')}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {students_not_enrolled.map((student) => (
                                            <label
                                                key={student.UserID}
                                                className={`
                                                    flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all
                                                    ${selectedStudents.includes(student.UserID)
                                                        ? 'border-blue-500 bg-blue-50/50'
                                                        : 'border-transparent bg-slate-50 hover:bg-slate-100'}
                                                `}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
                                                    onChange={() => handleStudentCheckbox(student.UserID)}
                                                    checked={selectedStudents.includes(student.UserID)}
                                                />
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm">
                                                        {student.UserName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{student.UserName}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={selectedStudents.length === 0}
                                    className={`
                                        flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all
                                        ${selectedStudents.length === 0
                                            ? 'bg-slate-200 shadow-none cursor-not-allowed text-slate-400'
                                            : 'bg-blue-600 hover:bg-slate-900 shadow-blue-200 active:scale-95'}
                                    `}
                                >
                                    {t('enroll_selected')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseInformation;
