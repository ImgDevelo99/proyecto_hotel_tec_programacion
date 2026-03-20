import React from 'react';
import './Card.css';

const Card = ({ children, title, className = '', noPadding = false }) => {
  return (
    <div className={`card glass-panel ${className}`}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className={`card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
