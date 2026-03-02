import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LeBonProfLogo from './LeBonProf.png';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CheckSquare,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';

interface SideBarProps {
  isOpen?: boolean;
  onClose?: boolean | (() => void);
}

const SideBar: React.FC<SideBarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentPath = location.pathname;
  const activePath = currentPath === '/' ? '/Dashboard' : currentPath;
  const isRTL = i18n.dir() === 'rtl';

  const menuItems = [
    { key: '/Dashboard', icon: <LayoutDashboard size={22} />, label: t('dashboard') },
    { key: '/Students', icon: <Users size={22} />, label: t('students') },
    { key: '/Professors', icon: <GraduationCap size={22} />, label: t('professors') },
    { key: '/Tasks', icon: <CheckSquare size={22} />, label: t('tasks') },
    { key: '/Settings', icon: <SettingsIcon size={22} />, label: t('settings') },
  ];

  const handleLinkClick = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleLinkClick}
      />

      <aside className={`fixed top-0 z-50 h-screen w-64 bg-[#001529] transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col border-r border-white/5 shadow-2xl ${isRTL ? 'right-0 border-l border-r-0' : 'left-0'
        } ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
        }`}>

        <div className="pt-6 pb-6 flex flex-col items-center">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center p-3 shadow-xl border-4 border-white/10 overflow-hidden">
            <img
              src={LeBonProfLogo}
              alt="Le Bon Prof"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <nav className="flex-1 mt-6">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = activePath.startsWith(item.key);
              return (
                <li key={item.key}>
                  <Link
                    to={item.key}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 px-6 py-4 text-sm font-semibold transition-all duration-200 rounded-xl group
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 rounded-xl group"
          >
            <LogOut size={22} className="group-hover:scale-110 transition-transform" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
