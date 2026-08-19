import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, BookOpen, CheckSquare, Settings, LogOut, Menu, X, FileText, Calculator } from 'lucide-react';
import { removeToken } from '../services/auth';

const SidebarItem = ({ icon: Icon, label, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600/20 text-blue-400 font-medium' 
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </NavLink>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">UKLA</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarItem icon={Home} label="Home" to="/dashboard" onClick={() => setIsOpen(false)} />
          <SidebarItem icon={MessageSquare} label="Knowledge Assistant" to="/dashboard/assistant" onClick={() => setIsOpen(false)} />
          <SidebarItem icon={BookOpen} label="Learning Hub" to="/dashboard/learning" onClick={() => setIsOpen(false)} />
          <SidebarItem icon={CheckSquare} label="Tasks" to="/dashboard/tasks" onClick={() => setIsOpen(false)} />
          <SidebarItem icon={FileText} label="Notes" to="/dashboard/notes" onClick={() => setIsOpen(false)} />
          <SidebarItem icon={Calculator} label="Utilities" to="/dashboard/utilities" onClick={() => setIsOpen(false)} />
          <SidebarItem icon={Settings} label="Settings" to="/dashboard/settings" onClick={() => setIsOpen(false)} />
        </div>

        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
