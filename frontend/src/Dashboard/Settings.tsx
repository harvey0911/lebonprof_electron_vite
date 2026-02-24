import React, { useMemo, useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, XCircle, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosapi from '../api';

type Status = { type: 'success' | 'error' | ''; message: string };

const Settings: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [clearPassword, setClearPassword] = useState('');

    const [changingPassword, setChangingPassword] = useState(false);
    const [clearingData, setClearingData] = useState(false);

    const [status, setStatus] = useState<Status>({ type: '', message: '' });

    const navigate = useNavigate();

    const passwordsMatch = useMemo(
        () => newPassword.length > 0 && newPassword === confirmPassword,
        [newPassword, confirmPassword]
    );

    const getErrorMessage = (err: unknown, fallback: string) => {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as any;
            return data?.error || data?.message || err.message || fallback;
        }
        return fallback;
    };

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!passwordsMatch) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        setChangingPassword(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await axiosapi.post('/change-password', { oldPassword, newPassword });
            setStatus({ type: 'success', message: res.data?.message ?? 'Password updated successfully.' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setStatus({ type: 'error', message: getErrorMessage(err, 'Failed to change password') });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleClearData = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !window.confirm(
                'CRITICAL: This will delete ALL data (students, courses, payments, etc.). This action cannot be undone. Are you absolutely sure?'
            )
        ) {
            return;
        }

        setClearingData(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await axiosapi.post('/clear-data', { password: clearPassword });
            setStatus({ type: 'success', message: res.data?.message ?? 'Data cleared successfully.' });
            setClearPassword('');
        } catch (err) {
            setStatus({ type: 'error', message: getErrorMessage(err, 'Failed to clear data') });
        } finally {
            setClearingData(false);
        }
    };

    const StatusIcon =
        status.type === 'success' ? CheckCircle2 : status.type === 'error' ? XCircle : null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-xl font-bold">Settings</h1>
                </div>

                {/* Status Message */}
                {status.message && (
                    <div
                        className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${status.type === 'success'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                            : 'bg-red-50 border-red-100 text-red-800'
                            } animate-in fade-in slide-in-from-top-2 duration-300`}
                    >
                        {StatusIcon && <StatusIcon size={20} />}
                        <span className="text-sm font-semibold">{status.message}</span>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <h2 className="font-bold text-lg">Account Security</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Current Password</label>
                                <input
                                    required
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        placeholder="Min 8 chars"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium ${confirmPassword.length === 0
                                            ? 'border-slate-200 focus:border-blue-500'
                                            : passwordsMatch
                                                ? 'border-emerald-500 bg-emerald-50/10'
                                                : 'border-red-500 bg-red-50/10'
                                            }`}
                                        placeholder="Repeat new"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {changingPassword ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-6 border-b border-red-50 bg-red-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                <Trash2 size={20} />
                            </div>
                            <h2 className="font-bold text-lg text-red-900">Database Administration</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
                            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">
                                Clearing data will remove all student and course records permanently. Administrative accounts will be preserved.
                            </p>
                        </div>

                        <form onSubmit={handleClearData} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Admin Verification</label>
                                <input
                                    required
                                    type="password"
                                    value={clearPassword}
                                    onChange={(e) => setClearPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                    placeholder="Enter password to confirm wipe"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={clearingData}
                                className="w-full py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {clearingData ? <Loader2 className="animate-spin" size={20} /> : 'Clear All Database Records'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-slate-400 text-xs py-4">
                    App Version 1.0.0 • Secure Administration Portal
                </div>
            </div>
        </div>
    );
};

export default Settings;