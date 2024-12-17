export const searchPDFs = async (keyword) => {
    try {
      const response = await fetch(`/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) throw new Error('Error fetching search results');
      return await response.json();
    } catch (error) {
      console.error('Search Error:', error);
      return { results: [] };
    }
  };
  