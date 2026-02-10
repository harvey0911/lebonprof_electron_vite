import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosapi from "../api";
import {
    Search,
    BookOpen,
    ClipboardCheck,
    FileText,
    CreditCard,
    DollarSign,
    Save,
    Plus,
    History,
    Download,
    X
} from 'lucide-react';
import jsPDF from 'jspdf';
import LeBonProfLogo from '../SideBar/LeBonProf.png';

interface Student {
    UserID: number;
    UserName: string;
    Status?: string; // Kept for compatibility but calculated dynamically
    PhoneNumber?: string;
}

interface PaymentRecord {
    PaymentID: number;
    CourseID: number;
    StudentID: number;
    Amount: number;
    PaymentDate: string;
    Notes?: string;
    StudentName?: string;
}

function Payment() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [students, setStudents] = useState<Student[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Form State
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchData();
        }
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [studentsRes, paymentsRes] = await Promise.all([
                axiosapi.get(`/fetchStudentsByCourse/${courseId}`),
                axiosapi.get(`/payments/${courseId}`)
            ]);
            setStudents(studentsRes.data);
            setPayments(paymentsRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const getStudentTotalPaid = (studentId: number) => {
        return payments
            .filter(p => p.StudentID === studentId)
            .reduce((sum, p) => sum + p.Amount, 0);
    };

    const handleOpenPaymentModal = (student: Student) => {
        setSelectedStudent(student);
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setIsPaymentModalOpen(true);
    };

    const handleOpenHistoryModal = (student: Student) => {
        setSelectedStudent(student);
        setIsHistoryModalOpen(true);
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !amount) return;

        setIsSubmitting(true);
        try {
            // Generate PDF Receipt
            const doc = new jsPDF();
            // Add Logo
            const img = new Image();
            img.src = LeBonProfLogo;
            doc.addImage(img, 'PNG', 15, 15, 20, 20);

            // Header
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('Payment Receipt', 105, 25, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('LeBonProf - Centre de soutien scolaire', 105, 30, { align: 'center' });
            doc.text(`Date: ${new Date(date).toLocaleDateString()}`, 105, 35, { align: 'center' });

            doc.setDrawColor(200, 200, 200);
            doc.line(15, 45, 195, 45);

            // Receipt Details
            doc.setFontSize(12);
            doc.text(`Student: ${selectedStudent.UserName}`, 20, 60);
            doc.text(`Student ID: #${selectedStudent.UserID}`, 20, 70);
            doc.text(`Course ID: ${courseId}`, 20, 80);

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`Amount Paid: ${parseFloat(amount).toLocaleString()} DH`, 20, 100);

            if (notes) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                doc.text(`Notes: ${notes}`, 20, 120);
            }

            doc.line(15, 130, 195, 130);
            doc.setFontSize(10);
            doc.text('Thank you for your payment!', 105, 140, { align: 'center' });

            const pdfString = doc.output('datauristring');

            await axiosapi.post('/payments', {
                courseId,
                studentId: selectedStudent.UserID,
                amount: parseFloat(amount),
                date,
                notes,
                receiptPdf: pdfString
            });
            await fetchData(); // Refresh data
            setIsPaymentModalOpen(false);
            alert('Payment recorded successfully!');
        } catch (error) {
            console.error('Error recording payment', error);
            alert('Failed to record payment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShareReceipt = (payment: PaymentRecord) => {
        if (!selectedStudent?.PhoneNumber) {
            alert('Student phone number is missing!');
            return;
        }

        // 1. Re-generate PDF for download
        const doc = new jsPDF();
        const img = new Image();
        img.src = LeBonProfLogo;
        doc.addImage(img, 'PNG', 15, 15, 20, 20);

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Receipt', 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('LeBonProf - Centre de soutien scolaire', 105, 30, { align: 'center' });
        doc.text(`Date: ${new Date(payment.PaymentDate).toLocaleDateString()}`, 105, 35, { align: 'center' });

        doc.setDrawColor(200, 200, 200);
        doc.line(15, 45, 195, 45);

        doc.setFontSize(12);
        doc.text(`Student: ${selectedStudent.UserName}`, 20, 60);
        doc.text(`Student ID: #${selectedStudent.UserID}`, 20, 70);
        doc.text(`Course ID: ${payment.CourseID}`, 20, 80);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Amount Paid: ${payment.Amount.toLocaleString()} DH`, 20, 100);

        if (payment.Notes) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Notes: ${payment.Notes}`, 20, 120);
        }

        doc.line(15, 130, 195, 130);
        doc.setFontSize(10);
        doc.text('Thank you for your payment!', 105, 140, { align: 'center' });

        // Save locally
        doc.save(`Receipt_${selectedStudent.UserName}_${payment.PaymentDate}.pdf`);
    };

    const navItems = [
        { label: 'Course Info', icon: BookOpen, path: `/course/${courseId}` },
        { label: 'Attendance', icon: ClipboardCheck, path: `/attendance/${courseId}` },
        { label: 'Files', icon: FileText, path: `/files/${courseId}` },
        { label: 'Payment', icon: CreditCard, path: `/payment/${courseId}` },
    ];

    const isActive = (path: string) => location.pathname === path;

    const filteredStudents = students.filter(student =>
        student.UserName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative">
            {/* Consistent Top Navigation */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
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
                                placeholder="Filter by student..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none text-sm font-bold text-slate-700 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-6 md:p-10 max-w-7xl">
                {/* Header Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                            Tuition Tracking
                        </h1>
                        <p className="text-slate-500 font-bold flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Manage and record student payments for this course.
                        </p>
                    </div>
                </div>

                {/* Payment Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Student Name</th>
                                    <th className="px-8 py-5 text-center text-xs font-black uppercase tracking-widest text-slate-400">Total Paid</th>
                                    <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.UserID} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                                                    {student.UserName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{student.UserName}</span>
                                                    <span className="text-xs text-slate-400 font-medium">ID: #{student.UserID}</span>
                                                    {student.PhoneNumber && <span className="text-xs text-emerald-600 font-medium">{student.PhoneNumber}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-4 py-1 rounded-lg">
                                                {getStudentTotalPaid(student.UserID).toLocaleString()} DH
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenHistoryModal(student)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-200"
                                                >
                                                    <History className="w-4 h-4" /> History
                                                </button>
                                                <button
                                                    onClick={() => handleOpenPaymentModal(student)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                                >
                                                    <Plus className="w-4 h-4" /> Record Payment
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

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-lg text-slate-800">Record Payment</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student</label>
                                <div className="font-bold text-slate-900 text-lg">{selectedStudent.UserName}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (DH)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-800"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-slate-700 resize-none h-24"
                                    placeholder="Add payment details..."
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Saving...' : <><Save className="w-5 h-5" /> Save Payment</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <div>
                                <h3 className="font-black text-lg text-slate-800">Payment History</h3>
                                <p className="text-sm text-slate-500 font-bold">{selectedStudent.UserName}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-0 overflow-y-auto">
                            {payments.filter(p => p.StudentID === selectedStudent.UserID).length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">No payments recorded yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Notes</th>
                                            <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {payments
                                            .filter(p => p.StudentID === selectedStudent.UserID)
                                            .map((payment) => (
                                                <tr key={payment.PaymentID} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                                                        {new Date(payment.PaymentDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-emerald-600">
                                                        {payment.Amount.toLocaleString()} DH
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                                                        {payment.Notes || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleShareReceipt(payment)}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Download className="w-3.5 h-3.5" /> Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 text-right">
                            <span className="text-slate-500 font-bold mr-4">Total Paid:</span>
                            <span className="text-2xl font-black text-emerald-600">
                                {getStudentTotalPaid(selectedStudent.UserID).toLocaleString()} DH
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Payment;