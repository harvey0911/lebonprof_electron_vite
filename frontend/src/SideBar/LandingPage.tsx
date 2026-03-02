import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import LeBonProfLogo from './LeBonProf.png';
import axiosapi from '../api';
import { useTranslation } from 'react-i18next';

function LandingPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosapi.post('/login', { password });
      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('invalid_password_err'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex w-full h-screen bg-white overflow-hidden">

      <div className="relative hidden lg:flex lg:w-[40%] flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400">


        <div className="relative z-10 text-center">
          <h1 className="text-white text-3xl tracking-[0.1em] font-serif italic font-light opacity-95">
            Le Bon Prof
          </h1>
          <div className="h-px w-12 bg-white/30 mx-auto mt-2"></div>
        </div>


        <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
          <div className="w-80 h-80 bg-white rounded-full flex items-center justify-center shadow-2xl p-10 animate-in zoom-in duration-500">
            <img
              src={LeBonProfLogo}
              alt="Logo"
              className="w-full h-auto object-contain scale-110"
            />
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-[10px] uppercase tracking-[0.3em] text-center font-bold">
          {t('excellence_education')}
        </div>
      </div>


      <div className="w-full lg:w-[60%] flex flex-col items-center justify-center p-8 bg-white relative">

        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        )}

        <div className="w-full max-w-sm space-y-8">
          <div className="text-left border-l-4 border-blue-600 pl-6">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t('login')}</h2>
            <p className="text-slate-400 text-sm mt-1 font-medium italic">{t('welcome_back')}</p>
          </div>

          <form noValidate onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="relative group">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-4 text-slate-200 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <label className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                <input type="checkbox" className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                {t('stay_logged_in')}
              </label>
              <button type="button" className="hover:text-blue-600 transition-colors">{t('forgot_password')}</button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl text-white bg-blue-600 font-extrabold text-sm uppercase tracking-widest hover:bg-slate-900 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98]"
              >
                {t('enter_portal')}
              </button>

              <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                  {t('no_account')} <span className="text-blue-600 cursor-pointer hover:underline">{t('request_access')}</span>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
