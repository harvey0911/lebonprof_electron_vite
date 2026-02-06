import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosapi from '../api';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileText,
  CreditCard,
  Search,
  GraduationCap,
  Plus,
  X,
  FolderOpen,
  Presentation
} from 'lucide-react';
import CanvasCard from './CanvasCard';

interface Session {
  SessionID: number;
  courseId: string;
  Title: string;
}

function Files() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { courseId } = useParams();
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState('Course Materials');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (courseId) {
          // Fetch course details
          const courseRes = await axiosapi.get(`/fetchCourse/${courseId}`);
          setCourseName(courseRes.data.CourseName);

          // Fetch sessions
          const sessionsResponse = await axiosapi.get(`/fetchSessions/${courseId}`);
          setSessions(sessionsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching sessions', error);
      }
    };

    fetchSessions();
  }, [courseId]);

  const navItems = [
    { label: 'Course Info', icon: BookOpen, path: `/course/${courseId}` },
    { label: 'Attendance', icon: ClipboardCheck, path: `/attendance/${courseId}` },
    { label: 'Files', icon: FileText, path: `/files/${courseId}` },
    { label: 'Payment', icon: CreditCard, path: `/payment/${courseId}` },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleAddSession = async () => {
    if (!newSessionTitle.trim()) return;
    try {
      await axiosapi.post('/AddSession', {
        courseId,
        title: newSessionTitle,
        whiteboardContent: '',
      });

      // Refresh sessions
      const response = await axiosapi.get(`/fetchSessions/${courseId}`);
      setSessions(response.data);
      setShowModal(false);
      setNewSessionTitle('');
    } catch (error) {
      console.error('Error adding whiteboard session', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo / Brand */}
            <div onClick={() => navigate('/Dashboard')} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">LeBonProf</span>
            </div>

            {/* Navigation Links */}
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

            {/* Search Bar */}
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none text-sm font-bold text-slate-700 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 md:p-10 max-w-7xl">
        {/* Header Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                {courseName}
              </h1>
              <p className="text-slate-500 font-medium">Session Notes & Interactive Canvas</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-200 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> New Whiteboard
            </button>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sessions.map((session) => (
            <CanvasCard
              key={session.SessionID}
              courseId={courseId || ''}
              SessionID={session.SessionID}
              Title={session.Title}
            />
          ))}

          {sessions.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No sessions found</h3>
              <p className="text-slate-400 font-medium mb-8">Create your first whiteboard to get started.</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                Create new whiteboard
              </button>
            </div>
          )}
        </div>
      </main>

      {/* New Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">New Session</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="text-slate-400 w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Session Title</label>
                <input
                  type="text"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: Introduction"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSession}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all active:scale-95"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;