// API helper file to call Flask backend
const BASE_URL = "http://localhost:5001";

export const searchKeyword = async (keyword) => {
  try {
    const response = await fetch(`${BASE_URL}/search?keyword=${keyword}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return { error: "Failed to fetch data" };
  }
};
