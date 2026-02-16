import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Wand2, Download, AlertCircle, Trash2 } from 'lucide-react';
import { generateImage } from '../services/geminiService.ts';
import { ImageAspectRatio } from '../types.ts';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        setError("The model did not return an image. Try a different prompt.");
      }
    } catch (err: any) {
      console.error("Image gen error:", err);
      setError(err.message || "Failed to generate image. Ensure your API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const clearStudio = () => {
    setGeneratedImage(null);
    setError(null);
    setPrompt('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wand2 className="w-3 h-3" />
            Image Controls
          </h2>

          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ImageAspectRatio).map(([key, value]) => (
                  <button
                    key={value}
                    onClick={() => setAspectRatio(value as ImageAspectRatio)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      aspectRatio === value 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Creative Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city with purple neon lights..."
                className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-4 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                <span>Generate Masterpiece</span>
              </button>
              
              <button
                onClick={clearStudio}
                disabled={loading || (!generatedImage && !prompt)}
                className="w-full py-2 px-4 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white min-h-[500px] rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {generatedImage ? (
             <div className="relative w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
               <img 
                 src={generatedImage} 
                 alt="AI Generated" 
                 className="max-w-full max-h-[600px] rounded-2xl shadow-2xl border border-slate-100 object-contain"
               />
               <div className="mt-6 flex gap-3">
                 <a 
                   href={generatedImage} 
                   download={`murenyi-ai-${Date.now()}.png`}
                   className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold transition-all hover:bg-slate-800 shadow-lg active:scale-95"
                 >
                   <Download className="w-4 h-4" />
                   Save Image
                 </a>
                 <button 
                  onClick={() => setGeneratedImage(null)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                 >
                  New Draft
                 </button>
               </div>
             </div>
          ) : (
            <div className="text-center max-w-sm">
              {loading ? (
                <div className="flex flex-col items-center">
                   <div className="relative mb-6">
                     <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                     <ImageIcon className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                   </div>
                   <p className="text-slate-900 font-bold text-lg">Igniting Creativity...</p>
                   <p className="text-slate-500 text-sm mt-1">Generating your vision using Flash Engine.</p>
                </div>
              ) : error ? (
                <div className="text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center">
                  <AlertCircle className="w-10 h-10 mb-3" />
                  <p className="font-bold">Something went wrong</p>
                  <p className="text-sm mt-1 text-red-400">{error}</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <ImageIcon className="text-slate-300 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Image Studio Pro</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Describe anything and the AI will visualize it instantly. Powered by Gemini 2.5 Flash.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};