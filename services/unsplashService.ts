import { UnsplashImage } from '../types';

const ACCESS_KEY = "PAzpNlgKG59yw0eXk3iSXNFabA9RXTQi6ZzKkG4E_80";

export const fetchIslamicImages = async (): Promise<UnsplashImage[]> => {
  if (!ACCESS_KEY) {
    console.warn("Unsplash Access Key not found. Using local mock data.");
    return mockImages();
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=4&query=islamic,mosque,quran,nature,calm&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Unsplash API Error:", error);
    return mockImages();
  }
};

const mockImages = (): UnsplashImage[] => {
  // Return structure matching Unsplash API but with reliable placeholder/public URLs
  return [
    {
      id: 'mock-1',
      urls: {
        regular: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1080&auto=format&fit=crop',
        small: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=400&auto=format&fit=crop',
        full: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1920&auto=format&fit=crop'
      },
      alt_description: 'Islamic architecture silhouette',
      user: { name: 'Abdullah' }
    },
    {
      id: 'mock-2',
      urls: {
        regular: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1080&auto=format&fit=crop',
        small: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=400&auto=format&fit=crop',
        full: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1920&auto=format&fit=crop'
      },
      alt_description: 'Quran Recitation',
      user: { name: 'Tarik' }
    },
    {
      id: 'mock-3',
      urls: {
        regular: 'https://images.unsplash.com/photo-1542358936-22421dc2e3c0?q=80&w=1080&auto=format&fit=crop',
        small: 'https://images.unsplash.com/photo-1542358936-22421dc2e3c0?q=80&w=400&auto=format&fit=crop',
        full: 'https://images.unsplash.com/photo-1542358936-22421dc2e3c0?q=80&w=1920&auto=format&fit=crop'
      },
      alt_description: 'Sheikh Zayed Mosque',
      user: { name: 'Ali' }
    },
    {
      id: 'mock-4',
      urls: {
        regular: 'https://images.unsplash.com/photo-1478131333081-3091b207d5d6?q=80&w=1080&auto=format&fit=crop',
        small: 'https://images.unsplash.com/photo-1478131333081-3091b207d5d6?q=80&w=400&auto=format&fit=crop',
        full: 'https://images.unsplash.com/photo-1478131333081-3091b207d5d6?q=80&w=1920&auto=format&fit=crop'
      },
      alt_description: 'Starry Sky',
      user: { name: 'Kareem' }
    }
  ];
};