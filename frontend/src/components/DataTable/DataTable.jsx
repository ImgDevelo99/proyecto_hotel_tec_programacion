import React from 'react';
import './DataTable.css';

const DataTable = ({ columns, data, onEdit, onDelete }) => {
  return (
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center empty-state">
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="animate-fade-in" style={{ animationDelay: `${rowIndex * 50}ms` }}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="actions-cell">
                    {onEdit && (
                      <button className="icon-btn edit-btn" onClick={() => onEdit(row)}>
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button className="icon-btn delete-btn" onClick={() => onDelete(row)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
