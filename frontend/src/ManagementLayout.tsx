import React, { useState, useEffect } from 'react';
import SideBar from './SideBar/SideBar';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ManagementLayoutProps {
    children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    useEffect(() => {
        document.body.dir = i18n.dir();
    }, [i18n.language]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className={`min-h-screen bg-slate-50 flex flex-col lg:flex-row ${isRTL ? 'flex-row-reverse' : ''}`} dir={i18n.dir()}>
            <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="lg:hidden bg-[#001529] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md w-full">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-black tracking-tight">LeBonProf</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className={`flex-1 flex flex-col min-h-screen overflow-x-hidden ${isRTL ? 'lg:mr-64 lg:ml-0' : 'lg:ml-64 lg:mr-0'}`}>
                {children}
            </div>
        </div>
    );
};

export default ManagementLayout;
