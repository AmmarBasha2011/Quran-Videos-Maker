import React, { useState, useEffect } from 'react';
import { AppState, AudioPreset, UnsplashImage, HistoryItem } from './types';
import { AUDIO_PRESETS } from './constants';
import { fetchIslamicImages } from './services/unsplashService';
import { useAudioProcessing } from './hooks/useAudioProcessing';
import { useVideoExport } from './hooks/useVideoExport';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { StepWizard } from './components/StepWizard';
import { HistorySidebar } from './components/HistorySidebar';
import { ChangelogModal } from './components/ChangelogModal';
import { DetailsStep } from './components/steps/DetailsStep';
import { BackgroundStep } from './components/steps/BackgroundStep';
import { AudioStep } from './components/steps/AudioStep';
import { QualityStep } from './components/steps/QualityStep';
import { StyleStep } from './components/steps/StyleStep';
import { ExportStep } from './components/steps/ExportStep';

const CURRENT_VERSION = '2.1';

export default function App() {
  // --- Global State ---
  const [state, setState] = useState<AppState>({
    step: 1,
    readerName: '',
    surahName: '',
    
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
    
    // Video Settings
    resolution: '1080p',
    fps: 30,
    
    // Style / Typography (Updated defaults)
    surahPosition: { x: 50, y: 50 }, 
    readerPosition: { x: 50, y: 85 },
    
    surahStyle: {
        font: 'Amiri',
        color: '#fbbf24', // Gold
        fontSizeScale: 1,
        hasShadow: true
    },
    readerStyle: {
        font: 'Amiri',
        color: '#ffffff', // White
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
  const [loadingImages, setLoadingImages] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

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
    
    let parsedPresets: AudioPreset[] = [];
    if (savedCustomPresets) {
      try { parsedPresets = JSON.parse(savedCustomPresets); } catch (e) {}
    }

    let parsedHistory: HistoryItem[] = [];
    if (savedHistory) {
        try { parsedHistory = JSON.parse(savedHistory); } catch (e) {}
    }

    setState(s => ({
      ...s,
      customPresets: parsedPresets,
      history: parsedHistory
    }));

    if (savedPresetId) {
      const defaultPreset = AUDIO_PRESETS.find(p => p.id === savedPresetId);
      if (defaultPreset) applyPreset(defaultPreset);
      else {
        const customPreset = parsedPresets.find(p => p.id === savedPresetId);
        if (customPreset) applyPreset(customPreset);
      }
    }

    // 2. Check Version for Changelog Modal
    const lastSeenVersion = localStorage.getItem('app_version');
    if (lastSeenVersion !== CURRENT_VERSION) {
        setShowChangelog(true);
    }

  }, []);

  const fetchImages = async () => {
    setLoadingImages(true);
    // Always fetch a fresh page or random set
    const imgs = await fetchIslamicImages(1);
    setImages(prev => [...prev, ...imgs]); 
    setLoadingImages(false);
  };

  useEffect(() => {
    if (state.step === 2 && images.length === 0) {
      fetchImages();
    }
  }, [state.step]);

  useEffect(() => {
    if (state.step !== 3 && isPlaying) {
        pause();
    }
  }, [state.step, isPlaying, pause]);

  // --- Helper Methods ---
  const updateState = (updates: Partial<AppState>) => setState(s => ({ ...s, ...updates }));

  const closeChangelog = () => {
      setShowChangelog(false);
      localStorage.setItem('app_version', CURRENT_VERSION);
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
          resolution: state.resolution
      };
      const updatedHistory = [newItem, ...state.history];
      updateState({ history: updatedHistory });
      localStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
  };

  // --- Handlers ---
  const handleNext = () => setState(s => ({ ...s, step: Math.min(s.step + 1, 6) }));
  const handleBack = () => setState(s => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const handleGenerate = () => {
    updateState({ isProcessing: true });
    generateVideo(state, audioBuffer, (url) => {
      setGeneratedVideoUrl(url);
      updateState({ isProcessing: false });
      addToHistory();
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-amiri" dir="rtl">
      
      <ChangelogModal isOpen={showChangelog} onClose={closeChangelog} />

      <Header onToggleHistory={() => updateState({ showHistory: !state.showHistory })} />
      
      <HistorySidebar 
        isOpen={state.showHistory} 
        onClose={() => updateState({ showHistory: false })} 
        history={state.history}
      />

      <main className="max-w-4xl mx-auto p-4 md:p-6 relative pb-24 md:pb-6">
        <StepWizard currentStep={state.step} />

        <div className="bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 min-h-[500px] shadow-2xl relative overflow-hidden flex flex-col">
          
          {state.step === 1 && (
            <DetailsStep 
              surahName={state.surahName} 
              readerName={state.readerName} 
              updateState={updateState} 
            />
          )}

          {state.step === 2 && (
            <BackgroundStep 
              selectedAssets={state.selectedAssets}
              images={images}
              loading={loadingImages}
              onRefresh={fetchImages}
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
            <StyleStep 
              state={state}
              updateState={updateState}
            />
          )}

          {state.step === 5 && (
            <QualityStep 
              resolution={state.resolution}
              fps={state.fps}
              updateState={updateState}
            />
          )}

          {state.step === 6 && (
            <ExportStep 
              state={state}
              isExporting={isExporting}
              exportProgress={exportProgress}
              generatedVideoUrl={generatedVideoUrl}
              onGenerate={handleGenerate}
              onReset={() => {
                setGeneratedVideoUrl(null);
                updateState({ step: 1 });
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
              
              {state.step < 6 && (
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