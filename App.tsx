import React, { useState } from 'react';
import { Mic, Image as ImageIcon, Zap } from 'lucide-react';
import { NoteTaker } from './components/NoteTaker.tsx';
import { ImageGenerator } from './components/ImageGenerator.tsx';

const Logo: React.FC = () => (
  <div className="relative w-10 h-10 flex-shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#logo-grad)" />
      <path 
        d="M25 70V30L50 50L75 30V70" 
        fill="none" 
        stroke="white" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="82" cy="18" r="10" fill="#facc15" className="animate-pulse" />
    </svg>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'images'>('notes');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <Logo />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Murenyi <span className="text-indigo-600">Pro</span>
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Ultra-Fast Flash Mode
            </p>
          </div>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex self-start md:self-center">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Mic className="w-4 h-4" />
            Meeting Notes
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'images'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image Studio
          </button>
        </div>
      </header>

      <main className="transition-all duration-300">
        {activeTab === 'notes' ? <NoteTaker /> : <ImageGenerator />}
      </main>

      <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs font-medium">
        <p>© 2025 Murenyi Pro • Optimized for Performance</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <span>Gemini 3 Flash (Text)</span>
          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
          <span>Gemini 2.5 Flash (Image)</span>
        </div>
      </footer>
    </div>
  );
};

export default App;