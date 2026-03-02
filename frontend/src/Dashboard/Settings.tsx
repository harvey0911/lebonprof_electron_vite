import React, { useMemo, useState, useEffect } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    Shield,
    Settings as SettingsIcon,
    Database,
    Globe
} from 'lucide-react';
import axios from 'axios';
import axiosapi from '../api';
import { useTranslation } from 'react-i18next';

type Status = { type: 'success' | 'error' | ''; message: string };

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [clearPassword, setClearPassword] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'English');

    const [changingPassword, setChangingPassword] = useState(false);
    const [clearingData, setClearingData] = useState(false);

    const [status, setStatus] = useState<Status>({ type: '', message: '' });

    useEffect(() => {
        setSelectedLanguage(i18n.language);
    }, [i18n.language]);

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

    const handleChangePassword = async (e: React.FormEvent) => {
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

    const handleClearData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.confirm('CRITICAL: This will delete ALL data (students, courses, payments, etc.). This action cannot be undone. Are you absolutely sure?')) {
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

    const languages = [
        { name: 'English', code: 'English', flag: '🇺🇸' },
        { name: 'French', code: 'French', flag: '🇫🇷' },
        { name: 'Arabic', code: 'Arabic', flag: '🇸🇦' }
    ];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

    return (
        <main className="p-10 min-w-0">
            {/* Header Section */}
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('dashboard')}</h1>
                <div className="flex items-center gap-2 mt-4 text-slate-600">
                    <SettingsIcon className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">{t('system_settings')}</h2>
                </div>
            </div>

            {/* Status Notification */}
            {status.message && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span className="font-bold">{status.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">

                {/* Security Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">{t('security_auth')}</h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-6">
                        {t('security_desc')}
                    </p>

                    <form onSubmit={handleChangePassword} className="space-y-4 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">{t('current_password')}</label>
                            <input
                                required
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-800 text-sm"
                                placeholder={t('current_password')}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">{t('new_password')}</label>
                            <input
                                required
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-800 text-sm"
                                placeholder={t('new_password')}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">{t('confirm_new_password')}</label>
                            <input
                                required
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full p-3 bg-slate-50 border-2 outline-none transition-all font-bold text-slate-800 rounded-xl text-sm ${confirmPassword ? (passwordsMatch ? 'border-emerald-500 focus:bg-white' : 'border-red-500 focus:bg-white') : 'border-transparent focus:border-indigo-500 focus:bg-white'
                                    }`}
                                placeholder={t('confirm_new_password')}
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {changingPassword ? <Loader2 className="animate-spin w-4 h-4" /> : t('change_password')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Maintenance Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-red-50 flex flex-col h-full border-l-8 border-l-red-500">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-bold text-slate-900">{t('database_maintenance')}</h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-6">
                        {t('maintenance_desc')} <span className="text-red-600 font-bold">{t('warning_irreversible')}</span>
                    </p>

                    <form onSubmit={handleClearData} className="space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">{t('admin_password_required')}</label>
                            <input
                                required
                                type="password"
                                value={clearPassword}
                                onChange={(e) => setClearPassword(e.target.value)}
                                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-800 text-sm"
                                placeholder={t('confirm_password')}
                            />
                        </div>

                        <div className="pt-4">
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 mb-4">
                                <AlertTriangle size={20} className="shrink-0" />
                                <p className="text-[10px] font-bold leading-relaxed">
                                    {t('reset_warning')}
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={clearingData}
                                className="w-full py-3 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-100 hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {clearingData ? <Loader2 className="animate-spin w-4 h-4" /> : t('reset_data')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Language Selection Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-bold text-slate-900">{t('language_localization')}</h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-6">
                        {t('language_desc')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${selectedLanguage === lang.code
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-50'
                                    : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white shadow-sm'
                                    }`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <div className="text-left">
                                    <p className="font-black text-sm">{lang.name}</p>
                                    <p className="text-[9px] uppercase tracking-widest font-bold opacity-60">{lang.code}</p>
                                </div>
                                {selectedLanguage === lang.code && (
                                    <div className="ml-auto bg-indigo-600 text-white p-1 rounded-full">
                                        <CheckCircle2 size={12} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4">
                <span>Le Bon Prof v1.2</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>Secure Administration Portal</span>
            </div>
        </main>
    );
};

export default Settings;
