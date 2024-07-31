const API_URL = "https://reo-backend.onrender.com";

window.api = {
  fetchVideos: async (page = 1, page_size = 50) => {
    try {
      const response = await fetch(`${API_URL}/videos/feed?page=${page}&page_size=${page_size}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Map data to the structure used by the frontend
      const mappedData = data.map(video => ({
        external_id: video.external_id, 
        title: video.title,
        description: video.description,
        channelName: video.channel_name,
        thumbnailUrl: video.thumbnail_url,
      }));

      return mappedData;
    } catch (err) {
      console.error('Error fetching videos:', err);
      throw err;
    }
  },

  fetchKeywords: async () => {
    try {
      const response = await fetch(`${API_URL}/keywords`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching keywords:', err);
      throw err;
    }
  },
  
  addKeyword: async (keyword) => {
    try {
      const response = await fetch(`${API_URL}/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keyword),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error adding keyword:', err);
      throw err;
    }
  },
  
  deleteKeyword: async (keywordId) => {
    try {
      const response = await fetch(`${API_URL}/keywords/${keywordId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error deleting keyword:', err);
      throw err;
    }
  },

  createStory: async (storyData) => {
    try {
      const response = await fetch(`${API_URL}/stories/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error creating story:', err);
      throw err;
    }
  },
  
  fetchStories: async () => {
    try {
      const response = await fetch(`${API_URL}/stories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching stories:', err);
      throw err;
    }
  }

};