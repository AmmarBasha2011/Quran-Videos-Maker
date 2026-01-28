
import { Verse } from '../types';

export const fetchQuranVerses = async (surah: number, from: number, to: number): Promise<Verse[]> => {
    try {
        const verses: Verse[] = [];
        // Fetch each verse individually as requested by user preference logic, or batch if possible.
        // alquran.cloud supports fetching a range: /surah/{surah}/{edition}?offset={offset}&limit={limit}
        // Offset is 0-based index. fromAyah 1 = offset 0.
        
        const offset = from - 1;
        const limit = to - from + 1;
        
        // Using Uthmani script as requested
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/quran-uthmani?offset=${offset}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch verses");
        }

        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.ayahs) {
            return data.data.ayahs.map((ayah: any) => ({
                text: ayah.text,
                numberInSurah: ayah.numberInSurah,
                surahNumber: surah
            }));
        }
        
        return [];
    } catch (error) {
        console.error("Quran Fetch Error:", error);
        throw error;
    }
};
