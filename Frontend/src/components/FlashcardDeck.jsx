import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const FlashcardDeck = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-gray-400 text-center py-10">No flashcards available.</div>;
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150); // slight delay to allow flip animation to reset
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const card = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div 
        className="w-full aspect-[3/2] cursor-pointer group perspective-1000 mb-8"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-2xl border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-4">Question</h3>
            <p className="text-xl text-white/90 leading-relaxed">{card.front}</p>
            <div className="absolute bottom-6 flex items-center text-white/50 space-x-2 text-sm">
              <RotateCcw className="w-4 h-4" />
              <span>Click to flip</span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gray-800 rotate-y-180 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-2xl border border-gray-600">
            <h3 className="text-3xl font-bold text-blue-400 mb-4">Answer</h3>
            <p className="text-xl text-gray-200 leading-relaxed">{card.back}</p>
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <button 
          onClick={handlePrev}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors border border-gray-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-gray-400 font-medium">
          {currentIndex + 1} / {flashcards.length}
        </div>
        <button 
          onClick={handleNext}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors border border-gray-700"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardDeck;
