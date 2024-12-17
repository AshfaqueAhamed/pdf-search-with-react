import React, { useState } from "react";
import { searchKeyword } from "./api";
import "./App.css";

function App() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchKeyword(keyword);
    if (data.results) {
      setResults(data.results);
    } else {
      console.error("Error:", data.error);
    }
  };

  return (
    <div className="App">
      <h1>PDF Search Application</h1>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Enter keyword to search"
      />
      <button onClick={handleSearch}>Search</button>

      <div>
        {results.length > 0 ? (
          <ul>
            {results.map((item, index) => (
              <li key={index}>
                <strong>{item.filename}</strong>: {item.snippet}
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}

export default App;
