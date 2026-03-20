import React from 'react';
import './Input.css';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false, isSelect = false, options = [], error }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label" htmlFor={name}>{label} {required && <span className="required-asterisk">*</span>}</label>}
      
      {isSelect ? (
        <select 
          className={`custom-input ${error ? 'input-error' : ''}`}
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange} 
          required={required}
        >
          <option value="" disabled>{placeholder || 'Seleccione una opción'}</option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={`custom-input ${error ? 'input-error' : ''}`}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
