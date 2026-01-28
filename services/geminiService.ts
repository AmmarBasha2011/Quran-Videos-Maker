
import { GoogleGenAI } from "@google/genai";
import { Verse, VerseTiming } from "../types";

// --- HELPERS ---

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type || 'audio/mp3', // Fallback mime type
        },
    };
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

let keyIndex = 0;
const getNextKey = (keys: string[]) => {
    if (!keys || keys.length === 0) throw new Error("No API keys provided");
    const key = keys[keyIndex % keys.length];
    keyIndex++;
    return key;
};

// Generic Run Function with Timeout
const runModel = async (
    apiKey: string, 
    modelName: string, 
    audioPart: any, 
    prompt: string
) => {
    const ai = new GoogleGenAI({ apiKey });
    try {
        console.log(`Calling ${modelName}...`);
        
        // Timeout increased to 60 seconds to handle heavy loads
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 60000));
        
        const generate = ai.models.generateContent({
            model: modelName,
            contents: { parts: [audioPart, { text: prompt }] },
            config: {
                // REMOVED thinkingConfig to prevent INVALID_ARGUMENT error on standard models
                temperature: 0.2, 
            }
        });

        const response: any = await Promise.race([generate, timeout]);
        const text = response.text;
        if (!text) throw new Error(`Empty response from ${modelName}`);
        
        // Improved JSON cleaning
        let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Extract JSON array if surrounded by text
        const match = clean.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (match) clean = match[0];

        return clean;
    } catch (e) {
        console.warn(`Error with model ${modelName}:`, e);
        return null; // Return null to signal failure, so pipeline continues
    }
};

// --- PIPELINE DEFINITIONS ---

export type SyncMode = 'fast' | 'medium' | 'heavy';

// Model names preserved exactly as requested
const PIPELINES: Record<SyncMode, string[]> = {
    fast: [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-3-flash',
        'gemini-3-pro'
    ],
    medium: [
        'gemini-2.5-flash', 'gemini-2.5-flash',
        'gemini-2.5-pro', 'gemini-2.5-pro',
        'gemini-3-flash', 'gemini-3-flash',
        'gemini-3-pro', 'gemini-3-pro'
    ],
    heavy: [
        'gemini-2.5-flash', 'gemini-2.5-flash', 'gemini-2.5-flash',
        'gemini-2.5-pro', 'gemini-2.5-pro', 'gemini-2.5-pro',
        'gemini-3-flash', 'gemini-3-flash', 'gemini-3-flash',
        'gemini-3-pro', 'gemini-3-pro', 'gemini-3-pro'
    ]
};

// --- MAIN PIPELINE ---

export const syncAudioWithVersesPipeline = async (
    audioFile: File, 
    verses: Verse[], 
    apiKeys: string[],
    mode: SyncMode,
    onProgress: (msg: string, progress: number) => void
): Promise<VerseTiming[]> => {
    
    if (apiKeys.length === 0) throw new Error("API Keys required");

    const audioPart = await fileToGenerativePart(audioFile);
    // Sort verses by number just to be safe
    const sortedVerses = [...verses].sort((a,b) => a.numberInSurah - b.numberInSurah);
    const versesText = sortedVerses.map((v, i) => `VerseIndex ${i}: ${v.text}`).join('\n');

    const pipeline = PIPELINES[mode];
    let lastResult = "";
    
    // Core Prompt Template
    const getPrompt = (previousAttempt: string | null) => `
    You are an expert Quranic Audio Aligner Tool (Mode: ${mode}).
    
    TASK: Align the provided Quranic Verses with the audio file.
    
    RULES:
    1. Listen to the audio.
    2. Read the Verses.
    3. Break down the audio into small segments (3-5 words max).
    4. Provide start and end times in seconds.
    5. STRICTLY ensure 'endTime' > 'startTime'.
    6. Ensure verses are in correct order (Index 0, then 1, etc).
    
    Input Verses:
    ${versesText}
    
    ${previousAttempt ? `PREVIOUS ATTEMPT (Refine this, fix timing gaps/overlaps): \n${previousAttempt}` : ""}
    
    Output JSON format only (Array of objects): 
    [{ "verseIndex": number, "text": "substring", "startTime": number, "endTime": number }]
    `;

    // Loop through the pipeline
    for (let i = 0; i < pipeline.length; i++) {
        const model = pipeline[i];
        const progress = Math.round(((i + 1) / pipeline.length) * 100);
        onProgress(`Model ${i+1}/${pipeline.length}: ${model}...`, progress);

        const prompt = getPrompt(lastResult || null);
        const result = await runModel(getNextKey(apiKeys), model, audioPart, prompt);

        if (result) {
            // Check if valid JSON
            try {
                JSON.parse(result);
                lastResult = result; // Success, update context for next model
                // We continue refining through the pipeline
                await sleep(500); 
            } catch (e) {
                console.warn(`${model} produced invalid JSON. Skipping result.`);
            }
        } else {
            console.warn(`${model} failed. Moving to next.`);
        }
    }

    onProgress("Finalizing...", 100);

    if (!lastResult) {
        throw new Error("All models failed to generate a valid sync.");
    }
    
    try {
        const timings = JSON.parse(lastResult);
        // Fix Ordering Logic: Sort by verseIndex then startTime
        return timings
            .map((t: any) => ({
                verseIndex: t.verseIndex,
                text: t.text,
                startTime: t.startTime,
                endTime: t.endTime
            }))
            .filter((t: any) => t.text && t.endTime > t.startTime)
            .sort((a: any, b: any) => {
                if (a.verseIndex !== b.verseIndex) return a.verseIndex - b.verseIndex;
                return a.startTime - b.startTime;
            });
    } catch (e) {
        console.error("Final Parse Error", e);
        throw e;
    }
};
