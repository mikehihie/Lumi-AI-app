import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppState } from '../App';
import { t } from '../lib/i18n';
import { generateQuizQuestion } from '../services/gemini';
import { Brain, CheckCircle2, XCircle, Loader2, Award, Coins, Clock, Gift, FastForward, UserCircle, Timer } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

type QuizState = 'idle' | 'loading' | 'active' | 'answered';

type Question = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export function EarnTime({ state, onQuizResult, onRedeem, onAddBp, onBuyItem, onUseSkipPass }: { 
  state: AppState, 
  onQuizResult: (topic: string, isCorrect: boolean) => void, 
  onRedeem: (cost: number, minutes: number, appId?: string) => void,
  onAddBp: (amount: number) => void,
  onBuyItem: (item: 'extend' | 'skip' | 'avatar', cost: number) => void,
  onUseSkipPass: () => void
}) {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [topic, setTopic] = useState('khoa học');
  const [targetAppId, setTargetAppId] = useState<string>('global');
  const [countdown, setCountdown] = useState(0);
  const [claimedExplanation, setClaimedExplanation] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState === 'answered' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [quizState, countdown]);

  const startQuiz = async () => {
    setQuizState('loading');
    setClaimedExplanation(false);
    try {
      const q = await generateQuizQuestion(topic, state.quizHistory);
      setQuestion(q);
      setSelectedOption(null);
      setQuizState('active');
    } catch (error) {
      console.error(error);
      setQuizState('idle');
    }
  };

  const handleAnswer = (index: number) => {
    if (quizState !== 'active') return;
    setSelectedOption(index);
    setQuizState('answered');
    setCountdown(15); // 15 seconds lock for explanation
    
    const isCorrect = index === question?.correctAnswerIndex;
    onQuizResult(topic, isCorrect);
  };

  const handleClaimExplanation = () => {
    if (!claimedExplanation) {
      onAddBp(5);
      setClaimedExplanation(true);
    }
  };

  const handleSkip = () => {
    if (state.inventory.skipPasses > 0 && quizState === 'active') {
      onUseSkipPass();
      startQuiz();
    }
  };

  const handleRedeem = () => {
    if (state.points >= 10) {
      onRedeem(10, 10, targetAppId === 'global' ? undefined : targetAppId);
      alert(t('redeemSuccess', state.language));
    } else {
      alert(t('notEnoughPoints', state.language));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('earnScreenTime', state.language)}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('answerQuestions', state.language)}</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl font-bold border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <Coins className="w-5 h-5" />
          <span>{state.points} {t('bp', state.language)}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
          {quizState === 'idle' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('readyForChallenge', state.language)}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                {t('answerToEarn', state.language)}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <select 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="khoa học">{t('science', state.language)}</option>
                  <option value="lịch sử">{t('history', state.language)}</option>
                  <option value="toán học">{t('math', state.language)}</option>
                  <option value="địa lý">{t('geography', state.language)}</option>
                </select>
                <button 
                  onClick={startQuiz}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  {t('startQuiz', state.language)}
                </button>
              </div>
            </div>
          )}

          {quizState === 'loading' && (
            <div className="text-center py-20 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('generatingQuestion', state.language)}</p>
            </div>
          )}

          {(quizState === 'active' || quizState === 'answered') && question && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-sm font-semibold rounded-full mb-4 uppercase tracking-wider">
                  {topic}
                </span>
                {quizState === 'active' && state.inventory.skipPasses > 0 && (
                  <button 
                    onClick={handleSkip}
                    className="float-right flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <FastForward className="w-4 h-4" />
                    {t('useSkipPass', state.language, state.inventory.skipPasses)}
                  </button>
                )}
                <div className="text-2xl font-bold text-slate-900 dark:text-white leading-tight prose prose-slate max-w-none dark:prose-invert clear-both">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {question.question}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="space-y-3">
                {question.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === question.correctAnswerIndex;
                  const showCorrect = quizState === 'answered' && isCorrect;
                  const showIncorrect = quizState === 'answered' && isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={quizState === 'answered'}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                        quizState === 'active' && "hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800",
                        showCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100",
                        showIncorrect && "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100",
                        quizState === 'answered' && !isSelected && !isCorrect && "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50"
                      )}
                    >
                      <span className="font-medium">{opt}</span>
                      {showCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                      {showIncorrect && <XCircle className="w-6 h-6 text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {quizState === 'answered' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8"
                >
                  <div className={cn(
                    "p-6 rounded-2xl mb-6",
                    selectedOption === question.correctAnswerIndex ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-50 dark:bg-slate-700/50"
                  )}>
                    <div className="flex items-start gap-4">
                      {selectedOption === question.correctAnswerIndex ? (
                        <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Brain className="w-8 h-8 text-slate-400 dark:text-slate-500 shrink-0" />
                      )}
                      <div>
                        <h4 className={cn(
                          "font-bold text-lg mb-1",
                          selectedOption === question.correctAnswerIndex ? "text-emerald-900 dark:text-emerald-400" : "text-slate-900 dark:text-slate-200"
                        )}>
                          {selectedOption === question.correctAnswerIndex ? t('correct', state.language) : t('incorrect', state.language)}
                        </h4>
                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed prose prose-slate max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {question.explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center flex flex-col items-center gap-4">
                    {countdown > 0 ? (
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium rounded-xl">
                        <Clock className="w-5 h-5 animate-pulse" />
                        {t('readExplanation', state.language)} ({countdown}s)
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        {!claimedExplanation && (
                          <button 
                            onClick={handleClaimExplanation}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
                          >
                            <Coins className="w-5 h-5" />
                            {t('readExplanationReward', state.language)}
                          </button>
                        )}
                        <button 
                          onClick={startQuiz}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                        >
                          {t('continueLearning', state.language)}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Store Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('store', state.language)}</h3>
          </div>
          
          <div className="space-y-4">
            {/* Extend Time */}
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Timer className="w-4 h-4 text-indigo-500" />
                    {t('extendTime', state.language)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('extendTimeDesc', state.language)}</p>
                </div>
              </div>
              <button 
                onClick={() => onBuyItem('extend', 50)}
                disabled={state.points < 50}
                className="w-full mt-2 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 disabled:opacity-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Coins className="w-4 h-4" />
                50 {t('bp', state.language)}
              </button>
            </div>

            {/* Skip Pass */}
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FastForward className="w-4 h-4 text-emerald-500" />
                    {t('skipPass', state.language)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('skipPassDesc', state.language)}</p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">{t('owned', state.language)}: {state.inventory.skipPasses}</p>
                </div>
              </div>
              <button 
                onClick={() => onBuyItem('skip', 30)}
                disabled={state.points < 30}
                className="w-full mt-2 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 disabled:opacity-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Coins className="w-4 h-4" />
                30 {t('bp', state.language)}
              </button>
            </div>

            {/* Avatar / Frame */}
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-amber-500" />
                    {t('avatarFrame', state.language)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('avatarFrameDesc', state.language)}</p>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">{t('owned', state.language)}: {state.inventory.avatars.length}</p>
                </div>
              </div>
              <button 
                onClick={() => onBuyItem('avatar', 100)}
                disabled={state.points < 100}
                className="w-full mt-2 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 disabled:opacity-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Coins className="w-4 h-4" />
                100 {t('bp', state.language)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
