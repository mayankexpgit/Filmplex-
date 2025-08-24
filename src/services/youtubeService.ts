import axios from 'axios';

const API_KEY = process.env.YOUTUBE_API_KEY;
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchYouTubeTrailer = async (title: string, year: number): Promise<string | undefined> => {
  if (!API_KEY) {
    console.warn('YouTube API key is not configured. Skipping trailer search.');
    return undefined;
  }

  const query = `${title} (${year}) Official Trailer`;

  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        key: API_KEY,
        type: 'video',
        maxResults: 5, // Look at top 5 results
      },
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
      console.log(`No YouTube trailer found for "${query}"`);
      return undefined;
    }
    
    // Find the most likely official trailer
    // Prioritize results with "official" and "trailer" in the title
    const officialTrailer = items.find((item: any) => 
        item.snippet.title.toLowerCase().includes('official trailer')
    );
     if (officialTrailer) {
        return `https://www.youtube.com/watch?v=${officialTrailer.id.videoId}`;
    }

    const anyTrailer = items.find((item: any) => 
        item.snippet.title.toLowerCase().includes('trailer')
    );
     if (anyTrailer) {
        return `https://www.youtube.com/watch?v=${anyTrailer.id.videoId}`;
    }

    // If no specific trailer is found, return the first result
    const firstResultId = items[0].id.videoId;
    return `https://www.youtube.com/watch?v=${firstResultId}`;

  } catch (error: any) {
    console.error('Error fetching from YouTube API:', error.response?.data || error.message);
    // Don't throw an error, just return undefined so the main flow can continue
    return undefined;
  }
};
