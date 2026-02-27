import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Report } from './components/Report';
import { EarnTime } from './components/EarnTime';
import { Consulting } from './components/Consulting';
import { StudyMethods } from './components/StudyMethods';
import { StudyCalendar } from './components/StudyCalendar';
import { Library } from './components/Library';
import { Interactive } from './components/Interactive';
import { Profile } from './components/Profile';
import { LayoutDashboard, BarChart3, Moon, Menu, X, MessageSquare, Lightbulb, Calendar, BookOpen, Gamepad2, User } from 'lucide-react';
import { cn } from './lib/utils';
import { t } from './lib/i18n';

export type AppData = {
  id: string;
  name: string;
  category: string;
  usedTime: number;
  limit: number;
  color: string;
};

export type QuizRecord = {
  id: string;
  topic: string;
  isCorrect: boolean;
  timestamp: number;
};

export type AppState = {
  dailyLimit: number;
  usedTime: number;
  earnedTime: number;
  points: number;
  totalBpEarned: number;
  streakDays: number;
  lastActiveDate: string;
  inventory: {
    skipPasses: number;
    avatars: string[];
    activeAvatar: string;
  };
  stats: {
    correctAfter10PM: number;
    consecutiveMath: number;
  };
  badges: string[];
  quizHistory: QuizRecord[];
  apps: AppData[];
  history: { date: string; used: number; limit: number }[];
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
};

const MOCK_APPS: AppData[] = [
  { id: '1', name: 'Instagram', category: 'Social', usedTime: 60, limit: 60, color: '#ec4899' },
  { id: '2', name: 'YouTube', category: 'Entertainment', usedTime: 85, limit: 90, color: '#ef4444' },
  { id: '3', name: 'Minecraft', category: 'Gaming', usedTime: 30, limit: 30, color: '#10b981' },
  { id: '4', name: 'Duolingo', category: 'Education', usedTime: 15, limit: 120, color: '#8b5cf6' },
];

