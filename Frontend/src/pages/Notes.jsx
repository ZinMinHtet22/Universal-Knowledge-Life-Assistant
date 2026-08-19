import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Sparkles, X } from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote, summarizeNote } from '../services/notes';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveNote({ isNew: true });
    setTitle('');
    setContent('');
  };

  const handleSelectNote = (note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    try {
      if (activeNote.isNew) {
        const newNote = await createNote({ title, content });
        setNotes([newNote, ...notes]);
        setActiveNote(newNote);
      } else {
        const updatedNote = await updateNote(activeNote.id, { title, content });
        setNotes(notes.map(n => n.id === activeNote.id ? updatedNote : n));
        setActiveNote(updatedNote);
      }
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      if (activeNote?.id === id) {
        setActiveNote(null);
      }
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  const handleSummarize = async () => {
    if (!activeNote || activeNote.isNew) return;
    setIsSummarizing(true);
    try {
      const updatedNote = await summarizeNote(activeNote.id);
      setNotes(notes.map(n => n.id === activeNote.id ? updatedNote : n));
      setActiveNote(updatedNote);
    } catch (error) {
      console.error("Failed to summarize note", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Notes</h1>
          <p className="text-gray-400">Capture your ideas and summarize them with AI.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </button>
      </div>

      <div className="flex-1 flex space-x-6 min-h-0">
        
        {/* Sidebar List */}
        <div className="w-1/3 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-y-auto flex flex-col p-4 shadow-2xl">
          {isLoading ? (
            <div className="text-center text-gray-500 mt-10">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-4">
              <FileText className="w-12 h-12 opacity-50" />
              <p className="text-center px-4">No notes yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`group p-4 rounded-xl cursor-pointer border transition-all ${
                    activeNote?.id === note.id 
                      ? 'bg-gray-800 border-blue-500/50' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-gray-200 font-medium truncate pr-4">{note.title}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col p-6 shadow-2xl">
          {activeNote ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title"
                  className="bg-transparent text-2xl font-semibold text-white focus:outline-none w-full"
                />
                <div className="flex space-x-3 ml-4">
                  {!activeNote.isNew && (
                    <button 
                      onClick={handleSummarize}
                      disabled={isSummarizing}
                      className="flex items-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-lg border border-purple-500/30 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isSummarizing ? 'Summarizing...' : 'Summarize AI'}</span>
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setActiveNote(null)}
                    className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your note here..."
                className="flex-1 w-full bg-transparent text-gray-300 focus:outline-none resize-none text-lg leading-relaxed pt-2"
              />

              {/* AI Summary Banner */}
              {!activeNote.isNew && activeNote.ai_summary && (
                <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl max-h-48 overflow-y-auto">
                  <div className="flex items-center space-x-2 text-purple-400 mb-2 font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Summary</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {activeNote.ai_summary}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
              <FileText className="w-16 h-16 opacity-30" />
              <p className="text-lg">Select a note or create a new one</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notes;
