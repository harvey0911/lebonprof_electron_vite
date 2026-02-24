import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faListCheck,
  faBook,
  faGraduationCap,
  faRightFromBracket,
  faGear
} from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import LeBonProfLogo from './LeBonProf.png';

const SideBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  // Ensure the default selected key matches your routing logic
  const activePath = currentPath === '/' ? '/Dashboard' : currentPath;

  const menuItems = [
    { key: '/Dashboard', label: 'Dashboard', icon: faBook },
    { key: '/Students', label: 'Students', icon: faUser },
    { key: '/Professors', label: 'Professors', icon: faGraduationCap },
    { key: '/Tasks', label: 'Tasks', icon: faListCheck },
    { key: '/Settings', label: 'Settings', icon: faGear },
    { key: '/Logout', label: 'Logout', icon: faRightFromBracket, path: '/' },
  ];

  return (
    <aside className="w-64 bg-[#001529] h-screen fixed left-0 top-0 z-50 overflow-y-auto flex flex-col">
      <div className="p-8 flex justify-center">
        <img
          src={LeBonProfLogo}
          alt="Logo"
          className="bg-white p-4 w-32 h-32 rounded-full object-contain"
        />
      </div>

      <div className="h-10" />

      <nav className="flex-1">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = activePath === item.key;
            return (
              <li key={item.key}>
                <Link
                  to={item.path || item.key}
                  className={`flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors duration-200 rounded-lg
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="h-[290px]" />
    </aside>
  );
};

export default SideBar;