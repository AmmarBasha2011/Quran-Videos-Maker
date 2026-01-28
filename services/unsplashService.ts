
import { UnsplashImage } from '../types';

// NOTE: Client-side demo key placeholder.
const PEXELS_API_KEY = ""; 

export interface StockAsset {
    id: string;
    url: string; 
    thumbnail: string;
    duration: number; 
    title: string;
    type: 'video';
}

export type StockVideo = StockAsset;

// Huge list of diverse queries to ensure 50 distinct images every time
const SEARCH_QUERIES = [
    "Islamic architecture", "Mosque interior", "Desert stars", "Night sky clouds", 
    "Nature calm", "Abstract dark flow", "Quran book", "Ramadan lantern", 
    "Blue mosque", "Mecca kaaba", "Madina green dome", "Forest rays",
    "Ocean sunset", "Mountain mist", "Candle light", "Islamic Geometric Patterns",
    "Old Paper Texture", "Space Galaxy", "Underwater Calm", "Sand Dunes",
    "Morning Fog", "Minaret Silhouette", "Tasbih beads", "Praying hands silhouette",
    "Golden hour desert", "Moroccan mosaic", "Persian rug details", "Cloud timelapse",
    "Starry night", "Moon phases", "Water ripple", "Ink drop in water",
    "Smoke abstract", "Gold particles", "Vintage book pages", "Olive tree",
    "Date palm", "Desert oasis", "Rain on window", "Soft bokeh lights"
];

// Helper to get N unique random queries
const getRandomQueries = (count: number) => {
    const shuffled = [...SEARCH_QUERIES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const fetchPexelsAssets = async (): Promise<{ images: UnsplashImage[], videos: StockAsset[] }> => {
    // Goal: Fetch 50 unique images
    // Strategy: Fire multiple parallel requests with different queries to Pexels
    
    const uniqueImages = new Map<string, UnsplashImage>();
    const targetCount = 50;
    
    // Select 5 distinct topics for this batch to get variety
    const queries = getRandomQueries(5); 

    try {
        // If no key, fallback immediately
        if (!PEXELS_API_KEY) throw new Error("No Key");

        const requests = queries.map(q => 
            fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=15`, {
                headers: { Authorization: PEXELS_API_KEY }
            }).then(r => r.json())
        );

        const results = await Promise.all(requests);

        results.forEach((data, index) => {
            if (data && data.photos) {
                data.photos.forEach((p: any) => {
                    if (!uniqueImages.has(p.id.toString())) {
                        uniqueImages.set(p.id.toString(), {
                            id: p.id.toString(),
                            urls: {
                                regular: p.src.large2x || p.src.large,
                                small: p.src.medium,
                                full: p.src.original
                            },
                            alt_description: p.alt || queries[index],
                            user: { name: p.photographer }
                        });
                    }
                });
            }
        });

    } catch (e) {
        console.warn("Pexels API failed or no key, using robust mocks.", e);
        // Fallback to mocks
        const mocks = getRobustMocks(50);
        return { images: mocks, videos: [] };
    }

    // Convert Map to Array and shuffle
    const images = Array.from(uniqueImages.values()).sort(() => 0.5 - Math.random()).slice(0, 50);
    
    // Fallback if API returned too few images (fill with mocks)
    if (images.length < 10) {
        const mocks = getRobustMocks(50 - images.length);
        return { images: [...images, ...mocks], videos: [] };
    }

    return { images, videos: [] };
};

// --- ROBUST MOCKS (Simulating Pexels) ---

const getRobustMocks = (count: number): UnsplashImage[] => {
    // A curated list of high-quality reliable IDs for demo purposes
    const baseImages = [
        "photo-1534447677768-be436bb09401", "photo-1507646870321-4e4d7c6a9925", "photo-1518049046844-9c05475b4f3b",
        "photo-1470813740244-df37b8c1edcb", "photo-1504194921103-f8b80c338d4d", "photo-1419242902214-272b3f66ee7a",
        "photo-1532274402911-5a369e4c4bb5", "photo-1505322022379-7c3353ee6291", "photo-1464802686167-b939a6910659",
        "photo-1489549132488-d00b7eee80f1", "photo-1516339901601-2e1b87a07c13", "photo-1504608524841-42fe6f032b4b",
        "photo-1555677284-6a6f9716399a", "photo-1564121211835-e88c852648ab", "photo-1542351567-cd7b04169d42",
        "photo-1518531933037-91b2f5f229cc", "photo-1497215728101-856f4ea42174", "photo-1500964757637-c85e8a162699",
        "photo-1465146344425-f00d5f5c8f07", "photo-1475924156734-496f6cac6ec1", "photo-1433086966358-54859d0ed716",
        "photo-1439853949127-fa647821eba0", "photo-1472214103451-9374bd1c798e", "photo-1441974231531-c6227db76b6e"
    ];

    const results: UnsplashImage[] = [];
    const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];

    for (let i = 0; i < count; i++) {
        const baseId = baseImages[i % baseImages.length];
        results.push({
            id: `mock-img-${i}-${Date.now()}-${Math.random()}`,
            urls: {
                regular: `https://images.unsplash.com/${baseId}?q=80&w=1080&auto=format&fit=crop`,
                small: `https://images.unsplash.com/${baseId}?q=80&w=400&auto=format&fit=crop`,
                full: `https://images.unsplash.com/${baseId}?q=80&w=1920&auto=format&fit=crop`
            },
            alt_description: query,
            user: { name: 'Pexels Artist' }
        });
    }

    // Shuffle
    return results.sort(() => 0.5 - Math.random());
};

export const fetchIslamicImages = async () => []; 
export const fetchStockVideos = async () => [];
