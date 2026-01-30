
import React, { useState, useEffect } from 'react';
import { AppState, AudioPreset, UnsplashImage, HistoryItem, AspectRatio, QuranConfig, AppMode } from './types';
import { AUDIO_PRESETS, UPLOAD_MODE_STEPS, RECITER_MODE_STEPS } from './constants';
import { fetchPexelsAssets, StockAsset } from './services/unsplashService'; 
import { useAudioProcessing } from './hooks/useAudioProcessing';
import { useVideoExport } from './hooks/useVideoExport';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { StepWizard } from './components/StepWizard';
// Removed HistorySidebar import

// Steps
import { ModeSelectionStep } from './components/steps/ModeSelectionStep';
import { DetailsStep } from './components/steps/DetailsStep';
import { ReciterSetupStep } from './components/steps/ReciterSetupStep'; 
import { BackgroundStep } from './components/steps/BackgroundStep';
import { AudioStep } from './components/steps/AudioStep';
import { TextOverlayStep } from './components/steps/TextOverlayStep'; 
import { GlobalStyleStep } from './components/steps/GlobalStyleStep'; 
import { QualityStep } from './components/steps/QualityStep';
import { StyleStep } from './components/steps/StyleStep';
import { ExportStep } from './components/steps/ExportStep';

const CURRENT_VERSION = '3.1'; 

