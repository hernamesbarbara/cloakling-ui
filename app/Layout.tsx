import { useState, useCallback, useRef } from 'react';
import type { Document } from './types';
import PDFViewer from './PDFViewer.tsx';
import './Layout.css';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const validatePDF = (file: File): boolean => {
    return file.type === 'application/pdf';
  };

  const handleFile = (file: File) => {
    if (!validatePDF(file)) {
      setError('Please upload a PDF file. Other file types are not supported.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    const newDocument: Document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      file: file,
      createdAt: new Date(),
    };

    setDocuments(prev => [...prev, newDocument]);
    setSelectedDocument(newDocument);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
  };

  return (
    <div className="layout-container">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {sidebarCollapsed ? '→' : '←'}
        </button>
        {!sidebarCollapsed && (
          <div className="sidebar-content">
            <p className="document-count">
              You have {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
            <div className="document-list">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <span className="document-icon">📄</span>
                  <span className="document-name">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="main-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {selectedDocument ? (
          <PDFViewer document={selectedDocument} />
        ) : (
          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <div className="dropzone-content">
              <p>Drop PDF files here to upload</p>
              <p className="dropzone-hint">or click to select files</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
