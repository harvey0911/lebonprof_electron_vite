import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosapi from "../api";
import {
    Search,
    BookOpen,
    ClipboardCheck,
    FileText,
    CreditCard,
    Calendar as CalendarIcon,
    Save,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Student from '../Student/Student';
import LeBonProfLogo from '../SideBar/LeBonProf.png';
import { useTranslation } from 'react-i18next';

function Attendance() {
    const { t } = useTranslation();
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [students, setStudents] = useState<Student[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (courseId) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    const response = await axiosapi.get(`/fetchStudentsStatus/${courseId}?date=${formattedDate}`);
                    setStudents(response.data);
                }
            } catch (error) {
                console.error('Error fetching attendance data', error);
            }
        };
        fetchData();
    }, [courseId, selectedDate]);

    const updateStatus = (studentId: number, newStatus: string) => {
        setStudents(prev => prev.map(s =>
            s.UserID === studentId ? { ...s, Status: newStatus } : s
        ));
    };

    const handleSaveAttendance = async () => {
        setIsSaving(true);
        try {
            const attendanceData = students.map(student => ({
                studentId: student.UserID,
                courseId: courseId,
                date: selectedDate.toISOString().split('T')[0],
                status: student.Status
            }));

            await axiosapi.post('/saveAttendance', attendanceData);
            alert(t('attendance_saved'));
        } catch (error) {
            console.error('Error saving attendance', error);
            alert(t('attendance_failed'));
        } finally {
            setIsSaving(false);
        }
    };

    const navItems = [
        { label: t('course_info'), icon: BookOpen, path: `/course/${courseId}` },
        { label: t('attendance'), icon: ClipboardCheck, path: `/attendance/${courseId}` },
        { label: t('files'), icon: FileText, path: `/files/${courseId}` },
        { label: t('payment'), icon: CreditCard, path: `/payment/${courseId}` },
    ];

    const isActive = (path: string) => location.pathname === path;

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700 border-green-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Late': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Present': return t('present');
            case 'Absent': return t('absent');
            case 'Late': return t('late');
            default: return t('not_marked');
        }
    };

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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                        ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
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
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">{t('select_date')}</label>
                                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer">
                                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date: Date) => setSelectedDate(date)}
                                        className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAttendance}
                            disabled={isSaving}
                            className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? t('saving') : t('save_attendance')}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50">
                        <h3 className="text-xl font-black text-slate-900">{t('student_roll_call')}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400">{t('student')}</th>
                                    <th className="px-8 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">{t('status')}</th>
                                    <th className="px-8 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">{t('mark_attendance')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <tr key={student.UserID} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                                    {student.UserName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-700">{student.UserName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusStyles(student.Status || '')}`}>
                                                {getStatusLabel(student.Status || '')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => updateStatus(student.UserID, 'Present')}
                                                    className={`p-2 rounded-xl transition-all ${student.Status === 'Present' ? 'bg-green-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                                                    title={t('present')}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(student.UserID, 'Absent')}
                                                    className={`p-2 rounded-xl transition-all ${student.Status === 'Absent' ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title={t('absent')}
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(student.UserID, 'Late')}
                                                    className={`p-2 rounded-xl transition-all ${student.Status === 'Late' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                                    title={t('late')}
                                                >
                                                    <Clock className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Attendance;