const MOCK_HISTORY = [
  { date: 'Mon', used: 120, limit: 120 },
  { date: 'Tue', used: 145, limit: 120 },
  { date: 'Wed', used: 90, limit: 120 },
  { date: 'Thu', used: 110, limit: 120 },
  { date: 'Fri', used: 180, limit: 150 },
  { date: 'Sat', used: 240, limit: 240 },
  { date: 'Sun', used: 210, limit: 240 },
];

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'report' | 'earn' | 'consulting' | 'methods' | 'calendar' | 'library' | 'interactive' | 'profile'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [state, setState] = useState<AppState>({
    dailyLimit: 120,
    usedTime: 190,
    earnedTime: 0,
    points: 150,
    totalBpEarned: 150,
    streakDays: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    inventory: {
      skipPasses: 1,
      avatars: ['default'],
      activeAvatar: 'default',
    },
    stats: {
      correctAfter10PM: 0,
      consecutiveMath: 0,
    },
    badges: [],
    quizHistory: [],
    apps: MOCK_APPS,
    history: MOCK_HISTORY,
    theme: 'light',
    language: 'vi',
  });

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const handleUpdatePrefs = (prefs: Partial<AppState>) => {
    setState(s => ({ ...s, ...prefs }));
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastActiveDate !== today) {
      const lastDate = new Date(state.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      setState(s => {
        let newStreak = s.streakDays;
        let newPoints = s.points;
        let newTotalBp = s.totalBpEarned;
        const newBadges = [...s.badges];

        if (diffDays === 1) {
          newStreak += 1;
          newPoints += 50; // Daily streak bonus
          newTotalBp += 50;
          
          if (newStreak >= 30 && !newBadges.includes('streakMaster')) {
            newBadges.push('streakMaster');
          }
        } else if (diffDays > 1) {
          newStreak = 1; // Reset streak
        }

        return {
          ...s,
          lastActiveDate: today,
          streakDays: newStreak,
          points: newPoints,
          totalBpEarned: newTotalBp,
          badges: newBadges
        };
      });
    }
  }, [state.lastActiveDate]);

  // Simulate screen time usage
  useEffect(() => {
    const interval = setInterval(() => {
      setState(s => {
        const activeAppIndex = Math.floor(Math.random() * s.apps.length);
        const newApps = [...s.apps];
        newApps[activeAppIndex] = {
          ...newApps[activeAppIndex],
          usedTime: newApps[activeAppIndex].usedTime + 1
        };
        return { 
          ...s, 
          usedTime: s.usedTime + 1,
          apps: newApps
        };
      });
    }, 60000); // +1 min every minute
    return () => clearInterval(interval);
  }, []);

  const handleEarnTime = (minutes: number, appId?: string) => {
    setState(s => {
      const newState = { ...s, earnedTime: s.earnedTime + minutes };
      if (appId) {
        newState.apps = s.apps.map(app => 
          app.id === appId ? { ...app, limit: app.limit + minutes } : app
        );
      } else {
        newState.dailyLimit = s.dailyLimit + minutes;
      }
      return newState;
    });
  };

  const handleQuizResult = (topic: string, isCorrect: boolean) => {
    setState(s => {
      let newPoints = s.points;
      let newTotalBp = s.totalBpEarned;
      const newStats = { ...s.stats };
      const newBadges = [...s.badges];

      if (isCorrect) {
        newPoints += 10;
        newTotalBp += 10;

        // Check Night Owl
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 4) {
          newStats.correctAfter10PM += 1;
          if (newStats.correctAfter10PM >= 10 && !newBadges.includes('nightOwl')) {
            newBadges.push('nightOwl');
          }
        }

        // Check Math Master
        if (topic.toLowerCase() === 'toán học' || topic.toLowerCase() === 'math' || topic.toLowerCase() === 'mathematics') {
          newStats.consecutiveMath += 1;
          if (newStats.consecutiveMath >= 20 && !newBadges.includes('mathMaster')) {
            newBadges.push('mathMaster');
          }
        } else {
          newStats.consecutiveMath = 0;
        }
      } else {
        newStats.consecutiveMath = 0;
      }

      return {
        ...s,
        points: newPoints,
        totalBpEarned: newTotalBp,
        stats: newStats,
        badges: newBadges,
        quizHistory: [
          ...s.quizHistory,
          { id: Math.random().toString(), topic, isCorrect, timestamp: Date.now() }
        ]
      };
    });
  };

  const handleAddBp = (amount: number) => {
    setState(s => ({
      ...s,
      points: s.points + amount,
      totalBpEarned: s.totalBpEarned + amount
    }));
  };

  const handleBuyItem = (item: 'extend' | 'skip' | 'avatar', cost: number) => {
    setState(s => {
      if (s.points < cost) return s;
      const newState = { ...s, points: s.points - cost };
      
      if (item === 'extend') {
        newState.dailyLimit += 15;
        newState.earnedTime += 15;
      } else if (item === 'skip') {
        newState.inventory = { ...s.inventory, skipPasses: s.inventory.skipPasses + 1 };
      } else if (item === 'avatar') {
        const newAvatarId = `avatar_${Math.floor(Math.random() * 1000)}`;
        newState.inventory = { 
          ...s.inventory, 
          avatars: [...s.inventory.avatars, newAvatarId],
          activeAvatar: newAvatarId
        };
      }
      return newState;
    });
  };
  
  const handleUseSkipPass = () => {
    setState(s => {
      if (s.inventory.skipPasses <= 0) return s;
      return {
        ...s,
        inventory: { ...s.inventory, skipPasses: s.inventory.skipPasses - 1 }
      };
    });
  };

  const handleRedeemPoints = (cost: number, minutes: number, appId?: string) => {
    setState(s => {
      if (s.points < cost) return s;
      const newState = { 
        ...s, 
        points: s.points - cost,
        earnedTime: s.earnedTime + minutes 
      };
      if (appId) {
        newState.apps = s.apps.map(app => 
          app.id === appId ? { ...app, limit: app.limit + minutes } : app
        );
      } else {
        newState.dailyLimit = s.dailyLimit + minutes;
      }
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-20 transition-colors duration-300">
        <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Moon className="w-6 h-6 fill-indigo-600 dark:fill-indigo-400" />
          Lumi
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-20 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
      )}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h1 className={cn(
            "text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400 transition-opacity duration-300",
            !isSidebarOpen && "md:opacity-0 md:w-0 overflow-hidden"
          )}>
            <Moon className="w-6 h-6 shrink-0 fill-indigo-600 dark:fill-indigo-400" />
            <span className="whitespace-nowrap">Lumi</span>
          </h1>
          
          {/* Desktop Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 flex flex-col overflow-y-auto">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5 shrink-0" />} 
            label={t('dashboard', state.language)} 
            active={currentView === 'dashboard'} 
            onClick={() => {
              setCurrentView('dashboard');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<BarChart3 className="w-5 h-5 shrink-0" />} 
            label={t('report', state.language)} 
            active={currentView === 'report'} 
            onClick={() => {
              setCurrentView('report');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<Moon className="w-5 h-5 shrink-0" />} 
            label={t('earnTime', state.language)} 
            active={currentView === 'earn'} 
            onClick={() => {
              setCurrentView('earn');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<Gamepad2 className="w-5 h-5 shrink-0" />} 
            label={t('interactive', state.language)} 
            active={currentView === 'interactive'} 
            onClick={() => {
              setCurrentView('interactive');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<BookOpen className="w-5 h-5 shrink-0" />} 
            label={t('library', state.language)} 
            active={currentView === 'library'} 
            onClick={() => {
              setCurrentView('library');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<Calendar className="w-5 h-5 shrink-0" />} 
            label={t('calendar', state.language)} 
            active={currentView === 'calendar'} 
            onClick={() => {
              setCurrentView('calendar');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<MessageSquare className="w-5 h-5 shrink-0" />} 
            label={t('consulting', state.language)} 
            active={currentView === 'consulting'} 
            onClick={() => {
              setCurrentView('consulting');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<Lightbulb className="w-5 h-5 shrink-0" />} 
            label={t('methods', state.language)} 
            active={currentView === 'methods'} 
            onClick={() => {
              setCurrentView('methods');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
          <NavItem 
            icon={<User className="w-5 h-5 shrink-0" />} 
            label={t('profile', state.language)} 
            active={currentView === 'profile'} 
            onClick={() => {
              setCurrentView('profile');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isExpanded={isSidebarOpen}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto">
          {currentView === 'dashboard' && <Dashboard state={state} />}
          {currentView === 'report' && <Report state={state} />}
          {currentView === 'earn' && <EarnTime state={state} onQuizResult={handleQuizResult} onRedeem={handleRedeemPoints} onAddBp={handleAddBp} onBuyItem={handleBuyItem} onUseSkipPass={handleUseSkipPass} />}
          {currentView === 'interactive' && <Interactive state={state} />}
          {currentView === 'library' && <Library state={state} />}
          {currentView === 'calendar' && <StudyCalendar state={state} />}
          {currentView === 'consulting' && <Consulting state={state} />}
          {currentView === 'methods' && <StudyMethods state={state} />}
          {currentView === 'profile' && <Profile state={state} onUpdatePrefs={handleUpdatePrefs} />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, isExpanded }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isExpanded: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap overflow-hidden",
        active 
          ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200",
        !isExpanded && "md:px-3 md:justify-center"
      )}
      title={!isExpanded ? label : undefined}
    >
      {icon}
      <span className={cn(
        "transition-opacity duration-300",
        !isExpanded && "md:opacity-0 md:w-0"
      )}>
        {label}
      </span>
    </button>
  );
}
