import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
    <div className="spinner-border text-primary" style={{ width: 40, height: 40 }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>{text}</span>
  </div>
);

export default LoadingSpinner;
