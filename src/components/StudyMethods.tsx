import { useState } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { AppState } from '../App';
import { t } from '../lib/i18n';
import { suggestStudyMethod } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

const METHODS = [
  { name: 'Pomodoro', desc: 'Học 25 phút, nghỉ 5 phút. Giúp duy trì sự tập trung cao độ.' },
  { name: 'Feynman', desc: 'Học bằng cách giải thích lại kiến thức cho người khác một cách đơn giản nhất.' },
  { name: 'Spaced Repetition', desc: 'Ôn tập ngắt quãng theo thời gian để đưa kiến thức vào trí nhớ dài hạn.' },
];

export function StudyMethods({ state }: { state: AppState }) {
  const [problem, setProblem] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggest = async () => {
    if (!problem.trim()) return;
    setIsLoading(true);
    try {
      const res = await suggestStudyMethod(problem);
      setSuggestion(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('effectiveMethods', state.language)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('discoverMethods', state.language)}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('aiMethodConsulting', state.language)}</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{t('studyProblem', state.language)}</p>
          <textarea 
            value={problem}
            onChange={e => setProblem(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            placeholder={t('typeProblem', state.language)}
          />
          <button 
            onClick={handleSuggest}
            disabled={isLoading || !problem.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
            {t('getAdvice', state.language)}
          </button>

          {suggestion && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl">
              <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-2">{t('aiSuggestion', state.language)}</h4>
              <p className="text-amber-800 dark:text-amber-200 whitespace-pre-wrap text-sm leading-relaxed">
                <ReactMarkdown>{suggestion}</ReactMarkdown>
              </p>
            </motion.div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('methodLibrary', state.language)}</h3>
          </div>
          <div className="space-y-4">
            {METHODS.map((m, i) => (
              <div key={i} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{m.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
