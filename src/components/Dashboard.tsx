import React from 'react';
import { AppState } from '../App';
import { motion } from 'motion/react';
import { Clock, Smartphone, Trophy, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { cn } from '../lib/utils';
import { t } from '../lib/i18n';

export function Dashboard({ state }: { state: AppState }) {
  const remaining = Math.max(0, state.dailyLimit - state.usedTime);
  const percentage = Math.min(100, (state.usedTime / state.dailyLimit) * 100);
  const isOverLimit = state.usedTime >= state.dailyLimit;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('todaysOverview', state.language)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('monitorScreenTime', state.language)}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={t('timeUsed', state.language)} 
          value={`${Math.floor(state.usedTime / 60)}h ${state.usedTime % 60}m`}
          icon={<Smartphone className="w-6 h-6 text-blue-500" />}
          trend={t('today', state.language)}
        />
        <StatCard 
          title={t('timeRemaining', state.language)} 
          value={`${Math.floor(remaining / 60)}h ${remaining % 60}m`}
          icon={<Clock className="w-6 h-6 text-emerald-500" />}
          trend={t('untilLocked', state.language)}
          alert={remaining < 15}
        />
        <StatCard 
          title={t('earnedTime', state.language)} 
          value={`+${state.earnedTime}m`}
          icon={<Trophy className="w-6 h-6 text-amber-500" />}
          trend={t('fromQuizzes', state.language)}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('dailyLimitProgress', state.language)}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('usedPercentage', state.language, percentage.toFixed(0))}</p>
          </div>
          {isOverLimit && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {t('limitExceeded', state.language)}
            </div>
          )}
        </div>

        <div className="relative h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-6">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "absolute top-0 left-0 h-full rounded-full",
              isOverLimit ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-indigo-500"
            )}
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-400 mt-3">
          <span>0h</span>
          <span>{Math.floor(state.dailyLimit / 60)}h {state.dailyLimit % 60}m {t('limitLabel', state.language)}</span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">{t('individualApps', state.language)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.apps.map(app => {
            const isEducational = app.category === 'Học tập' || app.category === 'Education';
            const appPercentage = isEducational ? 0 : Math.min(100, (app.usedTime / app.limit) * 100);
            const isAppLocked = !isEducational && app.usedTime >= app.limit;
            return (
              <div key={app.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: app.color }}>
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{app.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{isEducational ? t('educationalApp', state.language) : app.category}</p>
                    </div>
                  </div>
                  {isEducational ? (
                    <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      <Unlock className="w-3 h-3" /> {t('alwaysActive', state.language)}
                    </div>
                  ) : isAppLocked ? (
                    <div className="flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" /> {t('locked', state.language)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      <Unlock className="w-3 h-3" /> {t('active', state.language)}
                    </div>
                  )}
                </div>
                {!isEducational && (
                  <>
                    <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${appPercentage}%` }}
                        className={cn("absolute top-0 left-0 h-full rounded-full", isAppLocked ? "bg-rose-500" : "")}
                        style={{ backgroundColor: isAppLocked ? undefined : app.color }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>{Math.floor(app.usedTime / 60)}h {app.usedTime % 60}m {t('used', state.language)}</span>
                      <span>{Math.floor(app.limit / 60)}h {app.limit % 60}m {t('limitLabel', state.language)}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, alert }: { title: string, value: string, icon: React.ReactNode, trend: string, alert?: boolean }) {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border",
      alert ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10" : "border-slate-100 dark:border-slate-700"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-3xl font-bold tracking-tight",
          alert ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
        )}>{value}</span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">{trend}</p>
    </div>
  );
}
