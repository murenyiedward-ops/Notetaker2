import React, { useState, useRef } from 'react';
import { Play, Square, Settings, FileText, Copy, MicOff, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { marked } from 'marked';
import { AudioVisualizer } from './AudioVisualizer.tsx';
import { generateMeetingNotes } from '../services/geminiService.ts';
import { MeetingType, MeetingLanguage } from '../types.ts';

export const NoteTaker: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [timer, setTimer] = useState('00:00');
  const [output, setOutput] = useState<string>('');
  
  const [lang, setLang] = useState<MeetingLanguage>(MeetingLanguage.MULTILINGUAL);
  const [type, setType] = useState<MeetingType>(MeetingType.GENERAL);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const resetSession = () => {
    if (isRecording) stopRecording();
    setOutput('');
    setTimer('00:00');
    chunksRef.current = [];
  };

  const startRecording = async () => {
    try {
      // Clear previous output automatically on new start
      setOutput('');
      chunksRef.current = [];

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(mediaStream, { mimeType });
      
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(blob, mimeType);
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      recorder.start();
      setIsRecording(true);

      startTimeRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        const diff = Date.now() - startTimeRef.current;
        const mins = Math.floor(diff / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setTimer(`${mins}:${secs}`);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const processAudio = async (blob: Blob, mimeType: string) => {
    setIsProcessing(true);
    try {
      const base64Audio = await blobToBase64(blob);
      const notes = await generateMeetingNotes(base64Audio.split(',')[1], mimeType, type, lang);
      setOutput(notes);
    } catch (error: any) {
      console.error("Processing error:", error);
      if (error.message?.includes("entity was not found")) {
        setOutput("❌ API Key Error: Please re-select your API key in the header.");
      } else {
        setOutput(`Error generating notes: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '<span class="text-xs text-green-600 font-bold">COPIED!</span>';
      setTimeout(() => btn.innerHTML = original, 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Record</h2>
            {isRecording && (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                LIVE {timer}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {!isRecording ? (
              <button 
                onClick={startRecording}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-200 active:scale-95"
              >
                <Square className="w-5 h-5 fill-current" />
                Stop & Analyze
              </button>
            )}

            <button 
              onClick={resetSession}
              disabled={isProcessing || (!output && !isRecording && timer === '00:00')}
              className="w-full py-2 px-6 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-100 disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Session</span>
            </button>
          </div>

          <div className="mt-6">
            <AudioVisualizer stream={stream} isRecording={isRecording} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-3 h-3" />
            Analysis Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Meeting Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as MeetingType)}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              >
                <option value={MeetingType.GENERAL}>Standard Meeting</option>
                <option value={MeetingType.SALES}>Sales Discovery</option>
                <option value={MeetingType.TECHNICAL}>Technical Architecture</option>
                <option value={MeetingType.BRAINSTORM}>Creative Brainstorming</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase text-indigo-600">Audio Language</label>
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value as MeetingLanguage)}
                className="w-full p-2.5 text-sm border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/30"
              >
                <option value={MeetingLanguage.MULTILINGUAL}>Mix (Swahili/English)</option>
                <option value={MeetingLanguage.KISWAHILI}>Swahili Only</option>
                <option value={MeetingLanguage.ENGLISH}>English Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white min-h-[600px] rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50/50">
            <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              SESSION OUTPUT
            </span>
            <div className="flex items-center gap-2">
              {output && (
                <>
                  <button 
                    id="copy-btn"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors rounded-lg bg-white border border-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Notes
                  </button>
                  <button 
                    onClick={resetSession}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg bg-white border border-slate-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6 md:p-8 flex-grow flex flex-col relative bg-white">
            {!output && !isProcessing && (
              <div className="m-auto text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <MicOff className="text-slate-300 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Listening to you...</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                  Notes will appear here after you stop recording and AI finishes analyzing.
                </p>
              </div>
            )}

            {isProcessing && (
              <div className="m-auto text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <RefreshCw className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Analysis in Progress</h3>
                <p className="text-slate-500 text-sm mt-2 animate-pulse font-medium italic">Summarizing key decisions and action items...</p>
              </div>
            )}

            {output && !isProcessing && (
              <div 
                className="w-full text-left prose prose-slate prose-sm max-w-none 
                prose-headings:text-indigo-950 prose-headings:font-black prose-headings:mb-4
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-th:bg-indigo-50 prose-th:p-3 prose-th:text-indigo-900 prose-th:font-bold
                prose-td:p-3 prose-td:border-b prose-table:rounded-xl prose-table:overflow-hidden prose-table:border"
                dangerouslySetInnerHTML={{ __html: marked.parse(output) as string }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};