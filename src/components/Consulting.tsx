import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/gemini';
import { cn } from '../lib/utils';
import { AppState } from '../App';
import { t } from '../lib/i18n';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function Consulting({ state }: { state: AppState }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    try {
      const response = await chatWithAI(userMsg, messages);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, có lỗi xảy ra.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('studyConsulting', state.language)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('chatWithTutor', state.language)}</p>
      </header>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden min-h-[500px]">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Bot className="w-12 h-12 mb-4 text-indigo-200 dark:text-indigo-800" />
              <p>{t('askQuestion', state.language)}</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400")}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={cn("px-4 py-3 rounded-2xl max-w-[80%]", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-none")}>
                <div className="prose prose-slate max-w-none prose-sm dark:prose-invert">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {t('thinking', state.language)}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t('typeQuestion', state.language)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
