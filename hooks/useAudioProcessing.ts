import { useEffect, useRef, useState, useCallback } from 'react';

interface AudioProcessingProps {
  file: File | null;
  reverbAmount: number; // 0 to 1
  echoAmount: number; // 0 to 1
  normalize: boolean;
}

export const useAudioProcessing = ({ file, reverbAmount, echoAmount, normalize }: AudioProcessingProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Load Audio File
  useEffect(() => {
    if (!file || !audioContextRef.current) return;

    const loadAudio = async () => {
      setIsReady(false);
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      audioBufferRef.current = decodedBuffer;
      setDuration(decodedBuffer.duration);
      setIsReady(true);
      setCurrentTime(0);
      pauseTimeRef.current = 0;
    };

    loadAudio();
  }, [file]);

  // Generate Impulse Response for Reverb
  const getImpulseResponse = useCallback((duration: number, decay: number) => {
    const ctx = audioContextRef.current!;
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = i; // avoid type errors
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  }, []);

  // Play Logic
  const play = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Disconnect old nodes if any
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
        sourceNodeRef.current.disconnect();
    }

    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    
    // Create Nodes
    const masterGain = ctx.createGain();
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain(); // For reverb
    const echoDelay = ctx.createDelay();
    const echoGain = ctx.createGain();
    const reverb = ctx.createConvolver();
    
    // Setup Reverb
    reverb.buffer = getImpulseResponse(2.5, 2.0); // 2.5s simulated hall
    
    // Setup Echo
    echoDelay.delayTime.value = 0.4; // 400ms
    echoGain.gain.value = echoAmount * 0.5;

    // Levels
    // Reverb wet/dry mix logic
    const dryAmt = 1 - (reverbAmount * 0.5);
    const wetAmt = reverbAmount * 2.0;
    
    dryGain.gain.value = normalize ? 0.8 : dryAmt; // Simple normalization sim
    wetGain.gain.value = wetAmt;

    // Routing
    // Source -> Dry -> Master
    source.connect(dryGain);
    dryGain.connect(masterGain);

    // Source -> Reverb -> Wet -> Master
    source.connect(reverb);
    reverb.connect(wetGain);
    wetGain.connect(masterGain);

    // Source -> Echo -> EchoGain -> Master
    // Also feed echo back into itself for decay (simple)
    source.connect(echoDelay);
    echoDelay.connect(echoGain);
    echoGain.connect(masterGain);
    // Simple feedback loop for echo
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3; // Fixed decay
    echoDelay.connect(feedback);
    feedback.connect(echoDelay);

    masterGain.connect(ctx.destination);

    // Store refs to update params live
    sourceNodeRef.current = source;
    reverbNodeRef.current = reverb;
    dryGainNodeRef.current = dryGain;
    wetGainNodeRef.current = wetGain;
    
    // Start playback
    const offset = pauseTimeRef.current % audioBufferRef.current.duration;
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;
    
    setIsPlaying(true);

    source.onended = () => {
        // This triggers when buffer ends or stop is called
        // We only want to set playing false if it naturally ended
        const elapsed = ctx.currentTime - startTimeRef.current;
        if (elapsed >= audioBufferRef.current!.duration) {
            setIsPlaying(false);
            pauseTimeRef.current = 0;
            setCurrentTime(0);
        }
    };
  }, [echoAmount, getImpulseResponse, normalize, reverbAmount]);

  const pause = useCallback(() => {
    if (sourceNodeRef.current && audioContextRef.current) {
        sourceNodeRef.current.stop();
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        pauseTimeRef.current = elapsed;
        setIsPlaying(false);
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  // Live Param Update effect
  useEffect(() => {
    if (!dryGainNodeRef.current || !wetGainNodeRef.current) return;
    
    const dryAmt = 1 - (reverbAmount * 0.5);
    const wetAmt = reverbAmount * 2.0;
    
    dryGainNodeRef.current.gain.setTargetAtTime(normalize ? 0.8 : dryAmt, audioContextRef.current!.currentTime, 0.1);
    wetGainNodeRef.current.gain.setTargetAtTime(wetAmt, audioContextRef.current!.currentTime, 0.1);
    
    // Echo updates would require rebuilding the graph or using AudioParams if accessible. 
    // For simplicity, we restart on play or accept that echo amount is fixed on start in this MVP.
  }, [reverbAmount, normalize]);

  // Update visual progress
  useEffect(() => {
    let frame: number;
    const updateProgress = () => {
        if (isPlaying && audioContextRef.current) {
            const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
            setCurrentTime(elapsed);
            frame = requestAnimationFrame(updateProgress);
        }
    };

    if (isPlaying) {
        frame = requestAnimationFrame(updateProgress);
    }

    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  return {
    isPlaying,
    currentTime,
    duration,
    isReady,
    togglePlay,
    play, // exposed for export
    audioBuffer: audioBufferRef.current
  };
};