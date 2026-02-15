import React, { useState } from 'react';
import { Mic, Image as ImageIcon, Sparkles } from 'lucide-react';
import { NoteTaker } from './components/NoteTaker';
import { ImageGenerator } from './components/ImageGenerator';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'images'>('notes');

  return (
    <div class="max-w-5xl mx-auto px-4 py-6 pb-20">
      <header class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles class="text-indigo-600 w-6 h-6" />
            AI Note Taker Pro
          </h1>
          <p class="text-slate-500 text-sm mt-1">Professional meeting insights & Creative Studio.</p>
        </div>
        
        <div class="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
          <button
            onClick={() => setActiveTab('notes')}
            class={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Mic class="w-4 h-4" />
            Meeting Notes
          </button>
          <button
            onClick={() => setActiveTab('images')}
            class={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'images'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ImageIcon class="w-4 h-4" />
            Image Studio
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'notes' ? <NoteTaker /> : <ImageGenerator />}
      </main>
    </div>
  );
};

export default App;