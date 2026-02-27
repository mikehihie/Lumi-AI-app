import { motion } from 'motion/react';
import { User, Settings, Moon, Sun, Globe, LogOut, Award, Flame, Shield, Star, Zap, Clock } from 'lucide-react';
import { AppState } from '../App';
import { cn } from '../lib/utils';
import { t } from '../lib/i18n';

export function getRank(totalBp: number) {
  if (totalBp >= 10000) return 'rankProfessor';
  if (totalBp >= 5000) return 'rankPhilosopher';
  if (totalBp >= 1000) return 'rankScholar';
  return 'rankRookie';
}

export function Profile({ state, onUpdatePrefs }: { state: AppState, onUpdatePrefs: (prefs: Partial<AppState>) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('profile', state.language)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manageInfo', state.language)}</p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 text-center md:text-left">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <User className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('excellentStudent', state.language)}</h3>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                {t(getRank(state.totalBpEarned) as any, state.language)}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">hocsinh@lumi.edu.vn</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold rounded-full border border-amber-100 dark:border-amber-900/50">
                ⭐ {state.points} {t('bp', state.language)}
              </div>
              <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-semibold rounded-full border border-orange-100 dark:border-orange-900/50">
                <Flame className="w-4 h-4" /> {state.streakDays} {t('days', state.language)}
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors">
            {t('edit', state.language)}
          </button>
        </div>

        {/* Badges Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-500" /> {t('badges', state.language)}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={cn("p-4 rounded-xl border flex flex-col items-center text-center transition-all", state.badges.includes('nightOwl') ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60 grayscale")}>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", state.badges.includes('nightOwl') ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                <Moon className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t('badgeNightOwl', state.language)}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('badgeNightOwlDesc', state.language)}</p>
            </div>
            <div className={cn("p-4 rounded-xl border flex flex-col items-center text-center transition-all", state.badges.includes('mathMaster') ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60 grayscale")}>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", state.badges.includes('mathMaster') ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                <Star className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t('badgeMathMaster', state.language)}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('badgeMathMasterDesc', state.language)}</p>
            </div>
            <div className={cn("p-4 rounded-xl border flex flex-col items-center text-center transition-all", state.badges.includes('streakMaster') ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60 grayscale")}>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", state.badges.includes('streakMaster') ? "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                <Flame className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t('badgeStreakMaster', state.language)}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('badgeStreakMasterDesc', state.language)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" /> {t('settings', state.language)}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theme Toggle */}
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                  {state.theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{t('theme', state.language)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{state.theme === 'dark' ? t('dark', state.language) : t('light', state.language)}</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdatePrefs({ theme: state.theme === 'dark' ? 'light' : 'dark' })}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  state.theme === 'dark' ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  state.theme === 'dark' ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            {/* Language Toggle */}
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                  <Globe className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{t('language', state.language)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{state.language === 'en' ? 'English' : 'Tiếng Việt'}</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdatePrefs({ language: state.language === 'en' ? 'vi' : 'en' })}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  state.language === 'en' ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  state.language === 'en' ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            {/* Daily Limit Setting */}
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl flex flex-col justify-center bg-slate-50 dark:bg-slate-800/50 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{t('dailyLimitSetting', state.language)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {Math.floor(state.dailyLimit / 60)} {t('hours', state.language)} {state.dailyLimit % 60} {t('minutes', state.language)}
                    </p>
                  </div>
                </div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {state.dailyLimit} {t('minutes', state.language)}
                </div>
              </div>
              <input 
                type="range" 
                min="30" 
                max="300" 
                step="15" 
                value={state.dailyLimit} 
                onChange={(e) => onUpdatePrefs({ dailyLimit: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                <span>30 {t('minutes', state.language)}</span>
                <span>5 {t('hours', state.language)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
            <button className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" /> {t('logout', state.language)}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
