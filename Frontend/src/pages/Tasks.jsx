import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Calendar } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/tasks';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const newTask = await createTask({ title: newTaskTitle });
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const updatedTask = await updateTask(task.id, { is_completed: !task.is_completed });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Tasks</h1>
        <p className="text-gray-400">Manage your daily goals and stay productive.</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col min-h-0">
        
        {/* Add Task Form */}
        <form onSubmit={handleCreateTask} className="mb-8">
          <div className="relative flex items-center">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="absolute right-3 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-transparent disabled:text-gray-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-500 mt-10">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-4">
              <Calendar className="w-12 h-12 opacity-50" />
              <p>You have no pending tasks. Enjoy your day!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                  task.is_completed 
                    ? 'bg-gray-800/30 border-gray-800' 
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <button 
                    onClick={() => handleToggleTask(task)}
                    className={`flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                      task.is_completed 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-500 text-transparent hover:border-blue-500'
                    }`}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <span className={`text-lg transition-all ${
                    task.is_completed ? 'text-gray-500 line-through' : 'text-gray-200'
                  }`}>
                    {task.title}
                  </span>
                </div>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
