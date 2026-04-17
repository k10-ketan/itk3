import { useRef, useState } from 'react';

const MAX_FILES = 3;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const DocumentUpload = ({ files, setFiles, existingCount = 0 }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);

  const remaining = MAX_FILES - existingCount;

  const validate = (fileList) => {
    const errs = [];
    const valid = [];

    for (const file of fileList) {
      if (file.type !== 'application/pdf') {
        errs.push(`"${file.name}" is not a PDF.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errs.push(`"${file.name}" exceeds 5 MB.`);
        continue;
      }
      if (files.length + valid.length >= remaining) {
        errs.push(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      valid.push(file);
    }

    setErrors(errs);
    return valid;
  };

  const addFiles = (fileList) => {
    const valid = validate(Array.from(fileList));
    if (valid.length) setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📎</div>
        <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.25rem' }}>
          Drop PDFs here or click to browse
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          PDF only · Max {MAX_FILES} files · Max 5 MB each · {remaining - files.length} remaining
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
          id="document-upload-input"
        />
      </div>

      {/* Errors */}
      {errors.map((err, i) => (
        <div key={i} className="error-text">{err}</div>
      ))}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((file, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                background: '#334155', borderRadius: '0.5rem',
                border: '1px solid #475569',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatSize(file.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                style={{
                  background: 'rgba(239,68,68,0.15)', border: 'none',
                  color: '#f87171', borderRadius: '0.375rem', cursor: 'pointer',
                  padding: '0.25rem 0.5rem', fontSize: '0.75rem',
                }}
                aria-label={`Remove ${file.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
