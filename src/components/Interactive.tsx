import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppState } from '../App';
import { t } from '../lib/i18n';
import { Zap, Star, Loader2, ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { generateSpeedQuiz, generateWordMatch } from '../services/gemini';
import { cn } from '../lib/utils';

export function Interactive({ state }: { state: AppState }) {
  const [activeGame, setActiveGame] = useState<'none' | 'speed' | 'match'>('none');

  if (activeGame === 'speed') {
    return <SpeedQuizGame state={state} onBack={() => setActiveGame('none')} />;
  }

  if (activeGame === 'match') {
    return <WordMatchGame state={state} onBack={() => setActiveGame('none')} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('interactiveGames', state.language)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('learnThroughGames', state.language)}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setActiveGame('speed')}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <Zap className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('speedQuiz', state.language)}</h3>
            <p className="text-indigo-100 mb-6 max-w-[80%]">{t('speedQuizDesc', state.language)}</p>
            <button className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-colors">
              {t('playNow', state.language)}
            </button>
          </div>
        </div>

        <div 
          onClick={() => setActiveGame('match')}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <Star className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('wordMatch', state.language)}</h3>
            <p className="text-emerald-100 mb-6 max-w-[80%]">{t('wordMatchDesc', state.language)}</p>
            <button className="px-6 py-2 bg-white text-emerald-600 font-bold rounded-full hover:bg-emerald-50 transition-colors">
              {t('playNow', state.language)}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SpeedQuizGame({ state, onBack }: { state: AppState, onBack: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'ended'>('loading');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  useEffect(() => {
    generateSpeedQuiz("Toán học").then(q => {
      setQuestions(q);
      setGameState('playing');
    });
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && selectedOpt === null) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleAnswer(-1); // timeout
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, selectedOpt, currentIndex]);

  const handleAnswer = (idx: number) => {
    setSelectedOpt(idx);
    if (idx === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedOpt(null);
        setTimeLeft(10);
      } else {
        setGameState('ended');
      }
    }, 1500);
  };

  if (gameState === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Đang tạo câu hỏi...</p>
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <Zap className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Hoàn thành!</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">Điểm của bạn: <span className="font-bold text-indigo-600">{score}/{questions.length}</span></p>
        </div>
        <button onClick={onBack} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
          Quay lại
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
        <ArrowLeft className="w-5 h-5" /> Quay lại
      </button>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Câu hỏi {currentIndex + 1}/{questions.length}</span>
          <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/30 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5" /> {timeLeft}s
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">{q.question}</h3>
        
        <div className="space-y-3">
          {q.options.map((opt: string, idx: number) => {
            const isSelected = selectedOpt === idx;
            const isCorrect = idx === q.correctAnswerIndex;
            const showCorrect = selectedOpt !== null && isCorrect;
            const showIncorrect = selectedOpt !== null && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => selectedOpt === null && handleAnswer(idx)}
                disabled={selectedOpt !== null}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                  selectedOpt === null && "hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800",
                  showCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100",
                  showIncorrect && "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100",
                  selectedOpt !== null && !isSelected && !isCorrect && "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50"
                )}
              >
                <span className="font-medium text-lg">{opt}</span>
                {showCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                {showIncorrect && <XCircle className="w-6 h-6 text-rose-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function WordMatchGame({ state, onBack }: { state: AppState, onBack: () => void }) {
  const [pairs, setPairs] = useState<any[]>([]);
  const [cards, setCards] = useState<{id: string, text: string, type: 'left'|'right', pairId: number, isMatched: boolean}[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'ended'>('loading');

  useEffect(() => {
    generateWordMatch("Tiếng Anh").then(p => {
      setPairs(p);
      const newCards: any[] = [];
      p.forEach((pair: any, idx: number) => {
        newCards.push({ id: `l_${idx}`, text: pair.left, type: 'left', pairId: idx, isMatched: false });
        newCards.push({ id: `r_${idx}`, text: pair.right, type: 'right', pairId: idx, isMatched: false });
      });
      // Shuffle
      newCards.sort(() => Math.random() - 0.5);
      setCards(newCards);
      setGameState('playing');
    });
  }, []);

  const handleCardClick = (id: string) => {
    if (selectedCards.length === 2 || selectedCards.includes(id)) return;
    
    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const card1 = cards.find(c => c.id === newSelected[0]);
      const card2 = cards.find(c => c.id === newSelected[1]);

      if (card1 && card2 && card1.pairId === card2.pairId && card1.type !== card2.type) {
        // Match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === card1.id || c.id === card2.id) ? { ...c, isMatched: true } : c
          ));
          setSelectedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      setTimeout(() => setGameState('ended'), 500);
    }
  }, [cards]);

  if (gameState === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Đang tạo trò chơi...</p>
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <Star className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Xuất sắc!</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">Bạn đã nối đúng tất cả các cặp từ.</p>
        </div>
        <button onClick={onBack} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
        <ArrowLeft className="w-5 h-5" /> Quay lại
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {cards.map(card => {
          const isSelected = selectedCards.includes(card.id);
          const isMatched = card.isMatched;
          
          return (
            <button
              key={card.id}
              onClick={() => !isMatched && handleCardClick(card.id)}
              disabled={isMatched}
              className={cn(
                "aspect-square p-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center text-center shadow-sm border-2",
                isMatched ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 opacity-50 scale-95" :
                isSelected ? "bg-indigo-600 border-indigo-600 text-white scale-105 shadow-md" :
                "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:shadow-md"
              )}
            >
              {card.text}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
