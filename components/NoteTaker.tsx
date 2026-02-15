import React, { useState, useRef } from 'react';
import { Play, Square, Settings, FileText, Copy, MicOff, Loader2 } from 'lucide-react';
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

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(mediaStream, { mimeType });
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

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
      setOutput('');

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
      setOutput(`Error generating notes: ${error.message || 'Unknown error'}`);
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
    navigator.clipboard.writeText(output);
    alert('Markdown notes copied to clipboard!');
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
                RECORDING {timer}
              </div>
            )}
          </div>
          
          {!isRecording ? (
            <button 
              onClick={startRecording}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="mt-6">
            <AudioVisualizer stream={stream} isRecording={isRecording} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-3 h-3" />
            Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase text-indigo-600">Language</label>
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value as MeetingLanguage)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              >
                <option value={MeetingLanguage.MULTILINGUAL}>Auto-Detect (Kiswahili/English)</option>
                <option value={MeetingLanguage.KISWAHILI}>Kiswahili Only</option>
                <option value={MeetingLanguage.ENGLISH}>English Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Meeting Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as MeetingType)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              >
                <option value={MeetingType.GENERAL}>Standard Meeting</option>
                <option value={MeetingType.SALES}>Sales Discovery</option>
                <option value={MeetingType.TECHNICAL}>Technical Architecture</option>
                <option value={MeetingType.BRAINSTORM}>Creative Brainstorming</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white min-h-[550px] rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Output
            </span>
            {output && (
              <button 
                onClick={copyToClipboard}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50" 
                title="Copy to Clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="p-6 md:p-8 flex-grow flex flex-col relative">
            {!output && !isProcessing && (
              <div className="m-auto text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MicOff className="text-slate-300 w-6 h-6" />
                </div>
                <h3 className="text-md font-medium text-slate-900">Ready to record</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Tap start to record your meeting.</p>
              </div>
            )}

            {isProcessing && (
              <div className="m-auto text-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                <h3 className="text-md font-medium text-slate-900">AI is thinking...</h3>
                <p className="text-slate-500 text-sm mt-1">Analyzing audio & generating structured notes.</p>
              </div>
            )}

            {output && !isProcessing && (
              <div 
                className="w-full text-left prose prose-slate prose-sm max-w-none 
                prose-headings:text-indigo-900 prose-a:text-indigo-600
                prose-th:bg-slate-50 prose-th:p-3 prose-td:p-3 prose-table:rounded-lg prose-table:overflow-hidden prose-table:border"
                dangerouslySetInnerHTML={{ __html: marked.parse(output) as string }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};