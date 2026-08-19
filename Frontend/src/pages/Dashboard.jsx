import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GlobalSearch from '../components/GlobalSearch';
import ChatInterface from '../components/ChatInterface';
import Tasks from './Tasks';
import Notes from './Notes';
import LearningHub from './LearningHub';
import Utilities from './Utilities';
import { getCurrentUser } from '../services/auth';

const DashboardHome = ({ user, navigate }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Hello, {user?.full_name || 'Friend'}
      </h1>
      <p className="text-xl text-gray-400">
        How can I help you today?
      </p>
    </div>
    
    <GlobalSearch onSearch={(q) => navigate('/dashboard/assistant', { state: { query: q } })} />
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl">
      {/* Quick Actions / Suggestions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
        <h3 className="text-lg font-medium text-white mb-2">Learn something new</h3>
        <p className="text-gray-400 text-sm">Ask me to explain quantum computing or a new language.</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
        <h3 className="text-lg font-medium text-white mb-2">Summarize notes</h3>
        <p className="text-gray-400 text-sm">Paste a long article and I'll give you the key points.</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
        <h3 className="text-lg font-medium text-white mb-2">Plan your day</h3>
        <p className="text-gray-400 text-sm">Let's create a task list for your upcoming projects.</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex font-sans selection:bg-blue-500/30">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
            <span className="text-lg font-bold text-white">UKLA</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<DashboardHome user={user} navigate={navigate} />} />
              <Route path="/assistant" element={<ChatInterface />} />
              <Route path="/learning" element={<LearningHub />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/utilities" element={<Utilities />} />
              <Route path="/settings" element={<div className="text-white">Settings Coming Soon...</div>} />
            </Routes>
          </div>
        </div>
        
        {/* Background Decorative Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      </main>
    </div>
  );
};

export default Dashboard;
