
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
    processingLocation: 'local',
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

  const {
    isExporting, setIsExporting, exportProgress, setExportProgress, generateVideo
  } = useVideoExport();

  // --- Effects ---
  useEffect(() => {
    // 1. Load LocalStorage Data
    const savedPresetId = localStorage.getItem('lastPresetId');
    const savedCustomPresets = localStorage.getItem('customPresets');
    const savedHistory = localStorage.getItem('videoHistory');
    const savedKeys = localStorage.getItem('geminiApiKeys'); 
    const hasSeenDocs = localStorage.getItem('hasSeenDocs');
    const activeJobId = localStorage.getItem('activeJobId');
    
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

    if (activeJobId) {
        resumeJob(activeJobId);
    }

  }, []);

  const resumeJob = async (jobId: string) => {
    updateState({ step: 8, isProcessing: true, processingLocation: 'server' });
    setIsExporting(true);

    let retryCount = 0;
    const poll = async () => {
        try {
            const res = await fetch(`/api/jobs/${jobId}?t=${Date.now()}`);
            if (!res.ok) {
                if (res.status >= 500 && retryCount < 5) {
                    retryCount++;
                    setTimeout(poll, 2000 * retryCount);
                    return;
                }
                localStorage.removeItem('activeJobId');
                updateState({ isProcessing: false });
                setIsExporting(false);
                return;
            }
            const job = await res.json();
            retryCount = 0;

            if (job.status === 'completed') {
                setExportProgress(95);
                const downloadRes = await fetch(`/api/jobs/${jobId}/download?t=${Date.now()}`);
                const blob = await downloadRes.blob();
                const url = URL.createObjectURL(blob);

                localStorage.removeItem('activeJobId');
                setGeneratedVideoUrl(url);
                updateState({ isProcessing: false });
                setIsExporting(false);
                setExportProgress(100);
                addToHistory();
            } else if (job.status === 'failed') {
                localStorage.removeItem('activeJobId');
                updateState({ isProcessing: false });
                setIsExporting(false);
                alert("فشلت المعالجة السابقة على السيرفر");
            } else {
                setExportProgress(job.progress);
                setTimeout(poll, 3000);
            }
        } catch (e) {
            console.error("Resume Job Error", e);
            if (retryCount < 5) {
                retryCount++;
                setTimeout(poll, 3000);
            }
        }
    };
    poll();
  };

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
    <div className="min-h-screen text-slate-200 selection:bg-emerald-500/30 font-amiri" dir="rtl">
      
      <div className="bg-liquid">
        <div className="blob" style={{ top: '-10%', left: '-10%' }}></div>
        <div className="blob" style={{ bottom: '-10%', right: '-10%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}></div>
      </div>

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

      <main className="max-w-4xl mx-auto p-4 md:p-6 relative pb-24 md:pb-6">
        <StepWizard currentStep={state.step} />

        <div className="liquid-glass p-4 md:p-8 min-h-[500px] flex flex-col">
          
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
              onUpdateState={updateState}
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

          {/* Navigation Buttons */}
          {!isExporting && !generatedVideoUrl && (
            <div className="md:absolute md:bottom-6 md:left-0 md:w-full md:px-8 flex justify-between items-center mt-auto pt-6 md:pt-0">
              <button 
                onClick={handleBack}
                disabled={state.step === 1}
                className="flex items-center text-slate-500 hover:text-white disabled:opacity-0 transition-all px-4 py-2"
              >
                <ChevronRight size={20} className="ml-1" /> السابق
              </button>
              
              {state.step < 8 && (
                <button 
                  onClick={handleNext}
                  disabled={
                    (state.step === 1 && (!state.surahName || !state.readerName)) ||
                    (state.step === 2 && state.selectedAssets.length === 0) ||
                    (state.step === 3 && !state.audioFile)
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
