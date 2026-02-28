import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Upload, FileText, Play, Loader2, CheckCircle2, XCircle, FileUp } from 'lucide-react';
import { generateQuizFromText, extractTextFromFile } from '../services/gemini';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { AppState } from '../App';
import { t } from '../lib/i18n';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function Library({ state }: { state: AppState }) {
  const [documents, setDocuments] = useState<{id: string, name: string, content: string}[]>([
    { id: '1', name: 'Lịch sử Việt Nam thế kỷ 20.txt', content: 'Năm 1945, Việt Nam tuyên bố độc lập...' }
  ]);
  const [uploadText, setUploadText] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizState, setQuizState] = useState<'idle'|'loading'|'active'|'answered'>('idle');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const handleUpload = () => {
    if (!uploadText || !uploadName) return;
    setDocuments([...documents, { id: Math.random().toString(), name: uploadName, content: uploadText }]);
    setShowUpload(false);
    setUploadText('');
    setUploadName('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      setUploadText(text);
      if (!uploadName) {
        setUploadName(file.name);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi trích xuất văn bản từ file.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateQuiz = async (content: string) => {
    setQuizState('loading');
    try {
      const q = await generateQuizFromText(content);
      setActiveQuiz(q);
      setSelectedOpt(null);
      setQuizState('active');
    } catch (e) {
      console.error(e);
      setQuizState('idle');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('documentLibrary', state.language)}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('storeDocs', state.language)}</p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <Upload className="w-5 h-5" /> {t('upload', state.language)}
        </button>
      </header>

      {showUpload && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('addNewDoc', state.language)}</h3>
          <input type="text" placeholder={t('docName', state.language)} value={uploadName} onChange={e => setUploadName(e.target.value)} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4" />
          
          <div className="mb-4">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,image/*"
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('extractingText', state.language)}</span>
                </>
              ) : (
                <>
                  <FileUp className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('uploadFile', state.language)}</span>
                </>
              )}
            </label>
          </div>

          <textarea placeholder={t('pasteContent', state.language)} value={uploadText} onChange={e => setUploadText(e.target.value)} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4 min-h-[150px]" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium">{t('cancel', state.language)}</button>
            <button onClick={handleUpload} disabled={isExtracting} className="px-4 py-2 bg-indigo-600 disabled:bg-slate-400 text-white rounded-xl font-medium">{t('saveDoc', state.language)}</button>
          </div>
        </motion.div>
      )}

      {quizState === 'loading' && (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('aiReading', state.language)}</p>
        </div>
      )}

      {(quizState === 'active' || quizState === 'answered') && activeQuiz && (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="text-xl font-bold text-slate-900 dark:text-white prose prose-slate max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {activeQuiz.question}
              </ReactMarkdown>
            </div>
            <button onClick={() => setQuizState('idle')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{t('close', state.language)}</button>
          </div>
          <div className="space-y-3">
            {activeQuiz.options.map((opt: string, idx: number) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = idx === activeQuiz.correctAnswerIndex;
              const showCorrect = quizState === 'answered' && isCorrect;
              const showIncorrect = quizState === 'answered' && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (quizState !== 'active') return;
                    setSelectedOpt(idx);
                    setQuizState('answered');
                  }}
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
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl prose prose-slate max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {activeQuiz.explanation}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2">{doc.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{doc.content.length} {t('chars', state.language)}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 flex-1">{doc.content}</p>
            <button 
              onClick={() => handleCreateQuiz(doc.content)}
              className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> {t('createQuizAI', state.language)}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
