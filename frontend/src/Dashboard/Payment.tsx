import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosapi from "../api";
import {
    Search,
    BookOpen,
    ClipboardCheck,
    FileText,
    CreditCard,
    GraduationCap,
    DollarSign,
    Save,
    CheckCircle2,
    AlertCircle,
    XCircle
} from 'lucide-react';
import Student from '../Student/Student';

function Payment() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [students, setStudents] = useState<Student[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (courseId) {
                    // Fetching students specifically for the payment view
                    const studentsResponse = await axiosapi.get(`/fetchStudentsByCourse/${courseId}`);
                    setStudents(studentsResponse.data);
                }
            } catch (error) {
                console.error('Error fetching enrolled students', error);
            }
        };
        fetchData();
    }, [courseId]);

    const updatePaymentStatus = (studentId: number, newStatus: string) => {
        setStudents(prev => prev.map(s =>
            s.UserID === studentId ? { ...s, Status: newStatus } : s
        ));
    };

    const handleSavePayments = async () => {
        setIsSaving(true);
        try {
            // Adjust the endpoint according to your backend logic
            await axiosapi.post('/savePayments', { courseId, students });
            alert('Payment records updated successfully!');
        } catch (error) {
            console.error('Error saving payments', error);
            alert('Failed to save records.');
        } finally {
            setIsSaving(false);
        }
    };

    const navItems = [
        { label: 'Course Info', icon: BookOpen, path: `/course/${courseId}` },
        { label: 'Attendance', icon: ClipboardCheck, path: `/attendance/${courseId}` },
        { label: 'Files', icon: FileText, path: `/files/${courseId}` },
        { label: 'Payment', icon: CreditCard, path: `/payment/${courseId}` },
    ];

    const isActive = (path: string) => location.pathname === path;

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Unpaid': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Consistent Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-8">
                        <div onClick={() => navigate('/Dashboard')} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                                <GraduationCap className="w-6 h-6" />
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
                            <input type="text" placeholder="Filter by student..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none text-sm font-bold text-slate-700 transition-all placeholder:text-slate-400" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-6 md:p-10 max-w-7xl">
                {/* Header Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                                Tuition Tracking
                            </h1>
                            <p className="text-slate-500 font-bold flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Manage and record student payments for this course.
                            </p>
                        </div>

                        <button
                            onClick={handleSavePayments}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Updating...' : 'Save Records'}
                        </button>
                    </div>
                </div>

                {/* Payment Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Student Name</th>
                                    <th className="px-8 py-5 text-center text-xs font-black uppercase tracking-widest text-slate-400">Current Status</th>
                                    <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">Mark Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <tr key={student.UserID} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                                                    {student.UserName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{student.UserName}</span>
                                                    <span className="text-xs text-slate-400 font-medium">ID: #{student.UserID}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusStyles(student.Status || '...')}`}>
                                                {student.Status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => updatePaymentStatus(student.UserID, 'Paid')}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all ${student.Status === 'Paid' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Paid
                                                </button>
                                                <button
                                                    onClick={() => updatePaymentStatus(student.UserID, 'Pending')}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all ${student.Status === 'Pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600'}`}
                                                >
                                                    <AlertCircle className="w-4 h-4" /> Pending
                                                </button>
                                                <button
                                                    onClick={() => updatePaymentStatus(student.UserID, 'Unpaid')}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all ${student.Status === 'Unpaid' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}
                                                >
                                                    <XCircle className="w-4 h-4" /> Unpaid
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

export default Payment;