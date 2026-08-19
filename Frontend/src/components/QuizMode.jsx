import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QuizMode = ({ quizzes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!quizzes || quizzes.length === 0) {
    return <div className="text-gray-400 text-center py-10">No quizzes available.</div>;
  }

  const currentQuiz = quizzes[currentIndex];

  const handleOptionSelect = (index) => {
    if (isAnswered) return; // Prevent changing answer after submitting
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuiz.correct_index) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-900/50 rounded-3xl border border-white/10 max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">Quiz Completed!</h2>
        <div className="text-6xl font-bold text-blue-500">
          {score} / {quizzes.length}
        </div>
        <p className="text-gray-400 text-lg">
          {score === quizzes.length 
            ? "Perfect score! Outstanding job." 
            : "Great effort! Review the flashcards to improve."}
        </p>
        <button 
          onClick={handleRestart}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-colors mt-4 font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Restart Quiz</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-6">
      
      {/* Progress */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-400">
        <span>Question {currentIndex + 1} of {quizzes.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col space-y-6">
        <h3 className="text-2xl font-bold text-white leading-tight">
          {currentQuiz.question}
        </h3>

        <div className="space-y-3">
          {currentQuiz.options.map((option, idx) => {
            let stateClass = "bg-gray-700/50 border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-200 cursor-pointer";
            
            if (isAnswered) {
              if (idx === currentQuiz.correct_index) {
                stateClass = "bg-green-500/20 border-green-500 text-green-400"; // Correct answer is always green
              } else if (idx === selectedOption) {
                stateClass = "bg-red-500/20 border-red-500 text-red-400"; // Wrong selected answer is red
              } else {
                stateClass = "bg-gray-700/20 border-gray-700 text-gray-500 cursor-default opacity-50"; // Others fade out
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${stateClass}`}
              >
                <span className="text-lg">{option}</span>
                {isAnswered && idx === currentQuiz.correct_index && <CheckCircle2 className="w-5 h-5" />}
                {isAnswered && idx === selectedOption && idx !== currentQuiz.correct_index && <XCircle className="w-5 h-5" />}
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
        {isAnswered && (
          <div className="pt-6 border-t border-gray-700 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`text-lg font-bold mb-2 flex items-center space-x-2 ${selectedOption === currentQuiz.correct_index ? 'text-green-400' : 'text-red-400'}`}>
              {selectedOption === currentQuiz.correct_index ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Incorrect</span>
                </>
              )}
            </div>
            <p className="text-gray-300 bg-gray-900/50 p-4 rounded-xl leading-relaxed text-sm mb-6">
              {currentQuiz.explanation}
            </p>

            <button 
              onClick={handleNext}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-colors font-medium"
            >
              <span>{currentIndex === quizzes.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizMode;
