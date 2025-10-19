import { useState, useCallback } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document as PDFDocument, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { Document as DocumentType } from './types';
import './PDFViewer.css';

import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

interface PDFViewerProps {
  document: DocumentType;
}

export default function PDFViewer({ document }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-header">
        <h2>{document.name}</h2>
        <span className="pdf-page-count">
          {numPages ? `${numPages} page${numPages !== 1 ? 's' : ''}` : 'Loading...'}
        </span>
      </div>
      <div className="pdf-viewer-container" ref={setContainerRef}>
        <PDFDocument file={document.file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
          {Array.from(new Array(numPages), (_el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
            />
          ))}
        </PDFDocument>
      </div>
    </div>
  );
}
