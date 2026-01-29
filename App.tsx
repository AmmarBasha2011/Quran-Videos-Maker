
import React, { useState, useEffect } from 'react';
import { AppState, AudioPreset, UnsplashImage, HistoryItem, AspectRatio, QuranConfig } from './types';
import { AUDIO_PRESETS } from './constants';
import { fetchPexelsAssets, StockAsset } from './services/unsplashService'; // Updated Service
import { useAudioProcessing } from './hooks/useAudioProcessing';
import { useVideoExport } from './hooks/useVideoExport';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { StepWizard } from './components/StepWizard';
import { HistorySidebar } from './components/HistorySidebar';
import { DocumentationModal } from './components/DocumentationModal';
import { DetailsStep } from './components/steps/DetailsStep';
import { BackgroundStep } from './components/steps/BackgroundStep';
import { AudioStep } from './components/steps/AudioStep';
import { TextOverlayStep } from './components/steps/TextOverlayStep'; 
import { GlobalStyleStep } from './components/steps/GlobalStyleStep'; 
import { QualityStep } from './components/steps/QualityStep';
import { StyleStep } from './components/steps/StyleStep';
import { ExportStep } from './components/steps/ExportStep';

const CURRENT_VERSION = '3.0'; 

export default function App() {
  // --- Global State ---
  const [state, setState] = useState<AppState>({
    step: 1,
    readerName: '',
    surahName: '',
    
    // Video Config
    aspectRatio: '16:9', 

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

  const [showDocs, setShowDocs] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // --- Hooks ---
  const { 
    isPlaying, currentTime, duration, isReady, togglePlay, play, pause, audioBuffer 
  } = useAudioProcessing({
    file: state.audioFile,
    reverbAmount: state.reverbAmount,
    echoAmount: state.echoAmount,
    normalize: state.isNormalized
  });

  const { isExporting, exportProgress, generateVideo } = useVideoExport();

  // --- Effects ---
  useEffect(() => {
    // 1. Load LocalStorage Data
    const savedPresetId = localStorage.getItem('lastPresetId');
    const savedCustomPresets = localStorage.getItem('customPresets');
    const savedHistory = localStorage.getItem('videoHistory');
    const savedKeys = localStorage.getItem('geminiApiKeys'); 
    const hasSeenDocs = localStorage.getItem('hasSeenDocs');
    
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

    // First time user check
    if (!hasSeenDocs) {
        setShowDocs(true);
    }

  }, []);

  // Time Estimation Effect
  useEffect(() => {
    if (isExporting) {
        if (exportProgress <= 20) {
            setStartTime(Date.now());
        } else {
            const elapsed = Date.now() - startTime;
            const realProgress = (exportProgress - 20) / 80;
            
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

  const fetchAssets = async () => {
    setLoadingAssets(true);
    const { images: newImages, videos: newVideos } = await fetchPexelsAssets();
    setImages(newImages);
    setVideos(newVideos);
    setLoadingAssets(false);
  };

  useEffect(() => {
    if (state.step === 2) {
      fetchAssets();
    }
  }, [state.step]);

  useEffect(() => {
    if (state.step !== 3 && isPlaying) {
        pause();
    }
  }, [state.step, isPlaying, pause]);

  const updateState = (updates: Partial<AppState>) => setState(s => ({ ...s, ...updates }));
  
  const closeDocs = () => {
      setShowDocs(false);
      localStorage.setItem('hasSeenDocs', 'true');
  };

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

  const handleNext = () => setState(s => ({ ...s, step: Math.min(s.step + 1, 8) }));
  const handleBack = () => setState(s => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const handleGenerate = async () => {
    updateState({ isProcessing: true });
    
    // 1. Generate Main Video (With Text)
    generateVideo(state, audioBuffer, false, (url1) => {
        setGeneratedVideoUrl(url1);
        
        // 2. Check if No-Text variant is requested
        if (state.quranConfig.generateNoTextVariant && state.quranConfig.isEnabled) {
             // Small delay to let UI breathe
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

  return (
    <div className="h-[100dvh] overflow-hidden text-slate-200 selection:bg-purple-500/30 font-amiri flex flex-col relative" dir="rtl">
      
      <DocumentationModal isOpen={showDocs} onClose={closeDocs} />

      <Header 
        onToggleHistory={() => updateState({ showHistory: !state.showHistory })} 
        onToggleDocs={() => setShowDocs(true)}
      />
      
      <HistorySidebar 
        isOpen={state.showHistory} 
        onClose={() => updateState({ showHistory: false })} 
        history={state.history}
      />

      <main className="flex-1 flex flex-col p-3 md:p-8 relative overflow-hidden">
        <div className="mb-4">
            <StepWizard currentStep={state.step} />
        </div>

        <div className="flex-1 glass-card rounded-[2rem] p-4 md:p-10 shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-700">
          
          {/* Subtle Decorative Blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
          {state.step === 1 && (
            <DetailsStep 
              surahName={state.surahName} 
              readerName={state.readerName} 
              aspectRatio={state.aspectRatio}
              updateState={updateState} 
            />
          )}

          {state.step === 2 && (
            <BackgroundStep 
              selectedAssets={state.selectedAssets}
              images={images}
              videos={videos}
              loading={loadingAssets}
              onRefresh={fetchAssets}
              updateState={updateState}
            />
          )}

          {state.step === 3 && (
            <AudioStep 
              state={state} 
              updateState={updateState}
              audioProps={{ isPlaying, duration, currentTime, isReady, togglePlay }}
              applyPreset={applyPreset}
              savePreset={saveCustomPreset}
              deletePreset={deleteCustomPreset}
            />
          )}

          {state.step === 4 && (
            <TextOverlayStep 
              state={state}
              updateState={updateState}
              audioDuration={duration}
            />
          )}

          {state.step === 5 && (
            <GlobalStyleStep 
              state={state}
              updateState={updateState}
            />
          )}

          {state.step === 6 && (
            <StyleStep 
              state={state}
              updateState={updateState}
            />
          )}

          {state.step === 7 && (
            <QualityStep 
              resolution={state.resolution}
              fps={state.fps}
              format={state.format}
              updateState={updateState}
            />
          )}

          {state.step === 8 && (
            <ExportStep 
              state={state}
              isExporting={isExporting}
              exportProgress={exportProgress}
              generatedVideoUrl={generatedVideoUrl}
              generatedNoTextUrl={generatedNoTextUrl}
              onGenerate={handleGenerate}
              onReset={() => {
                setGeneratedVideoUrl(null);
                setGeneratedNoTextUrl(null);
                updateState({ step: 1 });
                setImages([]); 
                setVideos([]);
              }}
            />
          )}

          </div>

          {/* Navigation Buttons - Mobile Weighted */}
          {!isExporting && !generatedVideoUrl && (
            <div className="absolute bottom-4 left-4 right-4 md:static md:w-full md:mt-auto flex justify-between items-center bg-black/20 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-2 md:p-0 rounded-2xl border border-white/5 md:border-none shadow-xl md:shadow-none z-50">
              <button 
                onClick={handleBack}
                disabled={state.step === 1}
                className="flex items-center text-slate-400 hover:text-white disabled:opacity-0 transition-all px-5 py-3 rounded-xl hover:bg-white/5"
              >
                <ChevronRight size={22} className="ml-1" /> السابق
              </button>
              
              {state.step < 8 && (
                <button 
                  onClick={handleNext}
                  disabled={
                    (state.step === 1 && (!state.surahName || !state.readerName)) ||
                    (state.step === 2 && state.selectedAssets.length === 0) ||
                    (state.step === 3 && !state.audioFile)
                  }
                  className="liquid-button shiny-reflection flex items-center px-8 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed overflow-hidden"
                >
                  التالي <ChevronLeft size={22} className="mr-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