export default function App() {
  // --- Global State ---
  const [state, setState] = useState<AppState>({
    step: 1,
    mode: 'upload', 
    processingMode: 'phone',

    readerName: '',
    surahName: '',
    
    // Video Config
    aspectRatio: '16:9', 

    // Reciter Mode
    selectedReciterId: null,

    // Backgrounds
    selectedAssets: [],
    
    // Audio
    audioFile: null,
    audioUrl: null,
    audioDuration: 0,
    
    // Audio Settings
    reverbAmount: 0,
    echoAmount: 0,
    isNormalized: false,
    selectedPresetId: 'custom',
    customPresets: [],
    
    // Quran Text Default State
    quranConfig: {
      isEnabled: false,
      surahNumber: 1,
      fromAyah: 1,
      toAyah: 7,
      verses: [],
      timings: [],
      style: {
        font: 'Amiri Quran',
        color: '#ffffff',
        fontSizeScale: 1,
        hasShadow: true
      },
      position: { x: 50, y: 50 },
      highlightColor: '#10b981', 
      highlights: [],
      apiKeys: [],
      generateNoTextVariant: false 
    },

    // Global Style
    globalStyle: {
        transitionType: 'fade', 
        textAnimation: 'fade', 
        autoHighlights: []
    },

    // Video Settings
    resolution: '1080p',
    fps: 30,
    format: 'mp4',
    
    // Style / Typography 
    surahPosition: { x: 50, y: 15 }, 
    readerPosition: { x: 50, y: 85 },
    surahStyle: {
        font: 'Amiri',
        color: '#fbbf24', 
        fontSizeScale: 1,
        hasShadow: true
    },
    readerStyle: {
        font: 'Amiri',
        color: '#ffffff', 
        fontSizeScale: 1,
        hasShadow: true
    },
    
    isProcessing: false,
    progress: 0,
    queuePosition: null,
    history: [],
    showHistory: false,
  });

  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [videos, setVideos] = useState<StockAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  
  // Export State
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedNoTextUrl, setGeneratedNoTextUrl] = useState<string | null>(null);
  const [generatedExtension, setGeneratedExtension] = useState<string>('mp4'); // Store actual extension

  const [startTime, setStartTime] = useState<number>(0);

  // --- Hooks ---
  const { 
    isPlaying, currentTime, duration, isReady, togglePlay, play, pause, audioBuffer 
  } = useAudioProcessing({
    file: state.audioFile,
    audioUrl: state.audioUrl,
    reverbAmount: state.reverbAmount,
    echoAmount: state.echoAmount,
    normalize: state.isNormalized
  });

  const { isExporting, exportProgress, generateVideo } = useVideoExport();

  // --- Logic Helpers ---
  const updateState = (updates: Partial<AppState>) => setState(s => ({ ...s, ...updates }));

  // --- Effects ---
  useEffect(() => {
    // Load LocalStorage Data
    const savedPresetId = localStorage.getItem('lastPresetId');
    const savedCustomPresets = localStorage.getItem('customPresets');
    const savedHistory = localStorage.getItem('videoHistory');
    const savedKeys = localStorage.getItem('geminiApiKeys'); 
    
    let parsedPresets: AudioPreset[] = [];
    if (savedCustomPresets) {
      try { parsedPresets = JSON.parse(savedCustomPresets); } catch (e) {}
    }

    let parsedHistory: HistoryItem[] = [];
    if (savedHistory) {
        try { parsedHistory = JSON.parse(savedHistory); } catch (e) {}
    }

    let parsedKeys: string[] = [];
    if (savedKeys) {
        try { parsedKeys = JSON.parse(savedKeys); } catch(e) {}
    }

    setState(s => ({
      ...s,
      customPresets: parsedPresets,
      history: parsedHistory,
      quranConfig: { ...s.quranConfig, apiKeys: parsedKeys }
    }));

    if (savedPresetId) {
      const defaultPreset = AUDIO_PRESETS.find(p => p.id === savedPresetId);
      if (defaultPreset) applyPreset(defaultPreset);
      else {
        const customPreset = parsedPresets.find(p => p.id === savedPresetId);
        if (customPreset) applyPreset(customPreset);
      }
    }
  }, []);

  // Time Estimation
  useEffect(() => {
    if (isExporting) {
        if (exportProgress <= 10) {
            setStartTime(Date.now());
        } else {
            const elapsed = Date.now() - startTime;
            const realProgress = (exportProgress - 10) / 90;
            
            if (realProgress > 0.05) {
                const totalEstimated = elapsed / realProgress;
                const remaining = totalEstimated - elapsed;
                
                const seconds = Math.ceil(remaining / 1000);
                let timeStr = "";
                if (seconds < 60) timeStr = `${seconds} ثانية`;
                else {
                     const minutes = Math.floor(seconds / 60);
                     timeStr = `${minutes} دقيقة و ${seconds % 60} ثانية`;
                }
                updateState({ timeRemaining: timeStr });
            }
        }
    } else {
        updateState({ timeRemaining: undefined });
    }
  }, [isExporting, exportProgress]);

  // Asset Fetching
  const fetchAssets = async () => {
    setLoadingAssets(true);
    const { images: newImages, videos: newVideos } = await fetchPexelsAssets();
    setImages(newImages);
    setVideos(newVideos);
    setLoadingAssets(false);
  };

  useEffect(() => {
    if (state.step === 3) {
      fetchAssets();
    }
  }, [state.step]);

  // Headless Auto-Export Logic
  useEffect(() => {
    const headlessConfig = (window as any).__HEADLESS_CONFIG__;
    if (headlessConfig) {
        console.log("Headless mode detected, initializing...");
        updateState({ ...headlessConfig, step: 9 });

        // Give it a moment to initialize everything
        const timer = setTimeout(() => {
            const startBtn = document.getElementById('start-processing-button') as HTMLButtonElement;
            if (startBtn && !state.isProcessing) {
                console.log("Triggering auto-start...");
                startBtn.click();
            }
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, []);

  // Expose completion to Puppeteer
  useEffect(() => {
      if ((window as any).__HEADLESS_CONFIG__ && generatedVideoUrl) {
          console.log("Export complete, notifying parent...");
          (window as any).generatedVideoUrl = generatedVideoUrl;
          (window as any).onExportComplete?.(generatedVideoUrl, generatedExtension);
      }
  }, [generatedVideoUrl, generatedExtension]);

  useEffect(() => {
    if (state.mode === 'upload' && state.step !== 4 && isPlaying) {
        pause();
    }
  }, [state.step, isPlaying, pause, state.mode]);

  const applyPreset = (preset: AudioPreset) => {
    updateState({
      selectedPresetId: preset.id,
      reverbAmount: preset.reverb,
      echoAmount: preset.echo,
      isNormalized: preset.normalize
    });
    localStorage.setItem('lastPresetId', preset.id);
  };

  const saveCustomPreset = (name: string) => {
    if (!name.trim()) return;
    const newPreset: AudioPreset = {
      id: `custom-${Date.now()}`,
      name,
      reverb: state.reverbAmount,
      echo: state.echoAmount,
      normalize: state.isNormalized,
      isCustom: true
    };
    const updated = [...state.customPresets, newPreset];
    updateState({ customPresets: updated, selectedPresetId: newPreset.id });
    localStorage.setItem('customPresets', JSON.stringify(updated));
    localStorage.setItem('lastPresetId', newPreset.id);
  };

  const deleteCustomPreset = (id: string) => {
    const updated = state.customPresets.filter(p => p.id !== id);
    updateState({ 
        customPresets: updated,
        selectedPresetId: state.selectedPresetId === id ? 'custom' : state.selectedPresetId
    });
    localStorage.setItem('customPresets', JSON.stringify(updated));
  };

  const addToHistory = () => {
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          surahName: state.surahName,
          readerName: state.readerName,
          resolution: state.resolution,
          aspectRatio: state.aspectRatio
      };
      const updatedHistory = [newItem, ...state.history];
      updateState({ history: updatedHistory });
      localStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
  };

  // --- NAVIGATION ---
  const handleNext = () => setState(s => ({ ...s, step: Math.min(s.step + 1, 9) }));
  const handleBack = () => setState(s => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const handleGenerate = async () => {
    updateState({ isProcessing: true });
    
    if (state.processingMode === 'server') {
        try {
            // Server-side processing logic
            const formData = new FormData();

            // We need to send the entire state except some fields like history or large buffers
            const exportState = { ...state, history: [], audioFile: null, audioUrl: null };
            formData.append('config', JSON.stringify(exportState));

            if (state.audioFile) {
                formData.append('audio', state.audioFile);
            }

            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Server error');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGeneratedVideoUrl(url);
            setGeneratedExtension(state.format || 'mp4');
            updateState({ isProcessing: false });
            addToHistory();
        } catch (error: any) {
            alert("خطأ في المعالجة على السيرفر: " + error.message);
            updateState({ isProcessing: false });
        }
        return;
    }

    // Pass callback for extension (Phone/Client-side)
    generateVideo(state, audioBuffer, false, (url1, ext) => {
        setGeneratedVideoUrl(url1);
        setGeneratedExtension(ext);
        
        if (state.quranConfig.generateNoTextVariant) {
             setTimeout(() => {
                generateVideo(state, audioBuffer, true, (url2) => {
                    setGeneratedNoTextUrl(url2);
                    updateState({ isProcessing: false });
                    addToHistory();
                });
             }, 500);
        } else {
            updateState({ isProcessing: false });
            addToHistory();
        }
    });
  };

  // --- RENDER COMPONENT BY STEP ---
  const renderStep = () => {
      if (state.step === 1) {
          return <ModeSelectionStep onSelect={(mode) => {
              updateState({ mode, step: 2 });
              if (mode === 'reciter') {
                  updateState({ audioFile: null, audioUrl: null, quranConfig: { ...state.quranConfig, isEnabled: true } });
              }
          }} />;
      }

      if (state.step === 2) {
          if (state.mode === 'upload') {
              return <DetailsStep surahName={state.surahName} readerName={state.readerName} aspectRatio={state.aspectRatio} updateState={updateState} />;
          } else {
              return <ReciterSetupStep state={state} updateState={updateState} />;
          }
      }

      if (state.step === 3) {
          return <BackgroundStep selectedAssets={state.selectedAssets} images={images} videos={videos} loading={loadingAssets} onRefresh={fetchAssets} updateState={updateState} />;
      }

      if (state.mode === 'upload') {
          if (state.step === 4) return <AudioStep state={state} updateState={updateState} audioProps={{ isPlaying, duration, currentTime, isReady, togglePlay }} applyPreset={applyPreset} savePreset={saveCustomPreset} deletePreset={deleteCustomPreset} />;
          if (state.step === 5) return <TextOverlayStep state={state} updateState={updateState} audioDuration={duration} />;
          if (state.step === 6) return <GlobalStyleStep state={state} updateState={updateState} />;
          if (state.step === 7) return <StyleStep state={state} updateState={updateState} />;
          if (state.step === 8) return <QualityStep resolution={state.resolution} fps={state.fps} format={state.format} updateState={updateState} />;
          if (state.step === 9) return <ExportStep state={state} isExporting={isExporting} exportProgress={exportProgress} generatedVideoUrl={generatedVideoUrl} generatedNoTextUrl={generatedNoTextUrl} generatedExtension={generatedExtension} onGenerate={handleGenerate} updateState={updateState} onReset={() => {
              updateState({ step: 1, selectedAssets: [] });
              setImages([]);
              setVideos([]);
              setGeneratedVideoUrl(null);
              setGeneratedNoTextUrl(null);
          }} />;
      }

      if (state.mode === 'reciter') {
          if (state.step === 6) return <GlobalStyleStep state={state} updateState={updateState} />;
          if (state.step === 7) return <StyleStep state={state} updateState={updateState} />;
          if (state.step === 8) return <QualityStep resolution={state.resolution} fps={state.fps} format={state.format} updateState={updateState} />;
          if (state.step === 9) return <ExportStep state={state} isExporting={isExporting} exportProgress={exportProgress} generatedVideoUrl={generatedVideoUrl} generatedNoTextUrl={generatedNoTextUrl} generatedExtension={generatedExtension} onGenerate={handleGenerate} updateState={updateState} onReset={() => {
              updateState({ step: 1, selectedAssets: [] });
              setImages([]);
              setVideos([]);
              setGeneratedVideoUrl(null);
              setGeneratedNoTextUrl(null);
          }} />;
      }

      return null;
  };

  const safeNext = () => {
      if (state.mode === 'reciter' && state.step === 3) {
          setState(s => ({ ...s, step: 6 }));
      } else {
          handleNext();
      }
  };
  const safeBack = () => {
      if (state.mode === 'reciter' && state.step === 6) {
          setState(s => ({ ...s, step: 3 }));
      } else {
          handleBack();
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-amiri" dir="rtl">
      
      {/* Header with removed props */}
      <Header />
      
      {/* Removed HistorySidebar component */}

      <main className="max-w-4xl mx-auto p-4 md:p-6 relative pb-24 md:pb-6">
        <StepWizard 
            currentStep={state.step} 
            steps={state.mode === 'upload' ? UPLOAD_MODE_STEPS : RECITER_MODE_STEPS} 
        />

        <div className="bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 min-h-[500px] shadow-2xl relative overflow-hidden flex flex-col">
          
          {renderStep()}

          {!isExporting && !generatedVideoUrl && state.step > 1 && (
            <div className="md:absolute md:bottom-6 md:left-0 md:w-full md:px-8 flex justify-between items-center mt-auto pt-6 md:pt-0">
              <button 
                onClick={safeBack}
                className="flex items-center text-slate-500 hover:text-white disabled:opacity-0 transition-all px-4 py-2"
              >
                <ChevronRight size={20} className="ml-1" /> السابق
              </button>
              
              {state.step < 9 && (
                <button 
                  onClick={safeNext}
                  disabled={
                    (state.step === 2 && state.mode === 'upload' && (!state.surahName || !state.readerName)) ||
                    (state.step === 2 && state.mode === 'reciter' && !state.selectedReciterId) ||
                    (state.step === 3 && state.selectedAssets.length === 0) ||
                    (state.step === 4 && state.mode === 'upload' && !state.audioFile)
                  }
                  className="flex items-center bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed shadow-lg"
                >
                  التالي <ChevronLeft size={20} className="mr-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
