import React from 'react';

const SearchResults = ({ results, onOpenPdf }) => {
  if (results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <div className="search-results">
      {results.map((result, index) => (
        <div key={index} className="result-item">
          <h4>{result.filename}</h4>
          <p>{result.snippet}</p>
          <button onClick={() => onOpenPdf(result.filename)}>Open PDF</button>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
