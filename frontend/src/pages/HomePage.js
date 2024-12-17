import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import PdfViewer from '../components/PdfViewer';
import { searchPDFs } from '../services/searchService';

const HomePage = () => {
  const [results, setResults] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [keyword, setKeyword] = useState('');

  const handleSearch = async (inputKeyword) => {
    setKeyword(inputKeyword);
    const data = await searchPDFs(inputKeyword);
    setResults(data.results || []);
  };

  const openPdf = (filename) => {
    setSelectedPdf(filename);
  };

  return (
    <div>
      <h1>PDF Search Application</h1>
      <SearchBar onSearch={handleSearch} />
      <SearchResults results={results} onOpenPdf={openPdf} />
      {selectedPdf && <PdfViewer filename={selectedPdf} keyword={keyword} />}
    </div>
  );
};

export default HomePage;
