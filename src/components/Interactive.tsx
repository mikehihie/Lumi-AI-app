import { useState } from 'react';
import { motion } from 'motion/react';
import { AppState } from '../App';
import { t } from '../lib/i18n';
import { Zap, Star } from 'lucide-react';

export function Interactive({ state }: { state: AppState }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('interactiveGames', state.language)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('learnThroughGames', state.language)}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer">
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

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer">
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
