import React, { useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const PdfViewer = ({ filename, keyword }) => {
  useEffect(() => {
    const renderPdf = async () => {
      const url = `/pdfs/${filename}`;
      const loadingTask = pdfjsLib.getDocument(url);

      const pdf = await loadingTask.promise;
      const container = document.getElementById('pdf-container');
      container.innerHTML = ''; // Clear previous PDFs

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        container.appendChild(canvas);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        // Highlight text after rendering
        highlightText(page, keyword, viewport, context);
      }
    };

    renderPdf();
  }, [filename, keyword]);

  const highlightText = async (page, keyword, viewport, context) => {
    const textContent = await page.getTextContent();
    context.globalAlpha = 0.4;
    context.fillStyle = 'yellow';

    textContent.items.forEach((item) => {
      if (item.str.toLowerCase().includes(keyword.toLowerCase())) {
        const [x, y] = item.transform.slice(4, 6);
        const width = item.width * viewport.scale;
        const height = Math.abs(item.transform[3]) * viewport.scale;

        const adjustedY = viewport.height - y * viewport.scale - height;
        context.fillRect(x * viewport.scale, adjustedY, width, height);
      }
    });
  };

  return <div id="pdf-container" style={{ display: 'flex', flexDirection: 'column' }} />;
};

export default PdfViewer;
