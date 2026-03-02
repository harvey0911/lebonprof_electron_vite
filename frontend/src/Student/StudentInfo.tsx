import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosapi from "../api";
import {
    User,
    Phone,
    BookOpen,
    Calendar,
    DollarSign,
    ArrowLeft,
    GraduationCap
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

interface StudentProfile {
    student: {
        UserID: number;
        UserName: string;
        PhoneNumber: string;
        UserType: string;
    };
    courses: {
        CourseID: number;
        CourseName: string;
        TotalSessions: number;
        PresentSessions: number;
        TotalPaid: number;
    }[];
    stats: {
        totalCourses: number;
        totalPaid: number;
    };
}

function StudentInfo() {
    const { t } = useTranslation();
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<StudentProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axiosapi.get(`/student-profile/${studentId}`);
                setProfile(data);
            } catch (error) {
                console.error('Error fetching student profile', error);
            }
        };
        fetchProfile();
    }, [studentId]);

    const handleGeneratePaymentReport = async () => {
        if (!profile) return;
        try {
            console.log('Fetching payments for student:', studentId);
            const { data: payments } = await axiosapi.get(`/student-payments/${studentId}`);
            console.log('Payments data received:', payments);

            if (!payments || payments.length === 0) {
                alert(t('no_payment_data'));
                return;
            }

            const doc = new jsPDF();

            // Header Section
            doc.setFontSize(24);
            doc.setTextColor(37, 99, 235); // Blue
            doc.setFont('helvetica', 'bold');
            doc.text(t('payment_report_title'), 15, 25);

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.setFont('helvetica', 'normal');
            doc.text(`${t('generated_at')} ${new Date().toLocaleDateString()}`, 15, 32);
            doc.text(`${t('student_label')} ${profile.student.UserName}`, 15, 37);
            doc.text(`${t('student_id')}: #${profile.student.UserID}`, 15, 42);

            const tableData = payments.map((p: any) => [
                p.CourseName,
                new Date(p.PaymentDate).toLocaleDateString(),
                `${(p.Amount || 0).toLocaleString()} DH`
            ]);

            autoTable(doc, {
                startY: 50,
                head: [[t('course_col'), t('date_col'), t('amount_col')]],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 5 },
                alternateRowStyles: { fillColor: [249, 250, 251] }
            });

            const fileName = `Paiements_${profile.student.UserName}.pdf`;
            doc.save(fileName);
        } catch (error: any) {
            console.error('Error generating payment report', error);
        }
    };

    const handleGenerateAttendanceReport = async () => {
        if (!profile) return;
        try {
            console.log('Fetching attendance for student:', studentId);
            const { data: attendance } = await axiosapi.get(`/student-attendance/${studentId}`);
            console.log('Attendance data received:', attendance);

            if (!attendance || attendance.length === 0) {
                alert(t('no_attendance_data'));
                return;
            }

            const doc = new jsPDF();

            // Header Section
            doc.setFontSize(24);
            doc.setTextColor(37, 99, 235); // Blue
            doc.setFont('helvetica', 'bold');
            doc.text(t('attendance_report_title'), 15, 25);

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.setFont('helvetica', 'normal');
            doc.text(`${t('generated_at')} ${new Date().toLocaleDateString()}`, 15, 32);
            doc.text(`${t('student_label')} ${profile.student.UserName}`, 15, 37);
            doc.text(`${t('student_id')}: #${profile.student.UserID}`, 15, 42);

            const tableData = attendance.map((a: any) => [
                a.CourseName,
                new Date(a.Date).toLocaleDateString(),
                t('present')
            ]);

            autoTable(doc, {
                startY: 50,
                head: [[t('course_col'), t('date_col'), t('status_col')]],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 5 },
                alternateRowStyles: { fillColor: [249, 250, 251] }
            });

            const fileName = `Presence_${profile.student.UserName}.pdf`;
            doc.save(fileName);
        } catch (error: any) {
            console.error('Error generating attendance report', error);
            alert(t('payment_failed')); // Reuse or add specific err
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans print:bg-white">
            {/* Navigation - Hidden on Print */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm print:hidden">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div onClick={() => navigate('/Students')} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-slate-700 group-hover:text-slate-900">{t('back_to_students')}</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleGeneratePaymentReport}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                <DollarSign className="w-4 h-4" /> {t('payment_report')}
                            </button>
                            <button
                                onClick={handleGenerateAttendanceReport}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all active:scale-95"
                            >
                                <Calendar className="w-4 h-4" /> {t('attendance_report')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="w-full p-6 md:p-10">
                {/* Profile Header */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-sm border border-slate-100 relative overflow-hidden print:shadow-none print:border-none print:p-0 print:mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 print:hidden"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-4xl border-4 border-white shadow-lg print:border-slate-200">
                            {profile.student.UserName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{profile.student.UserName}</h1>
                            <div className="flex flex-wrap gap-4 text-slate-500 font-bold">
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                    <User className="w-4 h-4 text-blue-500" /> {t('id')}: #{profile.student.UserID}
                                </span>
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                    <Phone className="w-4 h-4 text-emerald-500" /> {profile.student.PhoneNumber}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-4 print:hidden">
                            <div className="text-right">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{t('total_paid')}</p>
                                <p className="text-3xl font-black text-emerald-600">{profile.stats.totalPaid.toLocaleString()} DH</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 print:block">
                    {/* Courses List */}
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-blue-600" /> {t('enrolled_courses')}
                        </h2>

                        <div className="space-y-4 print:space-y-6">
                            {profile.courses.map(course => (
                                <div key={course.CourseID} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm print:shadow-none print:border print:border-slate-300 print:rounded-xl print:break-inside-avoid">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-900 mb-1">{course.CourseName}</h3>
                                            <p className="text-slate-400 text-sm font-medium">{t('course_id_label')}: {course.CourseID}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-8">
                                            {/* Attendance Stats */}
                                            <div className="min-w-[140px]">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" /> {t('attendance')}
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black text-slate-800">
                                                        {course.TotalSessions > 0
                                                            ? Math.round((course.PresentSessions / course.TotalSessions) * 100)
                                                            : 0}%
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400">
                                                        ({course.PresentSessions}/{course.TotalSessions} sessions)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${course.TotalSessions > 0 ? (course.PresentSessions / course.TotalSessions) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Payment Stats */}
                                            <div className="min-w-[140px]">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                                                    <DollarSign className="w-3.5 h-3.5" /> {t('payment')}
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black text-emerald-600">
                                                        {(course.TotalPaid || 0).toLocaleString()} DH
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400">{t('total_paid')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {profile.courses.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">{t('not_enrolled')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
                    <p>{t('generated_on')} {new Date().toLocaleDateString()}</p>
                </div>
            </main>
        </div>
    );
}

export default StudentInfo;
