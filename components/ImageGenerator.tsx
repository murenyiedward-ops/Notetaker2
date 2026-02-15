import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Wand2, Download, AlertCircle } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { ImageSize } from '../types';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && aistudio.hasSelectedApiKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for dev environments without the aistudio wrapper
        // Assumes process.env.API_KEY might be present
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("Error checking API key status", e);
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
      // Assume success after interaction and re-check
      checkApiKey();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateImage(prompt, size);
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        setError("No image data returned from the model.");
      }
    } catch (err: any) {
      console.error("Image gen error:", err);
      // If error suggests auth issue, reset key state
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setError("API Key session expired or invalid. Please select a key again.");
      } else {
        setError(err.message || "Failed to generate image.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasApiKey && (window as any).aistudio) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-3">API Key Required</h2>
        <p className="text-slate-600 mb-6">
          To use the high-quality <strong>Nano Banana Pro</strong> (Gemini 3 Pro) image model, you need to select a paid API key from your Google Cloud project.
        </p>
        <button
          onClick={handleSelectKey}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
        >
          Select API Key
        </button>
        <p className="mt-4 text-xs text-slate-400">
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-indigo-600">
            View Billing Documentation
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wand2 className="w-3 h-3" />
            Configuration
          </h2>

          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Image Size</label>
              <div className="grid grid-cols-3 gap-2">
                {[ImageSize.SIZE_1K, ImageSize.SIZE_2K, ImageSize.SIZE_4K].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      size === s 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              <span>Generate Image</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white min-h-[500px] rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {generatedImage ? (
             <div className="relative w-full h-full flex flex-col items-center">
               <img 
                 src={generatedImage} 
                 alt="Generated" 
                 className="max-w-full max-h-[600px] rounded-lg shadow-md object-contain"
               />
               <a 
                 href={generatedImage} 
                 download={`generated-image-${Date.now()}.png`}
                 className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
               >
                 <Download className="w-4 h-4" />
                 Download Image
               </a>
             </div>
          ) : (
            <div className="text-center max-w-sm">
              {loading ? (
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                   <p className="text-slate-500 font-medium">Creating your masterpiece...</p>
                   <p className="text-slate-400 text-sm mt-1">This may take a moment for higher resolutions.</p>
                </div>
              ) : error ? (
                <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Generation Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <ImageIcon className="text-slate-300 w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Image Studio</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Enter a prompt and select a size to generate high-quality images using <strong>Gemini 3 Pro</strong>.
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