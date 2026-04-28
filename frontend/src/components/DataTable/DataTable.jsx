import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Lock, Eye } from 'lucide-react';
import './DataTable.css';

const DataTable = ({ columns, data, onView, onEdit, onDelete, itemsPerPage = 5, hideActions = () => false }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when data changes (e.g. on search or filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`page-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center empty-state">
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            currentData.map((row, rowIndex) => (
              <tr key={rowIndex} className="animate-fade-in" style={{ animationDelay: `${rowIndex * 50}ms` }}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {(onView || onEdit || onDelete) && (
                  <td className="actions-cell">
                    {hideActions(row) ? (
                      <span title="Elemento de Sistema Protegido" style={{ color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'center' }}><Lock size={16} /></span>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                        {onView && (
                          <button className="icon-btn view-btn" onClick={() => onView(row)} title="Ver detalle" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                            <Eye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button className="icon-btn edit-btn" onClick={() => onEdit(row)} title="Editar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button className="icon-btn delete-btn" onClick={() => onDelete(row)} title="Eliminar" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {data.length > 0 && (
        <div className="pagination-footer">
          <div className="pagination-info">
            Mostrando <span>{startIndex + 1}</span> - <span>{Math.min(endIndex, data.length)}</span> de <span>{data.length}</span> registros
          </div>
          <div className="pagination-actions">
            <button 
              className="pagination-btn" 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="page-numbers">
              {renderPageNumbers()}
            </div>
            <button 
              className="pagination-btn" 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
