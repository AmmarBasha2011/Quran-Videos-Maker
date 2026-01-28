import { UnsplashImage } from '../types';

const ACCESS_KEY = "PAzpNlgKG59yw0eXk3iSXNFabA9RXTQi6ZzKkG4E_80";

// Helper to randomize array order (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- IMAGES (Unsplash - Dark Blue / Spiritual) ---

export const fetchIslamicImages = async (page: number = 1): Promise<UnsplashImage[]> => {
  if (!ACCESS_KEY) {
    return shuffleArray(mockImages());
  }

  try {
    // Query focused on "Dark Blue", "Spiritual", "Night", "Mosque"
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=24&query=dark+blue+mosque,night+sky+stars,midnight+blue+abstract,islamic+pattern+dark,spiritual+night,deep+ocean+night,dark+nature&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
        return shuffleArray(mockImages());
    }

    const data = await response.json();
    return shuffleArray(data);
  } catch (error) {
    console.warn("Unsplash API unavailable, using fallback gallery.");
    return shuffleArray(mockImages());
  }
};

const mockImages = (): UnsplashImage[] => {
  // Fallback list of Dark/Blue/Spiritual backgrounds
  const curatedIds = [
      "photo-1534447677768-be436bb09401", // Night Sky
      "photo-1507646870321-4e4d7c6a9925", // Blue Mosque
      "photo-1518049046844-9c05475b4f3b", // Dark Blue Forest
      "photo-1470813740244-df37b8c1edcb", // Stars
      "photo-1504194921103-f8b80c338d4d", // Dark Abstract
      "photo-1419242902214-272b3f66ee7a", // Starry Night
      "photo-1532274402911-5a369e4c4bb5", // Dark Landscape
      "photo-1505322022379-7c3353ee6291", // Midnight
      "photo-1464802686167-b939a6910659", // Galaxy
      "photo-1489549132488-d00b7eee80f1", // Dark Mountains
      "photo-1516339901601-2e1b87a07c13", // Dark Aurora
      "photo-1504608524841-42fe6f032b4b", // Deep Atmosphere
      "photo-1528722828814-77b9b8a90e35", // Dark Pattern
      "photo-1580137189272-c9379f8864fd", // Blue Geometric
  ];

  const mocks = curatedIds.map((id, index) => ({
    id: `mock-${index}`,
    urls: {
      regular: `https://images.unsplash.com/${id}?q=80&w=1080&auto=format&fit=crop`,
      small: `https://images.unsplash.com/${id}?q=80&w=400&auto=format&fit=crop`,
      full: `https://images.unsplash.com/${id}?q=80&w=1920&auto=format&fit=crop`
    },
    alt_description: 'Islamic Background',
    user: { name: 'Unsplash Photographer' }
  }));

  return shuffleArray(mocks);
};

// --- VIDEOS DISABLED ---

export interface StockVideo {
    id: string;
    url: string; 
    thumbnail: string;
    duration: number; 
    title: string;
}

export const fetchStockVideos = async (): Promise<StockVideo[]> => {
    // Videos disabled as per request
    return [];
};