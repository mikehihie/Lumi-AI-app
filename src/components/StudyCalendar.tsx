import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Plus, Bell, Clock } from 'lucide-react';
import { AppState } from '../App';
import { t } from '../lib/i18n';

type Event = { id: string, title: string, date: string, time: string, type: string };

export function StudyCalendar({ state }: { state: AppState }) {
  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'Ôn tập Toán', date: new Date().toISOString().split('T')[0], time: '19:00', type: 'study' },
    { id: '2', title: 'Làm bài tập Tiếng Anh', date: new Date().toISOString().split('T')[0], time: '20:30', type: 'homework' }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: new Date().toISOString().split('T')[0], time: '19:00', type: 'study' });

  const handleAdd = () => {
    if (!newEvent.title) return;
    setEvents([...events, { ...newEvent, id: Math.random().toString() }]);
    setShowForm(false);
    setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], time: '19:00', type: 'study' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('studyCalendar', state.language)}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manageTime', state.language)}</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> {t('addEvent', state.language)}
        </button>
      </header>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('addNewEvent', state.language)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder={t('eventName', state.language)} value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="px-4 py-2 border dark:border-slate-600 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2" />
            <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="px-4 py-2 border dark:border-slate-600 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="px-4 py-2 border dark:border-slate-600 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium">{t('cancel', state.language)}</button>
            <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium">{t('save', state.language)}</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-900 dark:text-white">{t('upcomingSchedule', state.language)}</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {events.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(ev => (
            <div key={ev.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <span className="text-xs font-bold uppercase">{new Date(ev.date).toLocaleDateString(state.language === 'en' ? 'en-US' : 'vi-VN', { weekday: 'short' })}</span>
                  <span className="text-lg font-black leading-none">{new Date(ev.date).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <Clock className="w-4 h-4" /> {ev.time}
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          ))}
          {events.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">{t('noEvents', state.language)}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
