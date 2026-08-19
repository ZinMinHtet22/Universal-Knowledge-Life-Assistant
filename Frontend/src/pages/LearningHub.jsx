import React, { useState, useEffect } from 'react';
import { BookOpen, BrainCircuit, Sparkles, Layers, ListChecks, PlayCircle, Loader2 } from 'lucide-react';
import { getTopics, createTopic, getFlashcards, getQuizzes } from '../services/learning';
import FlashcardDeck from '../components/FlashcardDeck';
import QuizMode from '../components/QuizMode';

const LearningHub = () => {
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  
  // Generation state
  const [newTopicName, setNewTopicName] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState('overview'); // overview, flashcards, quiz
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (error) {
      console.error("Failed to fetch topics", error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    setIsGenerating(true);
    try {
      const topic = await createTopic(newTopicName, difficulty);
      setTopics([topic, ...topics]);
      setNewTopicName('');
      handleSelectTopic(topic);
    } catch (error) {
      console.error("Failed to generate topic", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTopic = (topic) => {
    setActiveTopic(topic);
    setViewMode('overview');
  };

  const loadFlashcards = async () => {
    setIsLoadingContent(true);
    try {
      const data = await getFlashcards(activeTopic.id);
      setFlashcards(data);
      setViewMode('flashcards');
    } catch (error) {
      console.error("Failed to load flashcards", error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const loadQuizzes = async () => {
    setIsLoadingContent(true);
    try {
      const data = await getQuizzes(activeTopic.id);
      setQuizzes(data);
      setViewMode('quiz');
    } catch (error) {
      console.error("Failed to load quizzes", error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center space-x-3">
          <BrainCircuit className="w-8 h-8 text-blue-500" />
          <span>Learning Hub</span>
        </h1>
        <p className="text-gray-400">Master any subject with AI-generated flashcards and quizzes.</p>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="mb-8 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-400 mb-2">What do you want to learn?</label>
          <input 
            type="text"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="e.g., Quantum Physics, French Revolution, Python Basics"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <button 
          type="submit"
          disabled={isGenerating || !newTopicName.trim()}
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-xl transition-colors font-medium h-[50px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Curriculum</span>
            </>
          )}
        </button>
      </form>

      <div className="flex-1 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 min-h-0">
        
        {/* Topics List */}
        <div className="md:w-1/3 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-y-auto flex flex-col p-4 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4 px-2">Your Topics</h2>
          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 space-y-4">
              <BookOpen className="w-12 h-12 opacity-50" />
              <p className="text-center px-4">Generate your first topic above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map(topic => (
                <div 
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`group p-4 rounded-xl cursor-pointer border transition-all ${
                    activeTopic?.id === topic.id 
                      ? 'bg-gray-800 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                  }`}
                >
                  <h3 className="text-gray-200 font-medium mb-1">{topic.topic_name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="bg-gray-700 px-2 py-0.5 rounded-full">{topic.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col p-6 shadow-2xl overflow-y-auto">
          {!activeTopic ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 space-y-4">
              <BrainCircuit className="w-16 h-16 opacity-30" />
              <p className="text-lg">Select a topic to start learning</p>
            </div>
          ) : isLoadingContent ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 space-y-4">
              <Loader2 className="w-12 h-12 opacity-50 animate-spin" />
              <p>Loading study materials...</p>
            </div>
          ) : viewMode === 'overview' ? (
            <div className="flex flex-col items-center justify-center flex-1 space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{activeTopic.topic_name}</h2>
                <p className="text-gray-400">Select a study method to begin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <button 
                  onClick={loadFlashcards}
                  className="flex flex-col items-center p-8 bg-gray-800/80 hover:bg-blue-900/20 border border-gray-700 hover:border-blue-500/50 rounded-3xl transition-all group"
                >
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Flashcards</h3>
                  <p className="text-gray-400 text-sm text-center">Memorize key concepts with interactive cards</p>
                </button>

                <button 
                  onClick={loadQuizzes}
                  className="flex flex-col items-center p-8 bg-gray-800/80 hover:bg-purple-900/20 border border-gray-700 hover:border-purple-500/50 rounded-3xl transition-all group"
                >
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ListChecks className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Practice Quiz</h3>
                  <p className="text-gray-400 text-sm text-center">Test your knowledge with multiple choice questions</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex items-center mb-8 border-b border-gray-700 pb-4">
                <button 
                  onClick={() => setViewMode('overview')}
                  className="text-gray-400 hover:text-white flex items-center space-x-2 transition-colors mr-auto"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Back to Overview</span>
                </button>
                <h2 className="text-xl font-bold text-white">{activeTopic.topic_name}</h2>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {viewMode === 'flashcards' && <FlashcardDeck flashcards={flashcards} />}
                {viewMode === 'quiz' && <QuizMode quizzes={quizzes} />}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LearningHub;
