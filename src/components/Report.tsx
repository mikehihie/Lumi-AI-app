import { useState } from 'react';
import { AppState } from '../App';
import { t } from '../lib/i18n';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Legend } from 'recharts';
import { generateParentReport } from '../services/gemini';
import { FileText, Loader2, Sparkles } from 'lucide-react';

export function Report({ state }: { state: AppState }) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const result = await generateParentReport(state.quizHistory, state.apps);
      setReport(result);
    } catch (error) {
      console.error(error);
      setReport(t('errorGeneratingReport', state.language));
    } finally {
      setIsGenerating(false);
    }
  };
  const averageUsed = Math.round(state.history.reduce((acc, curr) => acc + curr.used, 0) / state.history.length);
  
  const categoryData = state.apps.reduce((acc, app) => {
    const existing = acc.find(c => c.name === app.category);
    if (existing) {
      existing.value += app.usedTime;
    } else {
      acc.push({ name: app.category, value: app.usedTime, color: app.color });
    }
    return acc;
  }, [] as { name: string, value: number, color: string }[]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('reportAndStats', state.language)}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('reviewHabits', state.language)}</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {t('generateParentReport', state.language)}
        </button>
      </header>

      {report && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 md:p-8 shadow-sm border border-indigo-100 dark:border-indigo-900/50 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{t('aiParentReport', state.language)}</h3>
          </div>
          <div className="prose prose-indigo max-w-none dark:prose-invert">
            {report.split('\n').map((paragraph, idx) => (
              <p key={idx} className="text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed mb-3">{paragraph}</p>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t('dailyAverage', state.language)}</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {Math.floor(averageUsed / 60)}h {averageUsed % 60}m
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t('mostActiveDay', state.language)}</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {state.history.reduce((max, curr) => curr.used > max.used ? curr : max, state.history[0]).date}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('usageHistory', state.language)}</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={state.history} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `${Math.floor(value / 60)}h`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Time Used']}
              />
              <ReferenceLine y={state.dailyLimit} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'Limit', fill: '#f43f5e', fontSize: 12 }} />
              <Bar 
                dataKey="used" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('appDistribution', state.language)}</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Time Used']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
