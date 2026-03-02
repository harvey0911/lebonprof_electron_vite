import { useState, useEffect } from 'react';
import { Pencil, Trash2, Calendar, ChevronRight, MoreVertical } from 'lucide-react';
import axiosapi from '../api';

interface SessionProps {
    SessionID: number | undefined;
    courseId: string | undefined;
    Title: string | undefined;
    Description: string | undefined;
}

const SessionCard = ({ courseId, SessionID, Title: initialTitle, Description: initialDescription }: SessionProps) => {
    const [title, setTitle] = useState(initialTitle || '');
    const [description, setDescription] = useState(initialDescription || '');
    const [editableTitle, setEditableTitle] = useState(title);
    const [editableDescription, setEditableDescription] = useState(description);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setTitle(initialTitle || '');
        setDescription(initialDescription || '');
        setEditableTitle(initialTitle || '');
        setEditableDescription(initialDescription || '');
    }, [initialTitle, initialDescription]);

    const handleUpdate = async () => {
        try {
            await axiosapi.put(`/updateSessionTitle/${courseId}`, {
                oldTitle: title,
                newTitle: editableTitle,
            });
            setTitle(editableTitle);
            setDescription(editableDescription);
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating session', error);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await axiosapi.delete(`/deleteSession/${encodeURIComponent(title)}`);
            setShowDeleteModal(false);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting session', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/10 group-hover:bg-blue-500 transition-colors" />

            <div className="flex justify-between items-start mb-4 pl-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Calendar size={10} />
                    Session
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => { setShowEditModal(true); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <Pencil size={16} className="text-blue-500" />
                                Edit Details
                            </button>
                            <button
                                onClick={() => { setShowDeleteModal(true); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={16} className="text-red-500" />
                                Delete Session
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 pl-2">
                <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1">{title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-3">
                    {description || "No description provided for this session."}
                </p>
            </div>

            <div className="mt-6 pl-2 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ID: #{SessionID}
                </div>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-slate-900 transition-colors"
                >
                    View Details
                    <ChevronRight size={16} />
                </button>
            </div>

            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300">
                        <h3 className="text-2xl font-black text-slate-900 mb-8">Edit Session</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editableTitle}
                                    onChange={(e) => setEditableTitle(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                                <textarea
                                    value={editableDescription}
                                    onChange={(e) => setEditableDescription(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 min-h-[120px] resize-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Cancel</button>
                                <button onClick={handleUpdate} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 animate-in zoom-in duration-300 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Session?</h3>
                        <p className="text-slate-500 font-medium mb-8">This will permanently remove "{title}" and all its metadata.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionCard;
