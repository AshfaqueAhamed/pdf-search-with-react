// Using pdf.js library
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const canvasContainer = document.getElementById('canvas-container'); // Add a container for multiple pages

// Search button
searchBtn.addEventListener('click', async () => {
  const keyword = searchInput.value.trim();
  
  if (!keyword) {
    alert('Please enter a keyword to search.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:5001/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error('Error fetching search results');

    const data = await response.json();

    if (data.results.length === 0) {
      searchResults.innerHTML = '<p>No results found.</p>';
      return;
    }

    searchResults.innerHTML = data.results
      .map(result => `
        <div class="result-item">
          <p><strong>${result.filename}</strong></p>
          <p>${result.snippet}</p>
          <button onclick="openPdf('${result.filename}', '${keyword}')">Open PDF</button>
          <button onclick="openPdfInViewer('${result.filename}', '${keyword}')">Open in Default Viewer</button>
        </div>
      `)
      .join('');
  } catch (error) {
    console.error('Search Error:', error);
    searchResults.innerHTML = '<p>An error occurred while searching. Please try again.</p>';
  }
});

async function openPdf(filename, keyword) {
  const url = `http://localhost:5001/pdfs/${filename}`;
  console.log("Fetching PDF from URL:", url); 
  const loadingTask = pdfjsLib.getDocument(url);

  try {
    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully!");
    const numPages = pdf.numPages;
    canvasContainer.innerHTML = ''; // Clear previous PDFs

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvasContainer.appendChild(canvas);

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      };

      // Render the page on the canvas
      await page.render(renderContext).promise;

      // Highlight search results
      highlightText(page, keyword, viewport, canvas);
    }
  } catch (error) {
    console.error("PDF Loading Error:", error);
    alert("Error loading the PDF. Please check the file and path.");
  }
}


async function openPdfInViewer(filename, keyword) {
  // The URL of the PDF for opening in default viewer
  const url = `http://localhost:5001/pdfs/${filename}`;

  // This will open the PDF in the browser's default PDF viewer (Chrome's built-in viewer)
  // The query parameter "search" is used to pre-fill the search bar with the keyword.
  const viewerUrl = `${url}#search=${encodeURIComponent(keyword)}`;

  window.open(viewerUrl, '_blank');
}

async function highlightText(page, keyword, viewport, canvas) {
  const textContent = await page.getTextContent();
  const context = canvas.getContext('2d');

  context.globalAlpha = 0.4; // Transparency for the highlight
  context.fillStyle = 'yellow'; // Highlight color

  textContent.items.forEach((item) => {
    const text = item.str;
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      const [x, y] = item.transform.slice(4, 6); // Extract x and y from transform
      const width = item.width * viewport.scale; // Adjust width for scale
      const fontHeight = Math.abs(item.transform[3]) * viewport.scale; // Extract font height from transform matrix

      // Adjust Y-coordinate for canvas's coordinate system
      const adjustedY = viewport.height - y * viewport.scale - fontHeight;

      // Draw the highlight
      context.fillRect(x * viewport.scale, adjustedY, width, fontHeight);
    }
  });
}

